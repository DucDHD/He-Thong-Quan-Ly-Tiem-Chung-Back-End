import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsDateString,
  IsString,
  Length,
  Matches,
  MaxLength,
  MinLength
} from 'class-validator'

export class CreateUserDto {
  @IsNotEmpty({ message: 'Vui lòng nhập họ và tên' })
  @IsString()
  @MinLength(2, { message: 'Họ và tên phải có ít nhất 2 ký tự' })
  @MaxLength(100, { message: 'Họ và tên không được vượt quá 100 ký tự' })
  fullName: string

  @IsNotEmpty({ message: 'Vui lòng nhập email' })
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  @MaxLength(100, { message: 'Email không được vượt quá 100 ký tự' })
  email: string

  @IsNotEmpty({ message: 'Vui lòng nhập mật khẩu' })
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  password: string

  @IsNotEmpty({ message: 'Vui lòng nhập số điện thoại' })
  @Matches(/^0\d{9}$/, {  message: 'Số điện thoại phải gồm 10 số và bắt đầu bằng 0'})
  phone: string

  @IsNotEmpty({ message: 'Vui lòng nhập CCCD' })
  @Length(12, 12, { message: 'CCCD phải gồm đúng 12 chữ số'})
  @Matches(/^\d{12}$/, { message: 'CCCD chỉ được chứa chữ số' })
  cccd: string

  @IsNotEmpty({ message: 'Vui lòng nhập ngày sinh' })
  @IsDateString({}, { message: 'Ngày sinh không đúng định dạng' })
  dateOfBirth: string

  @IsNotEmpty({ message: 'Vui lòng chọn giới tính' })
  @IsString()
  gender: string

  @IsNotEmpty({ message: 'Vui lòng nhập địa chỉ' })
  @MaxLength(255, {message: 'Địa chỉ không được vượt quá 255 ký tự'})
  address: string

  @IsNotEmpty({ message: 'Vui lòng chọn vai trò' })
  @IsInt()
  role_id: number
}