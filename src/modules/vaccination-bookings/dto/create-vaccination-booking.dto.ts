import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator'

export class CreateVaccinationBookingDto {
  @IsNotEmpty({ message: 'Vui lòng chọn lịch tiêm' })
  @IsInt({ message: 'Lịch tiêm không hợp lệ' })
  schedule_id: number

  @IsNotEmpty({ message: 'Khách hàng không hợp lệ' })
  @IsInt({ message: 'Khách hàng không hợp lệ' })
  user_id: number

  @IsOptional()
  @IsString({ message: 'Ghi chú không hợp lệ' })
  @MaxLength(500, { message: 'Ghi chú không được vượt quá 500 ký tự' })
  note?: string
}