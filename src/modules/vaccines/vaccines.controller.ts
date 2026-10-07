import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Put,
  Post,
  Patch,
  UseGuards
} from '@nestjs/common'

import { VaccinesService } from './vaccines.service'
import { CreateVaccineDto } from './dto/create-vaccine.dto'
import { UpdateVaccineDto } from './dto/update-vaccine.dto'
import { RolesGuard } from '@/common/guards/roles.guard'
import { Roles } from '@/common/decorators/roles.decorator'
import { UserRole } from '@/common/user-role'
import { JwtAuthGuard } from '@/auth/passport/jwt-auth.guard'


@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('vaccines')
export class VaccinesController {
  constructor(
    private readonly vaccinesService: VaccinesService
  ) {}

  @Roles(UserRole.ADMIN)
  @Get()
  getVaccines() {
    return this.vaccinesService.getVaccines()
  }

  @Roles(UserRole.ADMIN)
  @Post()
  createVaccine( @Body() createVaccineDto: CreateVaccineDto) {
    return this.vaccinesService.createVaccine(
      createVaccineDto
    )
  }

  @Roles(UserRole.ADMIN)
  @Put(':id')
  updateVaccine( @Param('id', ParseIntPipe) id: number, @Body() updateVaccineDto: UpdateVaccineDto ) {
    return this.vaccinesService.updateVaccine( id, updateVaccineDto
    )
  }

  @Roles(UserRole.ADMIN)
  @Get(':id')
  getVaccineById(  @Param('id', ParseIntPipe) id: number) {
    return this.vaccinesService.getVaccineById(id)
  }

  @Roles(UserRole.ADMIN)
  @Patch('active/:id')
  activeVaccine( @Param('id', ParseIntPipe) id: number, @Body('isActive') isActive: boolean) {
    return this.vaccinesService.activeVaccine(  id, isActive)
  }
}