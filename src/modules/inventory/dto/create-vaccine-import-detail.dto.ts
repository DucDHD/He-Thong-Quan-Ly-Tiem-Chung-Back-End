import { Type } from 'class-transformer'
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  MaxLength,
  Min
} from 'class-validator'

export class CreateVaccineImportDetailDto {
  @Type(() => Number)
  @IsInt({ message: 'Mã vaccine phải là số nguyên' })
  @IsPositive({ message: 'Mã vaccine phải lớn hơn 0' })
  vaccine_id: number

  @IsString({ message: 'Số lô vaccine phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Số lô vaccine không được để trống' })
  @MaxLength(100, { message: 'Số lô vaccine không được vượt quá 100 ký tự' })
  lot_code: string

  @IsDateString({}, { message: 'Ngày hết hạn phải là ngày hợp lệ (YYYY-MM-DD)' })
  expiry_date: string

  @Type(() => Number)
  @IsInt({ message: 'Số lượng phải là số nguyên' })
  @IsPositive({ message: 'Số lượng phải lớn hơn 0' })
  quantity: number

  @Type(() => Number)
  @IsNumber({}, { message: 'Đơn giá phải là số hợp lệ' })
  @Min(0, { message: 'Đơn giá không được nhỏ hơn 0' })
  unit_price: number
}