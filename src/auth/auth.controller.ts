import { Body, Controller, Post, Res, Put, Get, Req, UnauthorizedException } from '@nestjs/common'
import { AuthService } from './auth.service'
import { RegisterDto } from './dto/register/register.dto'
import { VerifyDto } from './dto/verify/verify.dto'
import { ResendDto } from './dto/resend/resend.dto'
import { LoginDto } from './dto/login.dto/login.dto'
import type { Response, Request } from 'express'
import { UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from './passport/jwt-auth.guard'
import { UpdateProfileDto } from './dto/profile/update.dto'


@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService
  ) {}

  @Post('login')
  async login( @Body() loginDto: LoginDto , @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(loginDto)

    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 1000
    })

    res.cookie('refreshToken', result.refreshToken,
      {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 14 * 24 * 60 * 60 * 1000
      }
    )

    return {  message: 'Đăng nhập thành công' }
  }

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    

    return this.authService.handleRegister(registerDto)
  }

  @Post('verify')
  verifyOtp(@Body() verifyOtpDto: VerifyDto) {
    return this.authService.handleActiveUser(verifyOtpDto)
  }

  @Post('resend')
  resendOtp(@Body() resendDto: ResendDto) {
    return this.authService.handleResend(resendDto)
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() req: Request) {
    const user = req.user as {
      user_id: number
      email: string
      role: number
    }

    return this.authService.getProfile(user.user_id)
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile')
  async updateProfile( @Req() req: Request, @Body() updateProfileDto: UpdateProfileDto) {
    const user = req.user as {  user_id: number, email: string, role: number}
    return this.authService.updateProfile(  user.user_id,  updateProfileDto)
  }


  @Post('refresh_token')
  async refresh(  @Req() req: Request,@Res({ passthrough: true }) res: Response ) {

    const refreshToken = req.cookies?.refreshToken
    if (!refreshToken) {
      throw new UnauthorizedException('Không tìm thấy Refresh Token')
    }

    const result = await this.authService.refreshToken(refreshToken)

    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 1000
    })

    return {
      message: 'Làm mới Access Token thành công'
    }
  }

  @Post('logout')
  logout( @Res({ passthrough: true }) res: Response ) {
    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: false,
      sameSite: 'lax'
    })

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: false,
      sameSite: 'lax'
    })

    return {
      message: 'Đăng xuất thành công'
    }
  }

}
