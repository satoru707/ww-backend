import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { PrismaService } from 'src/prisma.service';
import { AuthGuard } from '../jwt.guard';
import { RolesGuard } from '../role.guard';
import { AuthService } from '../auth/auth.service';

@Module({
  controllers: [TransactionsController],
  providers: [
    TransactionsService,
    PrismaService,
    AuthGuard,
    RolesGuard,
    AuthService,
  ],
})
export class TransactionsModule {}
