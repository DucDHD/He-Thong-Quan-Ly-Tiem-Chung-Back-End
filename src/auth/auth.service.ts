import { ConflictException, Injectable, Logger, BadRequestException, NotFoundException, ForbiddenException, UnauthorizedException } from '@nestjs/common'

import { UsersService } from '../modules/users/users.service'
import { RegisterDto } from './dto/register/register.dto'
import { UserRole } from '@/common/user-role'
import { successLog } from '@/helpers/logger.helper'
import { hashPassword } from '@/helpers/util'
import { EmailService } from '@/email/email.service'
import { generateOtp } from '@/helpers/otp.helper'
import { VerifyDto } from './dto/verify/verify.dto'
import { ResendDto } from './dto/resend/resend.dto'
import { LoginDto } from './dto/login.dto/login.dto'
import { User } from '@/modules/users/entities/user.entity'
import { Role } from '@/modules/users/entities/role.entity'

import { InjectRepository } from '@nestjs/typeorm'
import { JwtService } from '@nestjs/jwt'
import { Repository } from 'typeorm'
import { ConfigService } from '@nestjs/config'
import { StringValue } from 'ms'
import { pickUser } from '@/common/pick-user'


import * as bcrypt from 'bcrypt'

import { JwtPayload } from './interfaces/jwt-payload.interface'
import { UpdateProfileDto } from './dto/profile/update.dto'

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly emailService: EmailService,


    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>
  ) {}

  async handleRegister(registerDto: RegisterDto) {
    const existEmail = await this.usersService.findByEmail(registerDto.email)

    if (existEmail) {
      throw new ConflictException('Email đã tồn tại')
    }

    const hashedPassword = await hashPassword(registerDto.password)
    const codeId = generateOtp()
    const codeExpiredAt = new Date(Date.now() + 1 * 60 * 1000)

    const role = await this.roleRepository.findOne({
      where: { role_code: UserRole.PATIENT }
    })

    if (!role) {
      throw new NotFoundException('Không tìm thấy vai trò bệnh nhân')
    }

    const user = await this.usersService.create({
      fullName: registerDto.fullName,
      email: registerDto.email,
      password: hashedPassword,
      role,  
      codeId: codeId,
      codeExpiredAt: codeExpiredAt,
      isActive: false
    })

    await this.emailService.sendEmail(
      user.email, 'Đăng ký tài khoản thành công', 'register',
      {
        fullName: user.fullName,
        email: user.email,
        codeId: codeId
      }
    )

    this.logger.log(successLog(` Đăng ký tài khoản thành công: userId=${user.user_id}`))

    return {
      id: user.user_id,
      fullName: user.fullName,
      email: user.email,
      role: user.role.role_code,
      codeExpiredAt 
    }
  }

  async handleActiveUser( verifyDto: VerifyDto){
    // Tìm user theo email
    const user = await this.usersService.findByEmail(verifyDto.email)

    if (!user) {
      throw new NotFoundException('Không tìm thấy tài khoản')
    }

    // Kiểm tra user đã active chưa
    if (user.isActive) { 
      throw new BadRequestException('Tài khoản đã được kích hoạt' )
    }

    // Kiểm tra OTP hết hạn
    if (!user.codeExpiredAt || new Date() > user.codeExpiredAt  ) {
      throw new BadRequestException('Mã OTP đã hết hạn')
    }
    // Kiểm tra OTP
    if (user.codeId !== verifyDto.codeId) {
      throw new BadRequestException('Mã OTP không chính xác')
    }

    await this.usersService.handleActiveUser(user.user_id)

    this.logger.log(successLog(`Tài khoản được kích hoạt thành công: userId=${user.user_id}`))

    return { message: 'Xác thực tài khoản thành công' }

  }

  async handleResend( resendDto: ResendDto ) {
    const user = await this.usersService.findByEmail(
      resendDto.email
    )

    if(!user) {
      throw new NotFoundException( 'Không tìm thấy tài khoản' )
    }

    if (user.isActive) {
      throw new BadRequestException( 'Tài khoản đã được kích hoạt' )
    }

    // OTP cũ vẫn còn hạn
    if( user.codeExpiredAt && new Date() < user.codeExpiredAt) {
      throw new BadRequestException(' Mã OTP hiện tại vẫn còn hiệu lực')
    }

    const codeId = generateOtp()
    const codeExpiredAt = new Date(Date.now() + 1 * 60 * 1000)

    await this.usersService.Resend(user.user_id, codeId, codeExpiredAt)

    await this.emailService.sendEmail(
      user.email,
      'Mã xác thực mới',
      'register',
      {
        fullName: user.fullName,
        email: user.email,
        codeId,
        codeExpiredAt
      }
    )

    this.logger.log(successLog('OTP Được gửi lại thành công'))

    return {
      message: 'Mã OTP mới đã được gửi',
      codeExpiredAt
    }
  }

  
  async login( loginDto: LoginDto ) {
    const user =  await this.usersService.findByEmailWithPassword(loginDto.email)

    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu chưa chính xác')
    }

    if (!user.isActive) {
      throw new ForbiddenException( 'Tài khoản chưa được kích hoạt')
    }

    const isPasswordValid = await bcrypt.compare( loginDto.password, user.password)


    if (!isPasswordValid) {
      throw new UnauthorizedException( 'Email hoặc mật khẩu chưa chính xác')
    }


    const payload: JwtPayload = {
        user_id: user.user_id,
        fullName: user.fullName,
        role: user.role.role_code
    }
    const accessToken = await this.jwtService.signAsync( payload, {
        secret: this.configService.getOrThrow<string>('ACCESS_TOKEN_SECRET_SIGNATURE'),
        expiresIn: this.configService.getOrThrow<StringValue>('ACCESS_TOKEN_LIFE') 
        //expiresIn: '30s'
    })

    const refreshToken = await this.jwtService.signAsync(payload, {
        secret: this.configService.getOrThrow<string>('REFRESH_TOKEN_SECRET_SIGNATURE'), 
        expiresIn: this.configService.getOrThrow<StringValue>('REFRESH_TOKEN_LIFE')
        //expiresIn: '2m'
    })

    this.logger.log(successLog('Đăng nhập thành công'))

    return {
      message: 'Đăng nhập thành công',
      accessToken,
      refreshToken,
      user: {
        user_id: user.user_id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      }
    }

  }


  async refreshToken(refreshToken: string) {
    try {
        const payload = await this.jwtService.verifyAsync(refreshToken, {
          secret: this.configService.getOrThrow<string>('REFRESH_TOKEN_SECRET_SIGNATURE')
        })

      const newPayload: JwtPayload = {
        user_id: payload.user_id,
        fullName: payload.fullName,
        role: payload.role
      }

        const accessToken = await this.jwtService.signAsync(newPayload, {
          secret: this.configService.getOrThrow<string>('ACCESS_TOKEN_SECRET_SIGNATURE'),
          expiresIn: this.configService.getOrThrow<StringValue>('ACCESS_TOKEN_LIFE')
          //expiresIn: '30s'
        })

        this.logger.log(successLog('Refresh Token thành công'))

        return { accessToken }
      } catch {
        throw new UnauthorizedException( 'Refresh Token không hợp lệ hoặc đã hết hạn' )
      }
    }

    async getProfile(userId: number) {
      const user = await this.usersService.findOneById(userId)

      if (!user) {
        throw new NotFoundException('Không tìm thấy tài khoản')
      }

        return (user)
    }

  async updateProfile( user_id: number, updateProfileDto: UpdateProfileDto) {
    const currentUser = await this.usersService.findOneById(user_id)

    if (!currentUser) {
      throw new NotFoundException('Không tìm thấy tài khoản')
    }

    if (updateProfileDto.cccd !== currentUser.cccd) {
      const existingUser = await this.usersService.findUserByCccd(updateProfileDto.cccd)

      if (existingUser) {
        throw new BadRequestException('CCCD đã được sử dụng')
      }
    }

    const user = await this.usersService.updateProfile(user_id, updateProfileDto )

    if (!user) {
      throw new NotFoundException('Không tìm thấy tài khoản')
    }

    this.logger.log(successLog(`Cập nhập thành công user_id=${user_id} `))

    return pickUser(user)
  }

  }
