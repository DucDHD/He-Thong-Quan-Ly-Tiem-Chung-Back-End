import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm'

@Entity('vaccination_records')
export class VaccinationRecord {
  @PrimaryGeneratedColumn()
  record_id: number

  @Column({ type: 'int', unique: true })
  booking_id: number

  @Column({ type: 'int' })
  user_id: number

  @Column({ type: 'int' })
  vaccine_id: number

  @Column({ type: 'int', nullable: true })
  vaccinator_id: number | null

  @Column({ type: 'int' })
  dose_number: number

  @Column({ type: 'datetime2' })
  vaccination_date: Date

  @CreateDateColumn({ type: 'datetime2' })
  created_at: Date

  @UpdateDateColumn({ type: 'datetime2' })
  updated_at: Date
}