import { Module } from '@nestjs/common'
import { UsersService } from './users.service'
import { UsersController } from './users.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from './entities/user.entity'
import { Role } from './entities/role.entity'
import { EmailModule } from '@/email/email.module'

@Module({
  imports: [ EmailModule, TypeOrmModule.forFeature([User, Role])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService]
})
export class UsersModule {}
