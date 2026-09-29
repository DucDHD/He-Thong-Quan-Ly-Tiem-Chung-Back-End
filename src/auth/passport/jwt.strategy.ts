import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-jwt'
import { ConfigService } from '@nestjs/config'
import { Request } from 'express'

import { JwtPayload } from '../interfaces/jwt-payload.interface'


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor( private readonly configService: ConfigService) {
    super({
      jwtFromRequest:(req: Request) => { 
        return req?.cookies?.accessToken ?? null
      
      },
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('ACCESS_TOKEN_SECRET_SIGNATURE'),
    })
  }

  validate(payload: JwtPayload) {
    return {
        user_id: payload.user_id,
        fullName: payload.fullName,
        role: payload.role
    }
  }
}