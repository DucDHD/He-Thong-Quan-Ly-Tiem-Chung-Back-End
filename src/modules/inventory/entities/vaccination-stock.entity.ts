import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm'

@Entity('vaccination_stocks')
export class VaccinationStock {
  @PrimaryGeneratedColumn()
  stock_id: number

  @Column({ type: 'int' })
  vaccine_id: number

  @Column({ type: 'varchar', length: 100 })
  lot_code: string

  @Column({ type: 'date' })
  expiry_date: string

  @Column({ type: 'int', default: 0 })
  quantity: number

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  unit_price: number

  @CreateDateColumn({ type: 'datetime2' })
  created_at: Date

  @UpdateDateColumn({ type: 'datetime2' })
  updated_at: Date
}