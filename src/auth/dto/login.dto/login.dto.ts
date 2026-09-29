import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator'

export class LoginDto {
  @IsNotEmpty({ message: 'Vui lòng nhập email' })
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  @MaxLength(100, { message: 'Email không được vượt quá 100 ký tự' })
  email: string

  @IsString()
  @IsNotEmpty({ message: 'Vui lòng nhập mật khẩu' })
  @MaxLength(100, { message: 'Mật khẩu không được vượt quá 100 ký tự' })
  password: string
}