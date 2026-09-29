
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from './entities/user.entity'
import { Role } from './entities/role.entity'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Logger,
  ConflictException
} from '@nestjs/common'
import { hashPassword } from '@/helpers/util'
import { successLog } from '@/helpers/logger.helper'
import { EmailService } from '@/email/email.service'
import { UserRole } from '@/common/user-role'


@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name)
  
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly emailService: EmailService,

    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>
  ) {}

  findByEmail(email: string): Promise<User | null> {
    
    return this.userRepository.findOne({
      where: {
        email
      }
    })
  }

  async create(data: Partial<User>): Promise<User> {
    const user = this.userRepository.create(data)
    return this.userRepository.save(user)
  }

  async handleActiveUser(userId: number): Promise<void> {
    await this.userRepository.update({ user_id: userId }, { isActive: true })
  }
  
  async Resend(user_id: number, codeId: string,codeExpiredAt: Date): Promise<void> {
    await this.userRepository.update({user_id: user_id, }, {codeId, codeExpiredAt})
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .leftJoinAndSelect('user.role', 'role')
      .where('user.email = :email', { email })
      .getOne()
  }

  async findOneById(userId: number) {
    return this.userRepository.findOne({
      where: { user_id: userId },
      relations: { role: true }
    })
  }

  async updateProfile( user_id: number,
    data: {
      fullName: string
      dateOfBirth?: string | null
      gender?: string
      phone: string
      address: string
      cccd: string
    }
  ) {
    const user = await this.userRepository.findOne({ where: {  user_id: user_id }})

    if (!user) {
      return null
    }

    user.fullName = data.fullName
    user.dateOfBirth = data.dateOfBirth ? new Date(data.dateOfBirth) : null
    user.gender = data.gender || null
    user.phone = data.phone
    user.address = data.address
    user.cccd = data.cccd

    return this.userRepository.save(user)
  }

  async findUserByCccd(cccd: string) {
    return this.userRepository.findOne({ where: { cccd }})
  }
  
  async createUser(data: CreateUserDto) {
    const checkExist = await this.userRepository.findOne({
      where: [
        { email: data.email },
        { cccd: data.cccd },
        { phone: data.phone }
      ]
    })

    if (checkExist?.email === data.email) {
      throw new ConflictException( { field: 'email', message: 'Email này đã được sử dụng'})

    } else if (checkExist?.phone === data.phone) {
        throw new ConflictException({field: 'phone',message: 'Số điện thoại này đã được sử dụng'})
    } else if (checkExist?.cccd === data.cccd) {
        throw new ConflictException({field: 'cccd', message: 'CCCD này đã được sử dụng'})
    } 

    const role = await this.roleRepository.findOne({ where: { role_id: data.role_id  } })

    if (!role) {
      throw new BadRequestException('Vai trò không tồn tại')
    }

    const hashedPassword = await hashPassword(data.password)

    const user = this.userRepository.create({
      fullName: data.fullName,
      email: data.email,
      password: hashedPassword,
      phone: data.phone,
      cccd: data.cccd,
      dateOfBirth: data.dateOfBirth? new Date(data.dateOfBirth) : null,
      gender: data.gender || null,
      address: data.address,
      role,
      isActive: true
    })

    await this.emailService.sendEmail(
      user.email, 'Đăng ký tài khoản thành công', 'account-created',
      {
        fullName: user.fullName,
        email: user.email,
        role,
        password: data.password
      }
    )

    this.logger.log(successLog(` Đăng ký tài khoản nhân viên thành công: userId=${user.user_id}`))

    return this.userRepository.save(user)
  }

  async getRoles(): Promise<Role[]> {
    return this.roleRepository.find({ order: { role_id: 'ASC' } })
  }

  async getUsers(): Promise<User[]> {
    return this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .where('role.role_code != :patientRole', {
        patientRole: UserRole.PATIENT
      })
      .orderBy('user.user_id', 'DESC')
      .getMany()
  }

  async getUserById(id: number){
    const user = await this.userRepository.findOne({
      where: {   user_id: id },
      relations: { role: true }
    })

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng')
    }

    return (user) 
  }

 async updateUser(user_id: number, data: UpdateUserDto) {
    // Lấy user hiện tại
    const user = await this.getUserById(user_id)

    // Kiểm tra trùng SĐT hoặc CCCD
    const checkExist = await this.userRepository.findOne({
      where: [ { phone: data.phone },  { cccd: data.cccd }]
    })

    // Chỉ báo trùng nếu thuộc user khác
    if ( checkExist && checkExist.user_id !== user_id ) {
      if (checkExist.phone === data.phone) {
        throw new ConflictException({ field: 'phone',  message: 'Số điện thoại này đã được sử dụng' })
      }

      if (checkExist.cccd === data.cccd) {
        throw new ConflictException({  field: 'cccd',  message: 'CCCD này đã được sử dụng' })
      }
    }

    // Kiểm tra role
    const role = await this.roleRepository.findOne({ where: { role_id: data.role_id } })

    if (!role) {
      throw new BadRequestException('Vai trò không tồn tại')
    }

    // Update
    user.fullName = data.fullName
    user.phone = data.phone
    user.cccd = data.cccd
    user.dateOfBirth = data.dateOfBirth
      ? new Date(data.dateOfBirth)
      : null
    user.gender = data.gender || null
    user.address = data.address
    user.role = role

    const updatedUser = await this.userRepository.save(user)

    this.logger.log(successLog('Cập nhật nhân viên thành công') )

    return updatedUser
  }


  async activeUser( user_id: number,isActive: boolean) {
    const user = await this.getUserById(user_id)

    user.isActive = isActive

    await this.userRepository.save(user)

    this.logger.log(
      successLog( isActive ? 'Kích hoạt tài khoản thành công': 'Ngừng hoạt động tài khoản thành công' )
    )

    return { message: isActive ? 'Kích hoạt tài khoản thành công': 'Ngừng hoạt động tài khoản thành công', isActive }
  }

}
