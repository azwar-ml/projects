import { Injectable, BadRequestException } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '../transactions/transaction.entity';

@Injectable()
export class AiService {
  private genAI: GoogleGenerativeAI;

  constructor(
    @InjectRepository(Transaction)
    private transactionRepo: Repository<Transaction>,
  ) {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error('GOOGLE_API_KEY is not set');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async askFinancialAdvisor(userId: string, question: string, userEmail: string) {
    try {
      // Get user's transaction data
      const transactions = await this.transactionRepo.find({
        where: { user: { id: userId } },
        relations: ['user'],
        order: { date: 'DESC' },
      });

      if (transactions.length === 0) {
        return {
          response: 'You have no transactions yet. Start adding your expenses to get financial insights!',
        };
      }

      // Calculate spending by category
      const categorySpending: { [key: string]: number } = {};
      let totalSpending = 0;

      transactions.forEach((tx) => {
        const category = tx.category || 'Other';
        categorySpending[category] = (categorySpending[category] || 0) + Number(tx.amount);
        totalSpending += Number(tx.amount);
      });

      // Calculate monthly spending
      const now = new Date();
      const currentMonth = transactions.filter((tx) => {
        const txDate = new Date(tx.date);
        return (
          txDate.getFullYear() === now.getFullYear() &&
          txDate.getMonth() === now.getMonth()
        );
      });

      const monthlyTotal = currentMonth.reduce((sum, tx) => sum + Number(tx.amount), 0);

      // Prepare context for Gemini
      const transactionSummary = `
User Email: ${userEmail}
Total Transactions: ${transactions.length}
Total Spending: PKR ${totalSpending.toFixed(2)}
Current Month Spending: PKR ${monthlyTotal.toFixed(2)}
Spending by Category: ${JSON.stringify(categorySpending, null, 2)}
Recent Transactions (last 10):
${transactions
  .slice(0, 10)
  .map(
    (tx) =>
      `- ${tx.description} (${tx.category}): PKR ${Number(tx.amount).toFixed(2)} on ${new Date(tx.date).toLocaleDateString()}`,
  )
  .join('\n')}
`;

      // UPDATED: Changed 'gemini-pro' to 'gemini-2.5-flash'
      const model = this.genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
      const prompt = `You are a financial advisor. Based on the user's transaction data, answer their question and provide insights.

TRANSACTION DATA:
${transactionSummary}

USER QUESTION: ${question}

Provide a helpful, concise financial advice response. If the question is about their spending, analyze the data and give specific recommendations.`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      return {
        response: text,
        transactionSummary: {
          totalSpending,
          monthlySpending: monthlyTotal,
          categoryBreakdown: categorySpending,
          transactionCount: transactions.length,
        },
      };
    } catch (error) {
      console.error('Error in askFinancialAdvisor:', error);
      throw new BadRequestException('Failed to get financial advice: ' + error.message);
    }
  }
}