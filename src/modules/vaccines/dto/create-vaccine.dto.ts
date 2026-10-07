import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min
} from 'class-validator'
import { Type } from 'class-transformer'

export class CreateVaccineDto {
  @IsNotEmpty({ message: 'Vui lòng nhập tên vaccine' })
  @IsString()
  @MaxLength(150, { message: 'Tên vaccine không được vượt quá 150 ký tự' })
  vaccine_name: string

  @IsNotEmpty({ message: 'Vui lòng nhập loại vaccine' })
  @IsString()
  @MaxLength(100, { message: 'Loại vaccine không được vượt quá 100 ký tự' })
  vaccine_type: string

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Số giấy phép không được vượt quá 100 ký tự' })
  license_number?: string

  @IsNotEmpty({ message: 'Vui lòng nhập nhà sản xuất' })
  @IsString()
  @MaxLength(150, { message: 'Nhà sản xuất không được vượt quá 150 ký tự' })
  manufacturer: string

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Nước sản xuất không được vượt quá 100 ký tự' })
  country?: string

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Hàm lượng không được vượt quá 100 ký tự' })
  dosage?: string

  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'Điều kiện bảo quản không được vượt quá 255 ký tự' })
  storage_condition?: string

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Độ tuổi tiêm chủng không được vượt quá 100 ký tự' })
  vaccination_age?: string

  @IsNotEmpty({ message: 'Vui lòng nhập đơn vị' })
  @IsString()
  @MaxLength(50, { message: 'Đơn vị không được vượt quá 50 ký tự' })
  unit: string

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Giá vaccine không hợp lệ' })
  @Min(0, { message: 'Giá vaccine không được nhỏ hơn 0' })
  price?: number

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Mô tả không được vượt quá 500 ký tự' })
  description?: string
}