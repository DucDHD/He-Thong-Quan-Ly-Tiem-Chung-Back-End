import { Injectable, Logger, ConflictException, NotFoundException  } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, Not } from 'typeorm'
import { successLog } from '@/helpers/logger.helper'
import { CreateVaccinationScheduleDto } from './dto/create-vaccination-registration.dto'
import { UpdateVaccinationScheduleDto } from './dto/update-vaccination-registration.dto'
import { VaccinationSchedule, VaccinationScheduleStatus } from './entities/vaccination-registration.entity'
import { UserRole } from '@/common/user-role'
import { User } from '@/modules/users/entities/user.entity'
import { VaccinationLocation } from './entities/vaccination-location.entity'


@Injectable()
export class VaccinationSchedulesService {

private readonly logger = new Logger(VaccinationSchedulesService.name)
  constructor(

    @InjectRepository(VaccinationLocation)
    private readonly locationRepository: Repository<VaccinationLocation>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(VaccinationSchedule)
    private readonly vaccinationScheduleRepository: Repository<VaccinationSchedule>
    ) {}

  async create(dto: CreateVaccinationScheduleDto) {


    const vaccinationDate = new Date(dto.vaccination_date)

    const existingSchedule = await this.vaccinationScheduleRepository.findOne({
        where: {
        vaccination_date: vaccinationDate,
        vaccine_id: dto.vaccine_id,
        location_id: dto.location_id
        }
    })

    if (existingSchedule) { 
        throw new ConflictException({ field: 'vaccine_id', message: 'Vaccine này đã có lịch tiêm vào thời gian đã chọn' })
    }

    const schedule = this.vaccinationScheduleRepository.create({
        vaccination_date: new Date(dto.vaccination_date),
        vaccine_id: dto.vaccine_id,
        capacity: dto.capacity,
        age: dto.age,
        user_id: dto.user_id,
        location_id: dto.location_id,
        note: dto.note ?? null
        })

    this.logger.log(successLog(`Đăng ký lịch tiêm thành công`))

    return await this.vaccinationScheduleRepository.save(schedule)
  }

  async findVaccinationStaff() {
    return await this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.role', 'role')
        .where('role.role_code IN (:...roles)', {
        roles: [UserRole.DOCTOR, UserRole.NURSE]
        })
        .andWhere('user.isActive = :isActive', { isActive: true })
        .getMany()
  }

    async getAllLocation() {
        return await this.locationRepository.find({
        order: { location_id: 'ASC' }
        })
    }

  async getAllSchedule(user_id?: number) {
    return await this.vaccinationScheduleRepository
        .createQueryBuilder('schedule')
        .leftJoin(
        'vaccines',
        'vaccine',
        'vaccine.vaccine_id = schedule.vaccine_id'
        )
        .leftJoin(
        'users',
        'user',
        'user.user_id = schedule.user_id'
        )
        .leftJoin(
        'vaccination_locations',
        'location',
        'location.location_id = schedule.location_id'
        )
        .select([
        'schedule.schedule_id AS schedule_id',
        'schedule.vaccination_date AS vaccination_date',
        'schedule.vaccine_id AS vaccine_id',
        'vaccine.vaccine_name AS vaccine_name',
        'schedule.capacity AS capacity',
        'schedule.age AS age',
        'schedule.user_id AS user_id',
        'user.fullName AS fullName',
        'schedule.note AS note',
        'vaccine.price AS price',

        'schedule.location_id AS location_id',
        'location.location_name AS location_name',
        'location.address AS address',

        'schedule.status AS status',
        'schedule.created_at AS created_at',
        'schedule.updated_at AS updated_at'
        ])
        .addSelect(
        `(SELECT COUNT(*)
            FROM vaccination_bookings booking
            WHERE booking.schedule_id = schedule.schedule_id
            AND booking.status = 'REGISTERED')`,
        'registered_count'
        )
        .addSelect(
        `(SELECT TOP 1 booking_user.status
            FROM vaccination_bookings booking_user
            WHERE booking_user.schedule_id = schedule.schedule_id
            AND booking_user.user_id = :user_id
            ORDER BY booking_user.created_at DESC)`,
        'booking_status'
        )
        .where('schedule.status IN (:...statuses)', {
        statuses: [
            VaccinationScheduleStatus.UPCOMING,
            VaccinationScheduleStatus.FULL
        ]
        })
        .setParameter('user_id', user_id ?? 0)
        .orderBy('schedule.vaccination_date', 'ASC')
        .getRawMany()
    }

    async update(id: number, dto: UpdateVaccinationScheduleDto) {
        const schedule = await this.vaccinationScheduleRepository.findOne({
            where: { schedule_id: id }
        })

        if (!schedule) {
            throw new NotFoundException('Không tìm thấy lịch tiêm')
        }

        const vaccinationDate = dto.vaccination_date ? new Date(dto.vaccination_date) : schedule.vaccination_date

        const vaccineId = dto.vaccine_id ?? schedule.vaccine_id

        const existingSchedule = await this.vaccinationScheduleRepository.findOne({
            where: {
                schedule_id: Not(id),
                vaccination_date: vaccinationDate,
                vaccine_id: vaccineId,
                location_id: dto.location_id
            }
        })

        if (existingSchedule) {
            throw new ConflictException({ field: 'vaccine_id', message: 'Vaccine này đã có lịch tiêm vào thời gian đã chọn' })
        }

        schedule.vaccination_date = vaccinationDate
        schedule.vaccine_id = vaccineId
        schedule.capacity = dto.capacity ?? schedule.capacity
        schedule.age = dto.age ?? schedule.age
        schedule.user_id = dto.user_id ?? schedule.user_id
        schedule.location_id = dto.location_id ?? schedule.location_id
        schedule.note = dto.note ?? schedule.note

        this.logger.log(successLog(`Cập nhật lịch tiêm thành công`))

        return await this.vaccinationScheduleRepository.save(schedule)
    }

    async findOneById(id: number) {
        const schedule = await this.vaccinationScheduleRepository.findOne({
            where: { schedule_id: id }
        })

        if (!schedule) {
            throw new NotFoundException('Không tìm thấy lịch tiêm')
        }

        return schedule
    }

  async delete(id: number) {
    await this.vaccinationScheduleRepository.update(
        { schedule_id: id },
        { status: VaccinationScheduleStatus.CANCELLED }
    )
    this.logger.log(successLog(`Xóa lịch tiêm thành công`))
    return {
        message: 'Xóa lịch tiêm thành công'
    }
  }

}