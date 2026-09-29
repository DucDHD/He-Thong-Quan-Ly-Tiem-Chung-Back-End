// src/auth/dto/update-profile.dto.ts

import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsDateString,
  MaxLength,
  MinLength,
  Matches,
  Length
} from 'class-validator'

export class UpdateProfileDto {
  @IsString()
  @IsNotEmpty({ message: 'Vui lòng nhập họ và tên' })
  @MinLength(2, { message: 'Họ và tên phải có ít nhất 2 ký tự' })
  @MaxLength(100, { message: 'Họ và tên không được vượt quá 100 ký tự' })
  fullName: string

  @IsOptional()
  @IsDateString({}, { message: 'Ngày sinh không đúng định dạng' })
  dateOfBirth?: string | null

  @IsOptional()
  @IsIn(['Nam', 'Nữ', 'Khác'], {  message: 'Giới tính không hợp lệ' })
  gender?: string

  @IsString()
  @IsNotEmpty({ message: 'Vui lòng nhập số điện thoại' })
  @Matches(/^0\d{9}$/, {  message: 'Số điện thoại phải gồm 10 số và bắt đầu bằng 0'})
  phone: string

  @IsString()
  @IsNotEmpty({ message: 'Vui lòng nhập địa chỉ' })
  @MaxLength(255, {  message: 'Địa chỉ không được vượt quá 255 ký tự'})
  address: string

  @IsNotEmpty({ message: 'Vui lòng nhập CCCD' })
  @IsString()
  @Length(12, 12, { message: 'CCCD phải gồm đúng 12 chữ số',})
  @Matches(/^\d{12}$/, {   message: 'CCCD chỉ được chứa chữ số',})
  cccd: string
}