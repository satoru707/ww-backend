import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { AuthModule } from './module/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './module/user/user.module';
import { FamilyModule } from './module/family/family.module';
import { GoalModule } from './module/goal/goal.module';
import { TransactionsModule } from './module/transactions/transactions.module';
import { BudgetModule } from './module/budget/budget.module';
import { InvestmentModule } from './module/investment/investment.module';

// nest g resource <name>
@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot(),
    UserModule,
    FamilyModule,
    GoalModule,
    TransactionsModule,
    BudgetModule,
    InvestmentModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
