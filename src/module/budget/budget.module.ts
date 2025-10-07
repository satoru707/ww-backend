import { Module } from '@nestjs/common';
import { BudgetService } from './budget.service';
import { BudgetController } from './budget.controller';
import { PrismaService } from 'src/prisma.service';
import { AuthGuard } from '../jwt.guard';
import { RolesGuard } from '../role.guard';
import { AuditLogModule } from '../audit_log/audit_log.module';

@Module({
  imports: [AuditLogModule],
  controllers: [BudgetController],
  providers: [BudgetService, PrismaService, AuthGuard, RolesGuard],
})
export class BudgetModule {}
