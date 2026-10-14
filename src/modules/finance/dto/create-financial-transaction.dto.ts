
import { IsEnum, IsNumber, IsPositive, IsString, IsNotEmpty, IsOptional, IsInt, IsDateString, MaxLength } from 'class-validator'
import { TransactionType } from '../entities/financial-transaction.entity'

export class CreateFinancialTransactionDto {
  @IsEnum(TransactionType, { message: 'Loại giao dịch phải là INCOME hoặc EXPENSE' })
  type: TransactionType

  @IsNumber({}, { message: 'Số tiền phải là số' })
  @IsPositive({ message: 'Số tiền phải lớn hơn 0' })
  amount: number

  @IsString({ message: 'Danh mục phải là chuỗi' })
  @IsNotEmpty({ message: 'Danh mục không được để trống' })
  @MaxLength(100, { message: 'Danh mục không được vượt quá 100 ký tự' })
  category: string

  @IsOptional()
  @IsInt({ message: 'Mã tham chiếu phải là số nguyên' })
  reference_id?: number

  @IsOptional()
  @IsString({ message: 'Loại tham chiếu phải là chuỗi' })
  reference_type?: string

  @IsDateString({}, { message: 'Ngày giao dịch không hợp lệ' })
  transaction_date: string

  @IsOptional()
  @IsString({ message: 'Ghi chú phải là chuỗi' })
  note?: string
}
