
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
  Req
} from '@nestjs/common'

import { InventoryService } from './inventory.service'
import { CreateVaccineImportDto } from './dto/create-vaccine-import.dto'

import { RolesGuard } from '@/common/guards/roles.guard'
import { JwtAuthGuard } from '@/auth/passport/jwt-auth.guard'
import { Roles } from '@/common/decorators/roles.decorator'
import { UserRole } from '@/common/user-role'
import { CreateVaccineExportDto } from './dto/create-vaccine-export.dto'


@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('inventory')
export class InventoryController {
  constructor(
    private readonly inventoryService: InventoryService
  ) {}

  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  @Post('imports')
   insertInventory(@Body() dto: CreateVaccineImportDto, @Req() req: any) {
    return this.inventoryService.insertInventory(dto, req.user.user_id)
  }

  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  @Get()
  getAllInventory() {
    return this.inventoryService.getAllInventory()
  }

  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  @Get('import-history/:id')
  getImportHistory( @Param('id', ParseIntPipe) id: number) {
    return this.inventoryService.getImportHistory(id)
  }

  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  @Post('exports')
  exportVaccine(@Body() dto: CreateVaccineExportDto, @Req() req: any) {
    return this.inventoryService.exportVaccine(dto, req.user.user_id)
  }

  @Get('available')
  async getVaccineInventories() {
    return this.inventoryService.getVaccineInventories();
  }
  
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  @Get('export-history/:id')
  getExportHistory(@Param('id', ParseIntPipe) id: number) {
    return this.inventoryService.getExportHistory(id);
  }

  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  @Get('stocks')
  getAllStocks() {
    return this.inventoryService.getAllStocks()
  }
}
