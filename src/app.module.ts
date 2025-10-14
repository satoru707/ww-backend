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
import { PaymentModule } from './module/payment/payment.module';
import { AuditLogModule } from './module/audit_log/audit_log.module';
import { NotificationModule } from './module/notification/notification.module';
import { deptplanModule } from './module/debtplan/debit_plan.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { UserAwareCacheInterceptor } from './user-aware-cache.interceptor';
import { redisStore } from 'cache-manager-redis-yet';

@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot({ isGlobal: true }),
    UserModule,
    FamilyModule,
    GoalModule,
    TransactionsModule,
    BudgetModule,
    InvestmentModule,
    PaymentModule,
    deptplanModule,
    NotificationModule,
    AuditLogModule,
    MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/wealthwave'),
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60000, limit: 10 }],
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => ({
        store: await redisStore({
          socket: {
            host: process.env.REDIS_HOST || '127.0.0.1',
            port: Number(process.env.REDIS_PORT) || 6379,
          },
          ttl: 60 * 10,
        }),
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService, { provide: APP_INTERCEPTOR, useClass: UserAwareCacheInterceptor }],
})
export class AppModule {}
