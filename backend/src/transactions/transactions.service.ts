import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './transaction.entity';
import axios from 'axios';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepo: Repository<Transaction>,
  ) {}

  // 1. CREATE: Saves a new expense linked to the current User ID
  async create(data: any, userId: string) {
    const transaction = this.transactionRepo.create({
      ...data,
      user: { id: userId },
    });
    const savedTransaction = await this.transactionRepo.save(transaction);
    
    // Fetch the user email for the webhook
    const fullTransaction = await this.transactionRepo.findOne({
      where: { id: (savedTransaction as any).id },
      relations: ['user'],
    });
    
    // Check spending and trigger n8n webhook if needed
    if (fullTransaction?.user?.email) {
      await this.checkMonthlySpending(userId, fullTransaction.user.email);
    }
    
    return savedTransaction;
  }

  // 2. SUMMARY: Fetches all data for the table and calculates the totals
  async getSummary(userId: string) {
    const txs = await this.transactionRepo.find({ 
      where: { user: { id: userId } },
      relations: ['user'],
      order: { date: 'DESC' } // Most recent transactions appear at the top
    });

    // Converts string decimal from DB to numbers for accurate calculation
    const total = txs.reduce((sum, tx) => sum + Number(tx.amount), 0);
    
    return { 
      total, 
      count: txs.length, 
      transactions: txs 
    };
  }

  // 3. UPDATE: Updates a transaction
  async update(id: number, updateDto: any, userId: string) {
    const transaction = await this.transactionRepo.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.user.id !== userId) {
      throw new ForbiddenException('You can only edit your own transactions');
    }

    Object.assign(transaction, updateDto);
    return this.transactionRepo.save(transaction);
  }

  // 4. DELETE: Deletes a transaction
  async delete(id: number, userId: string) {
    const transaction = await this.transactionRepo.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.user.id !== userId) {
      throw new ForbiddenException('You can only delete your own transactions');
    }

    await this.transactionRepo.remove(transaction);
    return { message: 'Transaction deleted successfully' };
  }

  // 5. CHECK MONTHLY SPENDING & TRIGGER N8N
  private async checkMonthlySpending(userId: string, userEmail: string) {
    try {
      // Get all transactions for the user
      const allTransactions = await this.transactionRepo.find({
        where: { user: { id: userId } },
        relations: ['user'],
      });

      // Calculate current month's total spending
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      // Filter by date range
      const monthlyTransactions = allTransactions.filter(tx => {
        const txDate = new Date(tx.date);
        return txDate >= startOfMonth && txDate <= endOfMonth;
      });

      const totalMonthlySpending = monthlyTransactions.reduce(
        (sum, tx) => sum + Number(tx.amount), 
        0
      );

      // If spending > 50000, send alert to n8n
      if (totalMonthlySpending > 50000) {
        const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
        if (n8nWebhookUrl) {
          await axios.post(n8nWebhookUrl, {
            email: userEmail,
            amount: totalMonthlySpending,
            timestamp: new Date().toISOString(),
            message: `Alert: Monthly spending exceeded 50,000 PKR`
          });
        }
      }
    } catch (error) {
      console.error('Error checking monthly spending:', error);
      // Don't throw - let the transaction save succeed even if webhook fails
    }
  }
}