import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm'

@Entity('inventories')
export class Inventory {
  @PrimaryGeneratedColumn()
  inventory_id: number

  @Column({ type: 'int' })
  vaccine_id: number

  @Column({ type: 'nvarchar', length: 100 })
  lot_code: string

  @Column({ type: 'date' })
  expiry_date: Date

  @Column({ type: 'int', default: 0 })
  quantity: number

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  unit_price: number

  @CreateDateColumn({ type: 'datetime2' })
  created_at: Date

  @UpdateDateColumn({ type: 'datetime2' })
  updated_at: Date
}