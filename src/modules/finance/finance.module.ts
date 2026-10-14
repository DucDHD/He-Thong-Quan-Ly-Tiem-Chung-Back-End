
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { FinancialTransaction } from './entities/financial-transaction.entity'
import { FinanceController } from './finance.controller'
import { FinanceService } from './finance.service'

@Module({
  imports: [TypeOrmModule.forFeature([FinancialTransaction])],
  controllers: [FinanceController],
  providers: [FinanceService],
  exports: [FinanceService]
})
export class FinanceModule {}
