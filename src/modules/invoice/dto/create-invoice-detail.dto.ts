import { IsInt, IsNotEmpty, IsNumber, Min } from 'class-validator'

export class CreateInvoiceDetailDto {
  @IsNotEmpty({ message: 'Mã hóa đơn không được để trống' })
  @IsInt({ message: 'Mã hóa đơn phải là số nguyên' })
  invoice_id: number

  @IsNotEmpty({ message: 'Mã vaccine không được để trống' })
  @IsInt({ message: 'Mã vaccine phải là số nguyên' })
  vaccine_id: number

  @IsNotEmpty({ message: 'Số lượng không được để trống' })
  @IsInt({ message: 'Số lượng phải là số nguyên' })
  @Min(1, { message: 'Số lượng phải lớn hơn hoặc bằng 1' })
  quantity: number

  @IsNotEmpty({ message: 'Đơn giá không được để trống' })
  @IsNumber({}, { message: 'Đơn giá phải là số' })
  @Min(0, { message: 'Đơn giá không được nhỏ hơn 0' })
  unit_price: number
}