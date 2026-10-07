import { PartialType } from '@nestjs/mapped-types'
import { CreateVaccinationScheduleDto } from './create-vaccination-registration.dto'

export class UpdateVaccinationScheduleDto extends PartialType(CreateVaccinationScheduleDto) {}