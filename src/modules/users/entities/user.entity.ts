import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm'
import { UserRole } from '@/common/user-role'
import { Role } from './role.entity'

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  user_id: number

  @Column({ length: 100 })
  fullName: string

  @Column({ type: 'nvarchar', length: 255, select: false })
  password: string

  @Column({ type: 'nvarchar', nullable: true, length: 100 })
  email: string

  @Column({ type: 'nvarchar', nullable: true, length: 255 })
  address: string | null

  @Column({ type: 'nvarchar', nullable: true, length: 20 })
  phone: string | null

  @Column({ type: 'nvarchar', length: 20, nullable: true })
  gender?: string | null

  @Column({ type: 'date', nullable: true })
  dateOfBirth?: Date | null

  @ManyToOne(() => Role, (role) => role.users)
  @JoinColumn({ name: 'role_id' })
  role: Role


  @Column({type: 'varchar', length: 12, nullable: true,})
  cccd: string | null

  @Column({ type: 'bit', default: false })
  isActive: boolean

  @Column({ type: 'varchar', length: 6, nullable: true })
  codeId: string | null

  @Column({ type: 'datetime', nullable: true })
  codeExpiredAt: Date | null

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
