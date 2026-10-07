import { PartialType } from '@nestjs/mapped-types'
import { CreateVaccinationBookingDto } from './create-vaccination-booking.dto'

export class UpdateVaccinationBookingDto extends PartialType(CreateVaccinationBookingDto) {}