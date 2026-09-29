import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common'
import { Request, Response } from 'express'
import { Observable, tap } from 'rxjs'

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name)

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>()
    const response = context.switchToHttp().getResponse<Response>()

    const { method, originalUrl } = request
    const startTime = Date.now()

    this.logger.log(`→ ${method} ${originalUrl}`)

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime

        this.logger.log(`← ${method} ${originalUrl} ${response.statusCode} - ${duration}ms`)
      })
    )
  }
}
