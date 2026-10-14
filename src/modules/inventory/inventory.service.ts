
import {
  BadRequestException,
  Injectable,
  NotFoundException
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import {  Repository } from 'typeorm'

import { Inventory } from './entities/inventory.entity'
import { VaccineImport } from './entities/vaccine-import.entity'
import { VaccineImportDetail } from './entities/vaccine-import-detail.entity'
import { Vaccine } from '../vaccines/entities/vaccine.entity'
import { FinanceService } from '@/modules/finance/finance.service'
import { CreateVaccineImportDto } from './dto/create-vaccine-import.dto'
import { CreateVaccineImportDetailDto} from './dto/create-vaccine-import-detail.dto'
import { VaccinationStock} from './entities/vaccination-stock.entity'
import { TransactionType } from '@/modules/finance/entities/financial-transaction.entity'
import { VaccineExport } from './entities/vaccine-export.entity'
import { VaccineExportDetail } from './entities/vaccine-export-detail.entity'
import { CreateVaccineExportDto } from './dto/create-vaccine-export.dto'  
import { EntityManager } from 'typeorm'

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,

    @InjectRepository(VaccineImport)
    private readonly importRepository: Repository<VaccineImport>,

    @InjectRepository(VaccineImportDetail)
    private readonly importDetailRepository: Repository<VaccineImportDetail>,

    @InjectRepository(Vaccine)
    private readonly vaccineRepository: Repository<Vaccine>,

    @InjectRepository(VaccineExport)
    private readonly exportRepository: Repository<VaccineExport>,

    @InjectRepository(VaccineExportDetail)
    private readonly exportDetailRepository: Repository<VaccineExportDetail>,

    @InjectRepository(VaccinationStock)
    private readonly vaccinationStockRepository: Repository<VaccinationStock>,


    private readonly financeService: FinanceService
  ) {}

  // Tạo phiếu nhập và cập nhật tồn kho
 
  // Thêm vaccine vào kho
 

// async insertInventory(dto: CreateVaccineImportDto, userId: number) {
//   const inventories: Inventory[] = []

//   for (const detail of dto.details) {
//     const vaccine = await this.vaccineRepository.findOne({
//       where: { vaccine_id: detail.vaccine_id }
//     })

//     if (!vaccine) {
//       throw new NotFoundException('Không tìm thấy vaccine')
//     }

//     const existingInventory = await this.inventoryRepository.findOne({
//       where: {
//         vaccine_id: detail.vaccine_id,
//         lot_code: detail.lot_code,
//         expiry_date: new Date(detail.expiry_date)
//       }
//     })

//     if (existingInventory?.lot_code === detail.lot_code) {
//        throw new BadRequestException({
//         field: 'lot_code',
//         message: `Mã lô ${detail.lot_code} đã được nhập trước đó`
//       })
//     }

//     if (existingInventory) {
//       existingInventory.quantity = Number(existingInventory.quantity) + detail.quantity

//       const savedInventory = await this.inventoryRepository.save(existingInventory)
//       inventories.push(savedInventory)
//     } else {
//       const inventory = this.inventoryRepository.create({
//         vaccine_id: detail.vaccine_id,
//         lot_code: detail.lot_code,
//         expiry_date: new Date(detail.expiry_date),
//         quantity: detail.quantity,
//         unit_price: detail.unit_price
//       })

//       const savedInventory = await this.inventoryRepository.save(inventory)
//       inventories.push(savedInventory)
//     }
//   }

//   // INSERT vaccine_imports
//   const vaccineImport = await this.insertVaccineImport(dto, userId)

//   // INSERT vaccine_import_details
//   const importDetails = await this.insertVaccineImportDetail(
//     vaccineImport.import_id,
//     dto.details
//   )

//   const expense = await this.insertInventoryExpense( vaccineImport,userId)

//   return {
//     message: 'Nhập kho vaccine thành công',
//     import_id: vaccineImport.import_id,
//     total_amount: vaccineImport.total_amount,
//     inventories,
//     details: importDetails,
//     expense
//   }
// }

async insertInventory(dto: CreateVaccineImportDto, userId: number) {
  const inventories: Inventory[] = []
  const lotKeys = new Set<string>()

  for (const [index, detail] of dto.details.entries()) {
    const lotKey = JSON.stringify([
      detail.vaccine_id,
      detail.lot_code
    ])


    // 1. Kiểm tra trùng mã lô trong phiếu hiện tại
    if (lotKeys.has(lotKey)) {

      const vaccine = await this.vaccineRepository.findOne({
        where: { vaccine_id: detail.vaccine_id },
        select: { vaccine_name: true }
      })


      throw new BadRequestException({
        field: `details.${index}.lot_code`,
        message: `Mã lô ${detail.lot_code} và vaccine ${vaccine?.vaccine_name ?? detail.vaccine_id} này đã bị trùng trong phiếu nhập`
      })
    }

    lotKeys.add(lotKey)

    // 2. Kiểm tra vaccine tồn tại
    const vaccine = await this.vaccineRepository.findOne({
      where: { vaccine_id: detail.vaccine_id }
    })

    if (!vaccine) {
      throw new NotFoundException('Không tìm thấy vaccine')
    }

    // 3. Kiểm tra mã lô đã từng nhập
    const existingLot = await this.importDetailRepository.findOne({
      where: {
        vaccine_id: detail.vaccine_id,
        lot_code: detail.lot_code
      }
    })

    if (existingLot) {
      throw new BadRequestException({
        field: `details.${index}.lot_code`,
        message: `Mã lô ${detail.lot_code} đã được nhập trước đó`
      })
    }

    // 4. Tìm tồn kho cùng vaccine và hạn sử dụng
    const existingInventory = await this.inventoryRepository.findOne({
      where: {
        vaccine_id: detail.vaccine_id,
        expiry_date: new Date(detail.expiry_date)
      }
    })

    if (existingInventory) {
      existingInventory.quantity =
        Number(existingInventory.quantity) + Number(detail.quantity)

      inventories.push(
        await this.inventoryRepository.save(existingInventory)
      )
    } else {
      const inventory = this.inventoryRepository.create({
        vaccine_id: detail.vaccine_id,
        lot_code: detail.lot_code,
        expiry_date: new Date(detail.expiry_date),
        quantity: Number(detail.quantity),
        unit_price: detail.unit_price
      })

      inventories.push(
        await this.inventoryRepository.save(inventory)
      )
    }
  }

  const vaccineImport = await this.insertVaccineImport(dto, userId)

  const importDetails = await this.insertVaccineImportDetail(
    vaccineImport.import_id,
    dto.details
  )

  const expense = await this.insertInventoryExpense(vaccineImport, userId)

  return {
    message: 'Nhập kho vaccine thành công',
    import_id: vaccineImport.import_id,
    total_amount: vaccineImport.total_amount,
    inventories,
    details: importDetails,
    expense
  }
}




// private async generateInvoiceCode(): Promise<string> {
//   const year = new Date().getFullYear()
//   const prefix = `PN${year}`

//   const lastInvoice = await this.importRepository
//     .createQueryBuilder('vi')
//     .where('vi.invoice_code LIKE :prefix', {
//       prefix: `${prefix}%`
//     })
//     .orderBy('vi.invoice_code', 'DESC')
//     .getOne()

//   const lastNumber = lastInvoice
//     ? Number(lastInvoice.invoice_code.slice(prefix.length))
//     : 0

//   return `${prefix}${String(lastNumber + 1).padStart(4, '0')}`
// }


private async generateInvoiceCode( type: 'import' | 'export',  manager?: EntityManager): Promise<string> {
  const year = new Date().getFullYear()
  const prefix = `${type === 'import' ? 'PN' : 'PX'}${year}`

  const repository = manager ? manager.getRepository( type === 'import' ? VaccineImport : VaccineExport ) 
  : type === 'import'  ? this.importRepository : this.exportRepository

  const lastInvoice = await repository
    .createQueryBuilder('invoice')
    .where('invoice.' + (
      type === 'import' ? 'invoice_code' : 'export_code'
    ) + ' LIKE :prefix', {
      prefix: `${prefix}%`
    })
    .orderBy(
      `invoice.${type === 'import' ? 'invoice_code' : 'export_code'}`,
      'DESC'
    )
    .getOne()

  const lastCode = lastInvoice ? type === 'import' ? (lastInvoice as VaccineImport).invoice_code : (lastInvoice as VaccineExport).export_code : null

  const lastNumber = lastCode  ? Number(lastCode.slice(prefix.length)) : 0

  return `${prefix}${String(lastNumber + 1).padStart(4, '0')}`
}


async insertVaccineImport(dto: CreateVaccineImportDto, userId: number) {
  const invoiceCode = await this.generateInvoiceCode('import')

  const totalAmount = dto.details.reduce(
    (total, detail) => total + detail.quantity * detail.unit_price,
    0
  )

  const vaccineImport = this.importRepository.create({
    invoice_code: invoiceCode,
    user_id: userId,
    import_date: new Date(dto.import_date),
    note: dto.note ?? null,
    total_amount: totalAmount
  })

  return await this.importRepository.save(vaccineImport)
}


async insertVaccineImportDetail( importId: number, details: CreateVaccineImportDetailDto[]) {
  const importDetails = details.map((detail) =>
    this.importDetailRepository.create({
      import_id: importId,
      vaccine_id: detail.vaccine_id,
      lot_code: detail.lot_code,
      expiry_date: new Date(detail.expiry_date),
      quantity: detail.quantity,
      unit_price: detail.unit_price
    })
  )

  return await this.importDetailRepository.save(importDetails)
}


async insertInventoryExpense(vaccineImport: VaccineImport, userId: number) {
  return await this.financeService.createTransaction({
    type: TransactionType.EXPENSE,
    amount: Number(vaccineImport.total_amount),
    category: 'VACCINE_PURCHASE',
    reference_id: vaccineImport.import_id,
    reference_type: 'VACCINE_IMPORT',
    transaction_date: new Date().toISOString(),
    note: 'Thanh toán tiền nhập vaccine'
  }, userId)
}

async getAllInventory() {
  return await this.inventoryRepository
    .createQueryBuilder('inventory')
    .leftJoin(
      'vaccines',
      'vaccine',
      'vaccine.vaccine_id = inventory.vaccine_id'
    )
    .select([
      // Inventory
      'inventory.inventory_id AS inventory_id',
      'inventory.vaccine_id AS vaccine_id',
      'inventory.lot_code AS lot_code',
      'inventory.expiry_date AS expiry_date',
      'inventory.quantity AS quantity',
      'inventory.unit_price AS unit_price',
      'inventory.created_at AS inventory_created_at',
      'inventory.updated_at AS inventory_updated_at',

      // Vaccine
      'vaccine.vaccine_name AS vaccine_name',
      'vaccine.vaccine_type AS vaccine_type',
      'vaccine.license_number AS license_number',
      'vaccine.manufacturer AS manufacturer',
      'vaccine.country AS country',
      'vaccine.dosage AS dosage',
      'vaccine.storage_condition AS storage_condition',
      'vaccine.vaccination_age AS vaccination_age',
      'vaccine.unit AS unit',
      'vaccine.price AS price',
      'vaccine.description AS description',
      'vaccine.isActive AS isActive',
      'vaccine.createdAt AS vaccine_created_at'
    ])
    .orderBy('inventory.inventory_id', 'DESC')
    .getRawMany()
  }

async getImportHistory(inventoryId: number) {
  return await this.inventoryRepository
    .createQueryBuilder('inventory')
    .innerJoin(
      'vaccine_import_details',
      'detail',
      `detail.vaccine_id = inventory.vaccine_id
       AND detail.expiry_date = inventory.expiry_date`
    )
    .innerJoin(
      'vaccine_imports',
      'imp',
      'imp.import_id = detail.import_id'
    )
    .select([
      'detail.import_detail_id AS id',
      'imp.invoice_code AS code',
      'imp.import_date AS date',
      'detail.lot_code AS lot_code',
      'detail.quantity AS quantity',
      'detail.unit_price AS unit_price',
      'imp.note AS note'
    ])
    .where('inventory.inventory_id = :inventoryId', {
      inventoryId
    })
    .orderBy('imp.import_date', 'DESC')
    .addOrderBy('detail.import_detail_id', 'DESC')
    .getRawMany()
}


// async exportVaccine(inventoryId: number, quantity: number) {
//   return this.inventoryRepository.manager.transaction(
//     async (manager) => {
//       // Tìm vaccine trong kho
//       const inventory = await manager.findOneBy(Inventory, {
//         inventory_id: inventoryId
//       })

//       if (!inventory) {
//         throw new NotFoundException('Không tìm thấy vaccine trong kho')
//       }

//       if (inventory.quantity < quantity) {
//         throw new BadRequestException('Số lượng vaccine không đủ để xuất')
//       }

//       // 1. Trừ số lượng trong inventories
//       inventory.quantity -= quantity
//       await manager.save(inventory)

//       // 2. Insert vào vaccination_stocks
//       let stock = await manager.findOne(VaccinationStock, {
//         where: {
//           vaccine_id: inventory.vaccine_id,
//           lot_code: inventory.lot_code,
//           expiry_date: String(inventory.expiry_date)
//         }
//       })

//       if (stock) {
//         stock.quantity = Number(stock.quantity) + Number(quantity)
//       } else {
//         stock = manager.create(VaccinationStock, {
//           vaccine_id: inventory.vaccine_id,
//           lot_code: inventory.lot_code,
//           expiry_date: String(inventory.expiry_date),
//           quantity,
//           unit_price: inventory.unit_price
//         })
//       }
//       await manager.save(stock)



//       return {
//         message: 'Xuất vaccine thành công'
//       }
//     }
//   )
// }

async exportVaccine(dto: CreateVaccineExportDto, userId: number) {
  return this.inventoryRepository.manager.transaction(
    async (manager) => {
      const exportDetails: VaccineExportDetail[] = []

      for (const item of dto.details) {
        const { inventory_id, quantity } = item

        // 1. UPDATE inventories
        const inventory = await manager.findOneBy(Inventory, {
          inventory_id
        })

        if (!inventory) {
          throw new NotFoundException('Không tìm thấy vaccine trong kho')
        }

        if (Number(inventory.quantity) < quantity) {
          throw new BadRequestException('Số lượng vaccine không đủ để xuất')
        }

        inventory.quantity = Number(inventory.quantity) - quantity
        await manager.save(inventory)

        // 2. INSERT hoặc UPDATE vaccination_stocks
        let stock = await manager.findOne(VaccinationStock, {
          where: {
            vaccine_id: inventory.vaccine_id,
            lot_code: inventory.lot_code,
            expiry_date: String(inventory.expiry_date)
          }
        })

        if (stock) {
          stock.quantity = Number(stock.quantity) + quantity
        } else {
          stock = manager.create(VaccinationStock, {
            vaccine_id: inventory.vaccine_id,
            lot_code: inventory.lot_code,
            expiry_date: String(inventory.expiry_date),
            quantity,
            unit_price: inventory.unit_price
          })
        }

        await manager.save(stock)

        // Chuẩn bị dữ liệu cho bước 4
        exportDetails.push(
          manager.create(VaccineExportDetail, {
            vaccine_id: inventory.vaccine_id,
            lot_code: inventory.lot_code,
            expiry_date: String(inventory.expiry_date),
            quantity,
            unit_price: inventory.unit_price
          })
        )
      }

      // 3. INSERT vaccine_exports
      const vaccineExport = await this.insertVaccineExport(
        dto,
        userId,
        manager
      )

      // 4. INSERT vaccine_export_details
      const details = await this.insertVaccineExportDetail(
        vaccineExport.export_id,
        exportDetails,
        manager
      )

      return {
        message: 'Xuất vaccine thành công',
        export_id: vaccineExport.export_id,
        export_code: vaccineExport.export_code,
        details
      }
    }
  )
}


async insertVaccineExport( dto: CreateVaccineExportDto,userId: number, manager: EntityManager) {
  const exportCode = await this.generateInvoiceCode('export', manager)

  const vaccineExport = manager.create(VaccineExport, {
    export_code: exportCode,
    user_id: userId,
    export_date: dto.export_date,
    note: dto.note ?? null
  })

  return await manager.save(vaccineExport)
}

async insertVaccineExportDetail( exportId: number,details: VaccineExportDetail[], manager: EntityManager) {
  const exportDetails = details.map((detail) =>
    manager.create(VaccineExportDetail, {
      export_id: exportId,
      vaccine_id: detail.vaccine_id,
      lot_code: detail.lot_code,
      expiry_date: detail.expiry_date,
      quantity: detail.quantity,
      unit_price: detail.unit_price
    })
  )

  return await manager.save(exportDetails)
}

async getVaccineInventories() {
  return this.vaccineRepository
    .createQueryBuilder('v')
    .innerJoin(
      'inventories',
      'i',
      'i.vaccine_id = v.vaccine_id'
    )
    .select([
      'i.inventory_id AS inventory_id',
      'v.vaccine_id AS vaccine_id',
      'v.vaccine_name AS vaccine_name',
      'i.lot_code AS lot_code',
      'i.expiry_date AS expiry_date',
      'i.quantity AS quantity',
    ])
    .where('i.quantity > 0')
    .getRawMany();
}

async getExportHistory(inventoryId: number) {
  return await this.inventoryRepository
    .createQueryBuilder('inventory')
    .innerJoin(
      'vaccine_export_details',
      'detail',
      `detail.vaccine_id = inventory.vaccine_id
       AND detail.lot_code = inventory.lot_code
       AND detail.expiry_date = inventory.expiry_date`
    )
    .innerJoin(
      'vaccine_exports',
      'exp',
      'exp.export_id = detail.export_id'
    )
    .select([
      'detail.export_detail_id AS id',
      'exp.export_code AS code',
      'exp.export_date AS date',
      'detail.lot_code AS lot_code',
      'detail.quantity AS quantity',
      'detail.unit_price AS unit_price',
      'exp.note AS note'
    ])
    .where('inventory.inventory_id = :inventoryId', {
      inventoryId
    })
    .orderBy('exp.export_date', 'DESC')
    .addOrderBy('detail.export_detail_id', 'DESC')
    .getRawMany();
}

async getAllStocks() {
  return await this.vaccinationStockRepository
    .createQueryBuilder('stock')
    .innerJoin(
      'vaccines',
      'vaccine',
      'vaccine.vaccine_id = stock.vaccine_id'
    )
    .select([
      'stock.stock_id AS stock_id',
      'stock.vaccine_id AS vaccine_id',
      'vaccine.vaccine_name AS vaccine_name',
      'vaccine.vaccine_type AS vaccine_type',
      'stock.lot_code AS lot_code',
      'stock.expiry_date AS expiry_date',
      'stock.quantity AS quantity',
      'stock.unit_price AS unit_price'
    ])
    .orderBy('stock.stock_id', 'DESC')
    .getRawMany()
}

}
