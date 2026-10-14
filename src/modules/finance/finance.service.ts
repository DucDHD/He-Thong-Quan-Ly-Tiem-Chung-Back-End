
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { FinancialTransaction, TransactionType } from './entities/financial-transaction.entity'
import { CreateFinancialTransactionDto } from './dto/create-financial-transaction.dto'


@Injectable()
export class FinanceService {
  constructor(
    @InjectRepository(FinancialTransaction)
    private readonly financeRepository: Repository<FinancialTransaction>
  ) {}

  async createTransaction(dto: CreateFinancialTransactionDto, userId: number) {
    const transaction = this.financeRepository.create({
      type: dto.type,
      amount: dto.amount,
      category: dto.category,
      reference_id: dto.reference_id ?? null,
      reference_type: dto.reference_type ?? null,
      user_id: userId,
      transaction_date: new Date(dto.transaction_date),
      note: dto.note ?? null
    })

    return await this.financeRepository.save(transaction)
  }

  
async getAllfinanceCustomer() {
  return await this.financeRepository.manager
    .createQueryBuilder()
    .from('invoices', 'invoice')
    .innerJoin(
      'invoice_details',
      'detail',
      'detail.invoice_id = invoice.invoice_id'
    )
    .innerJoin(
      'vaccination_bookings',
      'booking',
      'booking.booking_id = invoice.booking_id'
    )
    .innerJoin(
      'vaccination_schedules',
      'schedule',
      'schedule.schedule_id = booking.schedule_id'
    )
    .innerJoin(
      'vaccines',
      'vaccine',
      'vaccine.vaccine_id = detail.vaccine_id'
    )
    .innerJoin(
      'users',
      'user',
      'user.user_id = invoice.user_id'
    )
    .select([
      'invoice.invoice_id AS invoice_id',
      'schedule.vaccination_date AS vaccination_date',
      'invoice.invoice_code AS invoice_code',
      'vaccine.vaccine_name AS vaccine_name',
      'detail.quantity AS quantity',
      'user.fullName AS fullName',
      'detail.unit_price AS unit_price',
      'invoice.status AS status'
    ])
    .where('booking.status = :status', {
      status: 'COMPLETED'
    })
    .orderBy('schedule.vaccination_date', 'DESC')
    .getRawMany()
}


async confirmPayment(invoiceId: number, userId: number) {
  return await this.financeRepository.manager.transaction(
    async (manager) => {
      // 1. Khóa hóa đơn để tránh xác nhận thanh toán đồng thời
      const invoices = await manager.query(
        `
        SELECT invoice_id, invoice_code, total_amount, status
        FROM invoices WITH (UPDLOCK, HOLDLOCK)
        WHERE invoice_id = @0
        `,
        [invoiceId],
      );

      const invoice = invoices[0];

      if (!invoice) {
        throw new NotFoundException('Hóa đơn không tồn tại');
      }

      if (invoice.status === 'PAID') {
        throw new BadRequestException('Hóa đơn đã được thanh toán');
      }

      if (invoice.status !== 'PENDING') {
        throw new BadRequestException(
          'Trạng thái hóa đơn không hợp lệ để thanh toán',
        );
      }

      // 2. Cập nhật trạng thái hóa đơn
      await manager
        .createQueryBuilder()
        .update('invoices')
        .set({ status: 'PAID' })
        .where('invoice_id = :invoiceId', { invoiceId })
        .execute();

      // 3. Ghi nhận doanh thu
      const transaction = manager.create(
        this.financeRepository.target,
        {
          type: TransactionType.INCOME,
          amount: Number(invoice.total_amount),
          category: 'VACCINATION_PAYMENT',
          reference_id: invoiceId,
          reference_type: 'INVOICE',
          user_id: userId,
          transaction_date: new Date(),
          note: `Thanh toán hóa đơn ${invoice.invoice_code}`,
        },
      );

      await manager.save(transaction);

      return {
        message: 'Xác nhận thanh toán thành công',
        invoice_id: invoiceId,
        invoice_code: invoice.invoice_code,
        status: 'PAID',
      }
    },
  )
}

async getAllSupplierTransactions() {
  return await this.financeRepository.manager
    .createQueryBuilder()
    .from('vaccine_imports', 'vi')
    .innerJoin(
      'vaccine_import_details',
      'vid',
      'vid.import_id = vi.import_id',
    )
    .innerJoin(
      'vaccines',
      'v',
      'v.vaccine_id = vid.vaccine_id',
    )
    .select([
      'vi.import_id AS import_id',
      'vi.import_date AS import_date',
      'vi.invoice_code AS invoice_code',
      'v.vaccine_id AS vaccine_id',
      'v.vaccine_name AS vaccine_name',
      'vid.quantity AS quantity',
      'vid.unit_price AS unit_price',
      '(vid.quantity * vid.unit_price) AS total_price',
      `CASE
        WHEN EXISTS (
          SELECT 1
          FROM financial_transactions ft
          WHERE ft.reference_id = vi.import_id
            AND ft.reference_type = 'VACCINE_IMPORT'
            AND ft.type = 'EXPENSE'
        )
        THEN 'PAID'
        ELSE 'PENDING'
      END AS status`,
    ])
    .orderBy('vi.import_date', 'DESC')
    .addOrderBy('vi.import_id', 'DESC')
    .getRawMany();
}

}
