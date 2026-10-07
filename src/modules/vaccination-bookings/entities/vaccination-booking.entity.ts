import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

export enum VaccinationBookingStatus {
  REGISTERED = 'REGISTERED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

@Entity('vaccination_bookings')
export class VaccinationBooking {
  @PrimaryGeneratedColumn()
  booking_id: number

  @Column({ type: 'int' })
  schedule_id: number

  @Column({ type: 'int' })
  user_id: number

  @Column({ type: 'nvarchar', length: 20, default: VaccinationBookingStatus.REGISTERED })
  status: VaccinationBookingStatus

  @Column({ type: 'nvarchar', length: 500, nullable: true })
  note: string | null

  @CreateDateColumn({ type: 'datetime2' })
  created_at: Date

  @UpdateDateColumn({ type: 'datetime2' })
  updated_at: Date
}