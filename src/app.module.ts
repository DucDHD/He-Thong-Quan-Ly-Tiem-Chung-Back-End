import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { databaseConfig } from './config/database.config'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UsersModule } from './modules/users/users.module'
import { AuthModule } from './auth/auth.module'
import { VaccinesModule } from './modules/vaccines/vaccines.module'
import { VaccinationSchedulesModule } from './modules/vaccination-registration/vaccination-registrations.module'
import { VaccinationBookingsModule } from './modules/vaccination-bookings/vaccination-bookings.module'
import { InvoiceModule } from './modules/invoice/invoice.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    TypeOrmModule.forRootAsync(databaseConfig),
    UsersModule,
    AuthModule,
    VaccinesModule,
    VaccinationSchedulesModule,
    VaccinationBookingsModule,
    InvoiceModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
