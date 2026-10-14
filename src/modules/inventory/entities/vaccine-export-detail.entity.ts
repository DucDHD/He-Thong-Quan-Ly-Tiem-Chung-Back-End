import {
  Entity,
  PrimaryGeneratedColumn,
  Column
} from 'typeorm'

@Entity('vaccine_export_details')
export class VaccineExportDetail {
  @PrimaryGeneratedColumn()
  export_detail_id: number

  @Column({ type: 'int' })
  export_id: number

  @Column({ type: 'int' })
  vaccine_id: number

  @Column({ type: 'varchar', length: 100 })
  lot_code: string

  @Column({ type: 'date' })
  expiry_date: string

  @Column({ type: 'int' })
  quantity: number

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  unit_price: number
}