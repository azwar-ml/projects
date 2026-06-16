import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('ai')
export class AiController {
  constructor(private aiService: AiService) {}

  @UseGuards(JwtAuthGuard)
  @Post('ask')
  async askAdvisor(@Body() body: any, @Request() req) {
    const { question } = body;
    if (!question) {
      throw new Error('Question is required');
    }
    return this.aiService.askFinancialAdvisor(req.user.userId, question, req.user.email);
  }
}
