import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { VaccinationSchedule } from './entities/vaccination-registration.entity'
import { VaccinationSchedulesController } from './vaccination-registrations.controller'
import { VaccinationSchedulesService } from './vaccination-registrations.service'
import { User } from '../users/entities/user.entity'
import { VaccinesModule } from '@/modules/vaccines/vaccines.module'
import { VaccinationLocation } from './entities/vaccination-location.entity'


@Module({
  imports: [
    TypeOrmModule.forFeature([VaccinationSchedule, User, VaccinationLocation ]),
    VaccinesModule
    ],
  controllers: [VaccinationSchedulesController],
  providers: [VaccinationSchedulesService]
})
export class VaccinationSchedulesModule {}