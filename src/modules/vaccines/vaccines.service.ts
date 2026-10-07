import {
  ConflictException,
  Injectable,
  NotFoundException,
  Logger
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { Vaccine } from './entities/vaccine.entity'
import { CreateVaccineDto } from './dto/create-vaccine.dto'
import { UpdateVaccineDto } from './dto/update-vaccine.dto'
import { successLog } from '@/helpers/logger.helper'


@Injectable()
export class VaccinesService {
  private readonly logger = new Logger(VaccinesService.name)
  constructor(
    @InjectRepository(Vaccine)
    private readonly vaccineRepository: Repository<Vaccine>
  ) {}

  async getVaccines(): Promise<Vaccine[]> {
  return this.vaccineRepository.find({
    where: {
      isActive: true
    },
    order: {
      vaccine_id: 'DESC'
    }
  })
}

  async getVaccineById(id: number): Promise<Vaccine> {
    const vaccine = await this.vaccineRepository.findOne({
      where: { vaccine_id: id, isActive: true }
    })

    if (!vaccine) {
      throw new NotFoundException('Không tìm thấy vaccine')
    }

    return vaccine
  }

  async createVaccine(data: CreateVaccineDto): Promise<Vaccine> {
    const existVaccine = await this.vaccineRepository.findOne({
      where: { vaccine_name: data.vaccine_name }
    })

    if (existVaccine) { 
      throw new ConflictException({ field: 'vaccine_name', message: 'Tên vaccine đã tồn tại'})
    }

    const vaccine = this.vaccineRepository.create({
      ...data,
      isActive: true
    })

    this.logger.log(successLog(`Tạo Vaccine ${data.vaccine_name} thành công`))

    return this.vaccineRepository.save(vaccine)
  }

  async updateVaccine(id: number, data: UpdateVaccineDto): Promise<Vaccine> {
    const vaccine = await this.getVaccineById(id)

    if (data.vaccine_name && data.vaccine_name !== vaccine.vaccine_name) {
      const existVaccine = await this.vaccineRepository.findOne({
        where: { vaccine_name: data.vaccine_name }
      })

      if (existVaccine) {
        throw new ConflictException({ field: 'vaccine_name', message: 'Tên vaccine đã tồn tại'})
      }
    }

    Object.assign(vaccine, data)

    this.logger.log(successLog(`Cập nhập Vaccine ${data.vaccine_name} thành công`))

    return this.vaccineRepository.save(vaccine)
  }

  async activeVaccine(id: number, isActive: boolean): Promise<Vaccine> {
    const vaccine = await this.getVaccineById(id)

    vaccine.isActive = isActive

    this.logger.log(successLog(` Xóa Vaccine thành công`))

    return this.vaccineRepository.save(vaccine)
  }
}