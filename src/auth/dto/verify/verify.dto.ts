import { IsNotEmpty, IsString, Matches, IsEmail } from 'class-validator'

export class VerifyDto {
  @IsString()
  @IsNotEmpty({ message: 'Mã OTP không được để trống' })
  @Matches(/^\d{6}$/, {message: 'Mã OTP phải gồm đúng 6 chữ số'})
  codeId: string

  @IsEmail({}, { message: 'Email không đúng định dạng' })
  @IsNotEmpty({  message: 'Email không được để trống' })
  email: string
}
