import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Invoice } from './entities/invoice.entity'
import { InvoiceDetail } from './entities/invoice-detail.entity'
import { CreateInvoiceDto } from './dto/create-invoice.dto'

@Injectable()
export class InvoiceService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,

    @InjectRepository(InvoiceDetail)
    private readonly invoiceDetailRepository: Repository<InvoiceDetail>
  ) {}

  async create(dto: CreateInvoiceDto) {
    // Tạo hóa đơn
    const invoice = this.invoiceRepository.create({
      booking_id: dto.booking_id,
      user_id: dto.user_id,
      total_amount: dto.total_amount
    })

    const savedInvoice = await this.invoiceRepository.save(invoice)

    // Tạo chi tiết hóa đơn
    const invoiceDetail = this.invoiceDetailRepository.create({
      invoice_id: savedInvoice.invoice_id,
      vaccine_id: dto.vaccine_id, // chỗ này sẽ lấy vaccine_id thật
      quantity: 1,
      unit_price: dto.total_amount // chỗ này sẽ lấy giá vaccine thật
    })

    await this.invoiceDetailRepository.save(invoiceDetail)

    return savedInvoice
  }
}