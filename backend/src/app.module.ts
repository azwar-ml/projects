import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { TransactionsModule } from './transactions/transactions.module';
import { AiModule } from './ai/ai.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    // 1. Load the .env file
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // 2. Connect to PostgreSQL (Neon.tech)
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: true, // Automatically creates tables for 'User' and 'Transaction'
      ssl: {
        rejectUnauthorized: false, // Required for Neon cloud connection
      },
    }),
    AuthModule,
    TransactionsModule,
    AiModule,
    UsersModule,
  ],
}) 
export class AppModule {}