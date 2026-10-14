import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { VaccinationBooking } from './entities/vaccination-booking.entity'
import { VaccinationSchedule } from '../vaccination-registration/entities/vaccination-registration.entity'
import { VaccinationBookingsController } from './vaccination-bookings.controller'
import { VaccinationBookingsService } from './vaccination-bookings.service'
import { InvoiceModule } from '../invoice/invoice.module'
import { VaccinationRecord } from './entities/vaccination-record.entity'
import { VaccinationStock } from '@/modules/inventory/entities/vaccination-stock.entity'


@Module({
  imports: [
    TypeOrmModule.forFeature([
      VaccinationBooking,
      VaccinationSchedule,
      VaccinationRecord,
      VaccinationStock
      ]),
    InvoiceModule
  ],
  controllers: [VaccinationBookingsController],
  providers: [VaccinationBookingsService],
  exports: [VaccinationBookingsService]
})
export class VaccinationBookingsModule {}