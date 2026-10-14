import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm'

@Entity('vaccine_imports')
export class VaccineImport {
  @PrimaryGeneratedColumn()
  import_id: number

  @Column({ type: 'nvarchar', length: 50, unique: true })
  invoice_code: string

  @Column({ type: 'int' })
  user_id: number

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  total_amount: number

  @Column({ type: 'nvarchar', length: 500, nullable: true })
  note: string | null

  @Column({ type: 'datetime2' })
  import_date: Date

  @CreateDateColumn({ type: 'datetime2' })
  created_at: Date

  @UpdateDateColumn({ type: 'datetime2' })
  updated_at: Date
}