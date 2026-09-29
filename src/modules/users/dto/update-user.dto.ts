import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsDateString,
  IsString,
  Length,
  Matches,
  MaxLength,
  MinLength,
  IsOptional
} from 'class-validator'

export class UpdateUserDto {
  @IsNotEmpty({ message: 'Vui lòng nhập họ và tên' })
  @IsString()
  @MinLength(2, { message: 'Họ và tên phải có ít nhất 2 ký tự' })
  @MaxLength(100, { message: 'Họ và tên không được vượt quá 100 ký tự' })
  fullName: string


  @IsNotEmpty({ message: 'Vui lòng nhập số điện thoại' })
  @Matches(/^0\d{9}$/, { message: 'Số điện thoại phải gồm 10 số và bắt đầu bằng 0'})
  phone: string

  @IsNotEmpty({ message: 'Vui lòng nhập CCCD' })
  @Length(12, 12, { message: 'CCCD phải gồm đúng 12 chữ số'})
  @Matches(/^\d{12}$/, { message: 'CCCD chỉ được chứa chữ số'})
  cccd: string

  @IsOptional()
  @IsNotEmpty({ message: 'Vui lòng nhập ngày sinh' })
  @IsDateString({}, { message: 'Ngày sinh không đúng định dạng' })
  dateOfBirth: string

  @IsOptional()
  @IsNotEmpty({ message: 'Vui lòng chọn giới tính' })
  @IsString()
  gender: string

  @IsNotEmpty({ message: 'Vui lòng nhập địa chỉ' })
  @MaxLength(255)
  address: string

  @IsNotEmpty({ message: 'Vui lòng chọn vai trò' })
  @IsInt()
  role_id: number
}