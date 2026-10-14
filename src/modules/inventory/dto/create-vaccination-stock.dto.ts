import {
  IsInt,
  IsString,
  IsDateString,
  IsNumber,
  IsNotEmpty,
  Min,
  MaxLength
} from 'class-validator'
import { Type } from 'class-transformer'

export class CreateVaccinationStockDto {
  @Type(() => Number)
  @IsInt({ message: 'ID vaccine phải là số nguyên' })
  @Min(1, { message: 'Vui lòng chọn vaccine' })
  vaccine_id: number

  @IsNotEmpty({ message: 'Vui lòng nhập mã lô vaccine' })
  @IsString({ message: 'Mã lô vaccine phải là chuỗi ký tự' })
  @MaxLength(100, {
    message: 'Mã lô không được vượt quá 100 ký tự'
  })
  lot_code: string

  @IsNotEmpty({ message: 'Vui lòng nhập hạn sử dụng' })
  @IsDateString({}, {
    message: 'Hạn sử dụng không hợp lệ'
  })
  expiry_date: string

  @Type(() => Number)
  @IsInt({ message: 'Số lượng phải là số nguyên' })
  @Min(0, {
    message: 'Số lượng không được nhỏ hơn 0'
  })
  quantity: number

  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Đơn giá phải là số hợp lệ, tối đa 2 chữ số thập phân' }
  )
  @Min(0, {
    message: 'Đơn giá không được nhỏ hơn 0'
  })
  unit_price: number
}