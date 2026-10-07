import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { Vaccine } from './entities/vaccine.entity'
import { VaccinesController } from './vaccines.controller'
import { VaccinesService } from './vaccines.service'

@Module({
  imports: [TypeOrmModule.forFeature([Vaccine])],
  controllers: [VaccinesController],
  providers: [VaccinesService],
  exports: [VaccinesService]
})
export class VaccinesModule {}