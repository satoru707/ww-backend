import { Module } from '@nestjs/common';
import { BudgetService } from './budget.service';
import { BudgetController } from './budget.controller';
import { PrismaService } from 'src/prisma.service';
import { AuthGuard } from '../jwt.guard';
import { RolesGuard } from '../role.guard';

@Module({
  controllers: [BudgetController, PrismaService, AuthGuard, RolesGuard],
  providers: [BudgetService],
})
export class BudgetModule {}
