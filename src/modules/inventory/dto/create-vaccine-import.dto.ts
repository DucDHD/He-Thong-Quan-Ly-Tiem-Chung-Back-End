import { Type } from 'class-transformer'
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested
} from 'class-validator'

import { CreateVaccineImportDetailDto } from './create-vaccine-import-detail.dto'

export class CreateVaccineImportDto {


  @IsOptional()
  @IsString({ message: 'Ghi chú phải là chuỗi ký tự' })
  @MaxLength(500, { message: 'Ghi chú không được vượt quá 500 ký tự' })
  note?: string

  @IsDateString({}, { message: 'Ngày nhập phải là ngày hợp lệ (YYYY-MM-DD)' })
  import_date: string

  @IsArray({ message: 'Danh sách chi tiết nhập kho phải là một mảng' })
  @ArrayMinSize(1, { message: 'Phiếu nhập phải có ít nhất một vaccine' })
  @ValidateNested({ each: true })
  @Type(() => CreateVaccineImportDetailDto)
  details: CreateVaccineImportDetailDto[]
}