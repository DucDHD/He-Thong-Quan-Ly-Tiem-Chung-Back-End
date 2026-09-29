import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { LoggingInterceptor } from './common/interceptors/logging.interceptor'

import { WinstonModule } from 'nest-winston'
import { loggerConfig } from './config/logger.config'
import { ValidationPipe } from '@nestjs/common'
import { corsOptions } from '@/config/cors.config'
import cookieParser from 'cookie-parser'


async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(loggerConfig)
  })

  app.use(cookieParser())

  // Prefix cho toàn bộ API
  app.setGlobalPrefix('v1')

   app.enableCors(corsOptions)

  // Global interceptor
  app.useGlobalInterceptors(new LoggingInterceptor())

  // Global validation
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))
  

  await app.listen(process.env.PORT ?? 8080)
}
bootstrap()
