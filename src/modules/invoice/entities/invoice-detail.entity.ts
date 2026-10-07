import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('invoice_details')
export class InvoiceDetail {
  @PrimaryGeneratedColumn()
  invoice_detail_id: number

  @Column({ type: 'int' })
  invoice_id: number

  @Column({ type: 'int' })
  vaccine_id: number

  @Column({ type: 'int', default: 1 })
  quantity: number

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  unit_price: number
}