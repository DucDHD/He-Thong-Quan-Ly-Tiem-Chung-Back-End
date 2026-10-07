import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { In, Repository } from 'typeorm'
import { VaccinationBooking, VaccinationBookingStatus } from './entities/vaccination-booking.entity'
import { VaccinationSchedule } from '../vaccination-registration/entities/vaccination-registration.entity'
import { CreateVaccinationBookingDto } from './dto/create-vaccination-booking.dto'
import { InvoiceService } from '../invoice/invoice.service'
import { VaccinationRecord } from './entities/vaccination-record.entity'

@Injectable()
export class VaccinationBookingsService {
  constructor(
    @InjectRepository(VaccinationRecord)
    private readonly vaccinationRecordRepository: Repository<VaccinationRecord>,

    @InjectRepository(VaccinationBooking)
    private readonly vaccinationBookingRepository: Repository<VaccinationBooking>,
    private readonly invoiceService: InvoiceService,

    @InjectRepository(VaccinationSchedule)
    private readonly vaccinationScheduleRepository: Repository<VaccinationSchedule>
  ) {}

  async create(dto: CreateVaccinationBookingDto) {
    const schedule = await this.vaccinationScheduleRepository.findOne({
      where: { schedule_id: dto.schedule_id }
    })

    if (!schedule) {
      throw new NotFoundException( 'Không tìm thấy lịch tiêm')
    }

    const existingBooking = await this.vaccinationBookingRepository.findOne({
      where: {
        schedule_id: dto.schedule_id,
        user_id: dto.user_id,
        status: In([
          VaccinationBookingStatus.REGISTERED,
          VaccinationBookingStatus.COMPLETED
        ])
      }
    })

    if (existingBooking) {
       throw new ConflictException({ field: 'schedule_id', message: 'Khách hàng đã đăng ký lịch tiêm này'})
    }

    const registeredCount = await this.vaccinationBookingRepository.count({
      where: {
        schedule_id: dto.schedule_id,
        status: VaccinationBookingStatus.REGISTERED
      }
    })

    if (registeredCount >= schedule.capacity) {
      throw new BadRequestException( 'Lịch tiêm đã đủ số lượng đăng ký')
    }

    const booking = this.vaccinationBookingRepository.create({
      schedule_id: dto.schedule_id,
      user_id: dto.user_id,
      note: dto.note ?? null,
      status: VaccinationBookingStatus.REGISTERED
    })

    return await this.vaccinationBookingRepository.save(booking)
  }

  async getDetail(scheduleId: number) {
    return await this.vaccinationBookingRepository
      .createQueryBuilder('booking')
      .leftJoin(
        'vaccination_schedules',
        'schedule',
        'schedule.schedule_id = booking.schedule_id'
      )
      .leftJoin(
        'vaccines',
        'vaccine',
        'vaccine.vaccine_id = schedule.vaccine_id'
      )
      .leftJoin(
        'users',
        'user',
        'user.user_id = booking.user_id'
      )
      .leftJoin(
        'vaccination_locations',
        'location',
        'location.location_id = schedule.location_id'
      )
      .select([
        // BOOKING
        'booking.booking_id AS booking_id',
        'booking.schedule_id AS schedule_id',
        'booking.user_id AS user_id',
        'booking.note AS note',
        'booking.status AS status',
        'booking.created_at AS created_at',

        // LỊCH TIÊM
        'schedule.vaccination_date AS vaccination_date',
        'schedule.capacity AS capacity',
        'schedule.age AS age',

        // VACCINE
        'vaccine.vaccine_name AS vaccine_name',
        'vaccine.price AS price',

        // ĐỊA ĐIỂM TIÊM
        'schedule.location_id AS location_id',
        'location.location_name AS location_name',
        'location.address AS location_address',

        // NGƯỜI ĐĂNG KÝ
        'user.fullName AS fullName',
        'user.phone AS phone',
        'user.dateOfBirth AS dateOfBirth',
        'user.gender AS gender',
        'user.cccd AS cccd',
        'user.address AS address'
      ])
      .where('booking.schedule_id = :scheduleId', { scheduleId })
      .andWhere('booking.status IN (:...statuses)', {
        statuses: [
          VaccinationBookingStatus.REGISTERED,
          VaccinationBookingStatus.COMPLETED
        ]
      })
      .orderBy('booking.created_at', 'ASC')
      .getRawMany()
  }


  async cancel(id: number) {
    const booking = await this.vaccinationBookingRepository.findOne({
      where: {
        booking_id: id,
        status: VaccinationBookingStatus.REGISTERED
      }
    })

    if (!booking) {
      throw new NotFoundException({ field: 'booking_id',  message: 'Không tìm thấy đăng ký tiêm' })
    }

    booking.status = VaccinationBookingStatus.CANCELLED

    await this.vaccinationBookingRepository.save(booking)

    return {
      message: 'Hủy đăng ký tiêm thành công'
    }
  }

 async completeBooking(booking_id: number) {
    const booking = await this.vaccinationBookingRepository.findOne({
      where: { booking_id }
    })

    if (!booking) {
      throw new NotFoundException('Không tìm thấy lịch đăng ký')
    }

    if (booking.status === VaccinationBookingStatus.COMPLETED) {
      throw new BadRequestException('Lịch tiêm này đã hoàn thành')
    }

    const vaccine = await this.vaccinationScheduleRepository
      .createQueryBuilder('schedule')
      .leftJoin(
        'vaccines',
        'vaccine',
        'vaccine.vaccine_id = schedule.vaccine_id'
      )
      .select([
        'vaccine.vaccine_id AS vaccine_id',
        'vaccine.price AS price'
      ])
      .where('schedule.schedule_id = :scheduleId', {
        scheduleId: booking.schedule_id
      })
      .getRawOne<{ vaccine_id: number; price: string }>()

    if (!vaccine) {
      throw new NotFoundException('Không tìm thấy vaccine')
    }

    const schedule = await this.vaccinationScheduleRepository.findOne({
      where: { schedule_id: booking.schedule_id }
    })

    if (!schedule) {
      throw new NotFoundException('Không tìm thấy lịch tiêm')
    }

    // Đếm bệnh nhân đã tiêm vaccine này bao nhiêu mũi
    const doseCount = await this.vaccinationRecordRepository.count({
      where: {
        user_id: booking.user_id,
        vaccine_id: Number(vaccine.vaccine_id)
      }
    })

    // Tạo hồ sơ mũi tiêm
    const vaccinationRecord = this.vaccinationRecordRepository.create({
      booking_id: booking.booking_id,
      user_id: booking.user_id,
      vaccine_id: Number(vaccine.vaccine_id),
      vaccinator_id: schedule.user_id,
      dose_number: doseCount + 1,
      vaccination_date: new Date()
    })

    // Hoàn thành booking
    booking.status = VaccinationBookingStatus.COMPLETED

    await this.vaccinationBookingRepository.save(booking)

    // Lưu lịch sử tiêm
    await this.vaccinationRecordRepository.save(vaccinationRecord)

    // Tạo hóa đơn
    await this.invoiceService.create({
      booking_id: booking.booking_id,
      user_id: booking.user_id,
      vaccine_id: Number(vaccine.vaccine_id),
      total_amount: Number(vaccine.price)
    })

    return booking
  }

  async getVaccinationHistory(user_id: number) {
  return await this.vaccinationBookingRepository
    .createQueryBuilder('booking')
    .leftJoin(
      'vaccination_schedules',
      'schedule',
      'schedule.schedule_id = booking.schedule_id'
    )
    .leftJoin(
      'vaccines',
      'vaccine',
      'vaccine.vaccine_id = schedule.vaccine_id'
    )
    .leftJoin(
      'vaccination_locations',
      'location',
      'location.location_id = schedule.location_id'
    )
    .leftJoin(
      'vaccination_records',
      'record',
      'record.booking_id = booking.booking_id'
    )
    .leftJoin(
      'users',
      'vaccinator',
      'vaccinator.user_id = record.vaccinator_id'
    )
    .select([
      'booking.booking_id AS booking_id',
      'schedule.vaccination_date AS vaccination_date',
      'vaccine.vaccine_name AS vaccine_name',
      'location.location_name AS location_name',
      'location.address AS location_address',
      'record.dose_number AS dose_number',
      'vaccinator.fullName AS vaccinator_name',
      'booking.status AS status'
    ])
    .where('booking.user_id = :user_id', { user_id })
    .andWhere('booking.status IN (:...statuses)', {
      statuses: [
        VaccinationBookingStatus.REGISTERED,
        VaccinationBookingStatus.COMPLETED
      ]
    })
    .orderBy('schedule.vaccination_date', 'DESC')
    .getRawMany()
}

}