
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { InventoryController } from './inventory.controller'
import { InventoryService } from './inventory.service'

import { Inventory } from './entities/inventory.entity'
import { VaccineImport } from './entities/vaccine-import.entity'
import { VaccineImportDetail } from './entities/vaccine-import-detail.entity'
import { Vaccine } from '../vaccines/entities/vaccine.entity'
import { FinanceModule } from '@/modules/finance/finance.module'
import { VaccinationStock } from './entities/vaccination-stock.entity'
import {  VaccineExport } from './entities/vaccine-export.entity'
import {  VaccineExportDetail } from './entities/vaccine-export-detail.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Inventory,
      VaccineImport,
      VaccineImportDetail,
      Vaccine,
      VaccinationStock,
      VaccineExport,
      VaccineExportDetail
    ]),
    FinanceModule
  ],
  controllers: [InventoryController],
  providers: [InventoryService],
  exports: [InventoryService]
})
export class InventoryModule {}
