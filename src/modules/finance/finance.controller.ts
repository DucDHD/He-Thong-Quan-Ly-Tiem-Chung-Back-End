
import { Body, Controller, Post, Req, UseGuards, Get, Patch, Param, ParseIntPipe } from '@nestjs/common'
import { FinanceService } from './finance.service'
import { CreateFinancialTransactionDto } from './dto/create-financial-transaction.dto'
import { JwtAuthGuard } from '@/auth/passport/jwt-auth.guard'
import { RolesGuard } from '@/common/guards/roles.guard'
import { Roles } from '@/common/decorators/roles.decorator'
import { UserRole } from '@/common/user-role'


  @UseGuards(JwtAuthGuard, RolesGuard)
  @Controller('finance')
  export class FinanceController {
    constructor(
      private readonly financeService: FinanceService
    ) {}


    @Post('transactions')
    createTransaction(@Body() dto: CreateFinancialTransactionDto, @Req() req: any) {
      return this.financeService.createTransaction(dto, req.user.user_id)
    }

    @Get('customer')
    getAll() {
      return this.financeService.getAllfinanceCustomer()
    }

    
    @Patch('payment/:id')
    async confirmPayment( @Param('id', ParseIntPipe) invoiceId: number, @Req() req: any ) {
      return this.financeService.confirmPayment(
        invoiceId,
        req.user.user_id
      )
    }

    @Get('supplier')
    getAllSupplierTransactions() {
      return this.financeService.getAllSupplierTransactions();
    }
  }
