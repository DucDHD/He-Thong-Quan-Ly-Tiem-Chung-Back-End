import { Body, Controller, Post, Get, Param, ParseIntPipe, Patch, UseGuards, Request } from '@nestjs/common'
import { VaccinationBookingsService } from './vaccination-bookings.service'
import { CreateVaccinationBookingDto } from './dto/create-vaccination-booking.dto'
import { Roles } from '@/common/decorators/roles.decorator'
import { UserRole } from '@/common/user-role'
import { JwtAuthGuard } from '@/auth/passport/jwt-auth.guard'
import { RolesGuard } from '@/common/guards/roles.guard'


@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('vaccination-bookings')
export class VaccinationBookingsController {
  constructor(private readonly vaccinationBookingsService: VaccinationBookingsService) {}

  @Roles(UserRole.ADMIN, UserRole.PATIENT)
  @Post()
  create(@Body() dto: CreateVaccinationBookingDto) {
    return this.vaccinationBookingsService.create(dto)
  }

  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE)
  @Get('detail/:id')
  findBySchedule(@Param('id', ParseIntPipe) id: number) {
    return this.vaccinationBookingsService.getDetail(id)
  }

  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE)
  @Patch('cancel/:id')
  cancel(@Param('id', ParseIntPipe) id: number) {
    return this.vaccinationBookingsService.cancel(id)
  }

  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE)
  @Patch('complete/:id')
  completeBooking(@Param('id', ParseIntPipe) id: number) {
    return this.vaccinationBookingsService.completeBooking(id)
  }

  @Get('history/:user_id')
  getVaccinationHistory( @Param('user_id', ParseIntPipe) user_id: number ) {
    return this.vaccinationBookingsService.getVaccinationHistory(user_id)
  }
}