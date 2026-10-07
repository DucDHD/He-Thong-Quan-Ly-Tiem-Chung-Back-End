import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

export enum VaccinationScheduleStatus {
  UPCOMING = 'UPCOMING',
  FULL = 'FULL',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

@Entity('vaccination_schedules')
export class VaccinationSchedule {
  @PrimaryGeneratedColumn()
  schedule_id: number

  @Column({ type: 'datetime2' })
  vaccination_date: Date

  @Column({ type: 'int' })
  vaccine_id: number

  @Column({ type: 'int' })
  capacity: number

  @Column({ type: 'nvarchar', length: 100 })
  age: string

  @Column({ type: 'int' })
  user_id: number

  @Column({ type: 'int', nullable: true })
  location_id: number | null

  @Column({ type: 'nvarchar', length: 500, nullable: true })
  note: string | null

  @Column({ type: 'nvarchar', length: 20, default: VaccinationScheduleStatus.UPCOMING })
  status: VaccinationScheduleStatus

  @CreateDateColumn()
  created_at: Date

  @UpdateDateColumn()
  updated_at: Date
}