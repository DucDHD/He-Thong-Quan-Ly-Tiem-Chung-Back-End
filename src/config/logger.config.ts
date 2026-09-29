// src/config/logger.config.ts

import { utilities as nestWinstonModuleUtilities } from 'nest-winston'
import * as winston from 'winston'
import 'winston-daily-rotate-file'

const { combine, timestamp, printf, errors } = winston.format

const fileFormat = printf(({ timestamp, level, message, stack }) => {
  return `${timestamp} [${level.toUpperCase()}] ${stack || message}`
})

export const loggerConfig: winston.LoggerOptions = {
  transports: [
    // Terminal
    new winston.transports.Console({
      format: combine(
        timestamp(),
        nestWinstonModuleUtilities.format.nestLike('VaccineManagement', {
          colors: true,
          prettyPrint: true
        })
      )
    }),

    // Application: không ghi ERROR
    new winston.transports.DailyRotateFile({
      dirname: 'logs',
      filename: 'application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '30d',
      maxSize: '20m',

      format: combine(
        timestamp({
          format: 'YYYY-MM-DD HH:mm:ss'
        }),
        errors({
          stack: true
        }),
        fileFormat
      )
    }),

    // Chỉ error
    new winston.transports.DailyRotateFile({
      level: 'error',
      dirname: 'logs',
      filename: 'error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '30d',
      maxSize: '20m',

      format: combine(
        timestamp({
          format: 'YYYY-MM-DD HH:mm:ss'
        }),
        errors({
          stack: true
        }),
        fileFormat
      )
    })
  ]
}
