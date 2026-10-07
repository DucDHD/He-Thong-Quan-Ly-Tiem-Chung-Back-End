import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Invoice } from './entities/invoice.entity'
import { InvoiceDetail } from './entities/invoice-detail.entity'
import { InvoiceController } from './invoice.controller'
import { InvoiceService } from './invoice.service'

@Module({
  imports: [TypeOrmModule.forFeature([Invoice, InvoiceDetail])],
  controllers: [InvoiceController],
  providers: [InvoiceService],
  exports: [InvoiceService]
})
export class InvoiceModule {}