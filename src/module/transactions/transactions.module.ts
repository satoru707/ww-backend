import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { PrismaService } from 'src/prisma.service';
import { AuthGuard } from '../jwt.guard';
import { RolesGuard } from '../role.guard';

@Module({
  controllers: [TransactionsController],
  providers: [TransactionsService, PrismaService, AuthGuard, RolesGuard],
})
export class TransactionsModule {}
