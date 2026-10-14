import {
  IsArray,
  ArrayMinSize,
  IsInt,
  IsOptional,
  IsString,
  IsDateString,
  Min,
  ValidateNested,
  IsNotEmpty
} from 'class-validator'
import { Type } from 'class-transformer'

export class CreateVaccineExportDetailDto  {
  @Type(() => Number)
  @IsInt({ message: 'ID tồn kho phải là số nguyên' })
  @Min(1, { message: 'Vui lòng chọn vaccine cần xuất' })
  inventory_id: number

  @Type(() => Number)
  @IsInt({ message: 'Số lượng xuất phải là số nguyên' })
  @Min(1, { message: 'Số lượng xuất phải lớn hơn 0' })
  quantity: number
}

export class CreateVaccineExportDto  {
  @IsNotEmpty({ message: 'Vui lòng chọn ngày xuất vaccine' })
  @IsDateString({}, { message: 'Ngày xuất vaccine không hợp lệ' })
  export_date: string

  @IsOptional()
  @IsString({ message: 'Ghi chú phải là chuỗi ký tự' })
  note?: string

  @IsArray({ message: 'Danh sách vaccine xuất phải là một mảng' })
  @ArrayMinSize(1, {
    message: 'Vui lòng chọn ít nhất một vaccine để xuất'
  })
  @ValidateNested({ each: true })
  @Type(() => CreateVaccineExportDetailDto)
  details: CreateVaccineExportDetailDto[]
}