import { Controller, Post, Get, Patch, Delete, Body, UseGuards, Request, Param } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('transactions')
export class TransactionsController {
  constructor(private transactionsService: TransactionsService) {}

  // 1. ADD TRANSACTION
  @UseGuards(JwtAuthGuard)
  @Post('add')
  async create(@Body() createTransactionDto: any, @Request() req) {
    return this.transactionsService.create(createTransactionDto, req.user.userId);
  }

  // 2. GET RECENT TRANSACTIONS (For the Table)
  @UseGuards(JwtAuthGuard)
  @Get('summary')
  async getSummary(@Request() req) {
    return this.transactionsService.getSummary(req.user.userId);
  }

  // 3. GET CALCULATED METRICS (For the Cards)
  @UseGuards(JwtAuthGuard)
  @Get('metrics')
  async getMetrics(@Request() req) {
    const summary = await this.transactionsService.getSummary(req.user.userId);
    
    // Logic for cards: total balance vs monthly spending
    return {
      totalBalance: summary.total,
      monthlyExpenses: summary.total, // You can add logic here to filter only current month
    };
  }

  // 4. UPDATE TRANSACTION
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(@Param('id') id: number, @Body() updateDto: any, @Request() req) {
    return this.transactionsService.update(id, updateDto, req.user.userId);
  }

  // 5. DELETE TRANSACTION
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id') id: number, @Request() req) {
    return this.transactionsService.delete(id, req.user.userId);
  }
}