import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm'

export enum InvoiceStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn()
  invoice_id: number

  @Column({ type: 'int', unique: true })
  booking_id: number

  @Column({ type: 'int' })
  user_id: number

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  total_amount: number

  @Column({ type: 'nvarchar', length: 20, default: InvoiceStatus.PENDING })
  status: InvoiceStatus

  @CreateDateColumn({ type: 'datetime2' })
  created_at: Date
}