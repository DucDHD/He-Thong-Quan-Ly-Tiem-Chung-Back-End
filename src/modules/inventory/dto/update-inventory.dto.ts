
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength
} from 'class-validator'

export class UpdateInventoryDto {
  @IsOptional()
  @IsString({ message: 'Số lô vaccine phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Số lô vaccine không được để trống' })
  @MaxLength(100, { message: 'Số lô vaccine không được vượt quá 100 ký tự' })
  batch_number?: string

  @IsOptional()
  @IsDateString({}, { message: 'Ngày hết hạn phải là ngày hợp lệ (YYYY-MM-DD)' })
  expiry_date?: string
}
