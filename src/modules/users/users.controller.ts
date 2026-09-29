import { Controller, Get, Post, Body, Patch, Param, ParseIntPipe, UseGuards } from '@nestjs/common'
import { UsersService } from './users.service'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'

import { RolesGuard } from '@/common/guards/roles.guard'
import { JwtAuthGuard } from '@/auth/passport/jwt-auth.guard'
import { Roles } from '@/common/decorators/roles.decorator'
import { UserRole } from '@/common/user-role'

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}


  @Roles(UserRole.ADMIN)
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto)
  }

  @Get('roles')
  getRoles() {
    return this.usersService.getRoles()
  }

  @Roles(UserRole.ADMIN)
  @Get()
  getUsers() {
    return this.usersService.getUsers()
  }

  @Roles(UserRole.ADMIN)
  @Get(':id')
  getUserById(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.getUserById(id)
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id')
  updateUser(  @Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateUser(id, updateUserDto)
  }

  @Roles(UserRole.ADMIN)
  @Patch('active/:id')
  activeUser( @Param('id', ParseIntPipe) id: number, @Body('isActive') isActive: boolean) {
    return this.usersService.activeUser(id, isActive)
  }

}
