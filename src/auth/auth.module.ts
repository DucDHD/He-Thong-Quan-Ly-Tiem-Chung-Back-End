import { Module } from '@nestjs/common'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { UsersModule } from '../modules/users/users.module'
import { EmailModule } from '@/email/email.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { User } from '@/modules/users/entities/user.entity'
import { JwtStrategy } from './passport/jwt.strategy'
import { Role } from '@/modules/users/entities/role.entity'


@Module({
  imports: [
    UsersModule,
    EmailModule,
    TypeOrmModule.forFeature([User, Role]),
    PassportModule,
    JwtModule.register({})
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy]
})
export class AuthModule {}
