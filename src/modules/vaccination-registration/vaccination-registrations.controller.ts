import { Body, Controller, Post, Get, Patch, Param, ParseIntPipe, UseGuards, Request } from '@nestjs/common'

import { VaccinationSchedulesService } from './vaccination-registrations.service'
import { CreateVaccinationScheduleDto } from './dto/create-vaccination-registration.dto'
import { UpdateVaccinationScheduleDto } from './dto/update-vaccination-registration.dto'
import { VaccinesService } from '../vaccines/vaccines.service'
import { Roles } from '@/common/decorators/roles.decorator'
import { UserRole } from '@/common/user-role'
import { JwtAuthGuard } from '@/auth/passport/jwt-auth.guard'
import { RolesGuard } from '@/common/guards/roles.guard'


@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('vaccination-schedules')
export class VaccinationSchedulesController {
  constructor(
    private readonly vaccinationSchedulesService: VaccinationSchedulesService,
    private readonly vaccinesService: VaccinesService
) {}

  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE)
  @Post()
  create(@Body() dto: CreateVaccinationScheduleDto) {
    return this.vaccinationSchedulesService.create(dto)
  }

  @Get('vaccination-staff')
  findVaccinationStaff() {
    return this.vaccinationSchedulesService.findVaccinationStaff()
  }

  @Get('vaccines')
  getAllVaccine() {
    return this.vaccinesService.getVaccines()
  }

  @Get('locations')
  getAllLocation() {
    return this.vaccinationSchedulesService.getAllLocation()
  }

  @Get()
  getAllSchedule(@Request() req) {
     console.log('REQ USER:', req.user)
    return this.vaccinationSchedulesService.getAllSchedule(
      req.user?.user_id
    )
  }

  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE)
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateVaccinationScheduleDto) {
    return this.vaccinationSchedulesService.update(id, dto)
  }
  
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE)
  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.vaccinationSchedulesService.findOneById(id)
  }

  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE)
  @Patch('cancel/:id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.vaccinationSchedulesService.delete(id)
  }
}