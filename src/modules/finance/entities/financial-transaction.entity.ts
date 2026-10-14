
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'

export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
}

@Entity('financial_transactions')
export class FinancialTransaction {
  @PrimaryGeneratedColumn()
  transaction_id: number

  @Column({ type: 'nvarchar', length: 20 })
  type: TransactionType

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  amount: number

  @Column({ type: 'nvarchar', length: 100 })
  category: string

  @Column({ type: 'int', nullable: true })
  reference_id: number | null

  @Column({ type: 'nvarchar', length: 50, nullable: true })
  reference_type: string | null

  @Column({ type: 'int' })
  user_id: number

  @Column({ type: 'datetime2' })
  transaction_date: Date

  @Column({ type: 'nvarchar', length: 500, nullable: true })
  note: string | null

  @CreateDateColumn({ type: 'datetime2' })
  created_at: Date

  @UpdateDateColumn({ type: 'datetime2' })
  updated_at: Date
}
