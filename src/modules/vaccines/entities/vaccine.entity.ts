import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm'

@Entity('vaccines')
export class Vaccine {
  @PrimaryGeneratedColumn()
  vaccine_id: number

  @Column({ type: 'nvarchar', length: 150 })
  vaccine_name: string

  @Column({ type: 'nvarchar', length: 100 })
  vaccine_type: string

  @Column({ type: 'nvarchar', length: 100, nullable: true })
  license_number: string | null

  @Column({ type: 'nvarchar', length: 150 })
  manufacturer: string

  @Column({ type: 'nvarchar', length: 100, nullable: true })
  country: string | null

  @Column({ type: 'nvarchar', length: 100, nullable: true })
  dosage: string | null

  @Column({ type: 'nvarchar', length: 255, nullable: true })
  storage_condition: string | null

  @Column({ type: 'nvarchar', length: 100, nullable: true })
  vaccination_age: string | null

  @Column({ type: 'nvarchar', length: 50 })
  unit: string

  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: true })
  price: number | null

  @Column({ type: 'nvarchar', length: 500, nullable: true })
  description: string | null

  @Column({ type: 'bit', default: true })
  isActive: boolean

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}