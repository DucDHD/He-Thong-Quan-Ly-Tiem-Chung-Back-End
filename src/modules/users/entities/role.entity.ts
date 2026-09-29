import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { User } from '@/modules/users/entities/user.entity'

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn()
  role_id: number

  @Column({ type: 'int', unique: true })
  role_code: number

  @Column({ type: 'nvarchar', length: 100 })
  role_name: string

  @OneToMany(() => User, (user) => user.role)
  users: User[]
}