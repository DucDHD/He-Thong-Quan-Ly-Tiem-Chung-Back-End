import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator'

export class CreateVaccinationScheduleDto {
  @IsNotEmpty({ message: 'Vui lòng chọn ngày và giờ tiêm' })
  @IsDateString({}, { message: 'Ngày giờ tiêm không hợp lệ' })
  vaccination_date: string

  @IsNotEmpty({ message: 'Vui lòng chọn vaccine' })
  @IsInt({ message: 'Vaccine không hợp lệ' })
  vaccine_id: number

  @IsNotEmpty({ message: 'Vui lòng nhập số lượng' })
  @IsInt({ message: 'Số lượng phải là số nguyên' })
  @Min(1, { message: 'Số lượng phải lớn hơn 0' })
  capacity: number

  @IsNotEmpty({ message: 'Vui lòng nhập độ tuổi' })
  @IsString({ message: 'Độ tuổi không hợp lệ' })
  @MaxLength(100, { message: 'Độ tuổi không được vượt quá 100 ký tự' })
  age: string

  @IsNotEmpty({ message: 'Vui lòng chọn bác sĩ phụ trách' })
  @IsInt({ message: 'Bác sĩ không hợp lệ' })
  user_id: number

  @IsNotEmpty({ message: 'Vui lòng chọn địa điểm tiêm' })
  @IsInt({ message: 'Địa điểm tiêm không hợp lệ' })
  location_id: number;

  @IsOptional()
  @IsString({ message: 'Ghi chú không hợp lệ' })
  @MaxLength(500, { message: 'Ghi chú không được vượt quá 500 ký tự' })
  note?: string
}