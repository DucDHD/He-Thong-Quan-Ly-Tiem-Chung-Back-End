import { ConfigService } from '@nestjs/config'
import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm'

export const databaseConfig: TypeOrmModuleAsyncOptions = {
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => ({
    type: 'mssql',

    host: configService.get<string>('DATABASE_HOST'),
    port: Number(configService.get<string>('DATABASE_PORT')),
    username: configService.get<string>('DATABASE_USER'),
    password: configService.get<string>('DATABASE_PASSWORD'),
    database: configService.get<string>('DATABASE_NAME'),

    autoLoadEntities: true,

    synchronize: true,

    options: {
      encrypt: false,
      trustServerCertificate: true
    }
  })
}
