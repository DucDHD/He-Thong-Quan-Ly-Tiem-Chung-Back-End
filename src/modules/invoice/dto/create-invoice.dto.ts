import { IsInt, IsNotEmpty, IsNumber, Min } from 'class-validator'

export class CreateInvoiceDto {
  @IsNotEmpty({ message: 'Mã booking không được để trống' })
  @IsInt({ message: 'Mã booking phải là số nguyên' })
  booking_id: number

  @IsNotEmpty({ message: 'Mã người dùng không được để trống' })
  @IsInt({ message: 'Mã người dùng phải là số nguyên' })
  user_id: number

  @IsNotEmpty({ message: 'Mã vaccine không được để trống' })
  @IsInt({ message: 'Mã vaccine phải là số nguyên' })
  vaccine_id: number

  @IsNotEmpty({ message: 'Tổng tiền không được để trống' })
  @IsNumber({}, { message: 'Tổng tiền phải là số' })
  @Min(0, { message: 'Tổng tiền không hợp lệ' })
  total_amount: number
}