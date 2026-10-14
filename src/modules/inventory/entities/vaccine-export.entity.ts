import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm'

@Entity('vaccine_exports')
export class VaccineExport {
  @PrimaryGeneratedColumn()
  export_id: number

  @Column({ type: 'varchar', length: 50, unique: true })
  export_code: string

  @Column({ type: 'int' })
  user_id: number
    
  @Column({ type: 'date' })
  export_date: string

  @Column({ type: 'nvarchar', length: 255, nullable: true })
  note: string | null

  @CreateDateColumn({ type: 'datetime2' })
  created_at: Date

  @UpdateDateColumn({ type: 'datetime2' })
  updated_at: Date
}