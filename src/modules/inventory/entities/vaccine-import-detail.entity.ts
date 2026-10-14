import {
  Column,
  Entity,
  PrimaryGeneratedColumn
} from 'typeorm'

@Entity('vaccine_import_details')
export class VaccineImportDetail {
  @PrimaryGeneratedColumn()
  import_detail_id: number

  @Column({ type: 'int' })
  import_id: number

  @Column({ type: 'int' })
  vaccine_id: number

  @Column({ type: 'nvarchar', length: 100 })
  lot_code: string

  @Column({ type: 'date' })
  expiry_date: Date

  @Column({ type: 'int' })
  quantity: number

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  unit_price: number
}