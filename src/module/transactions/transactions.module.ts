import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { PrismaService } from 'src/prisma.service';
import { NotificationModule } from '../notification/notification.module';
import { AuditLogModule } from '../audit_log/audit_log.module';
import { AuthGuard } from '../jwt.guard';
import { RolesGuard } from '../role.guard';

@Module({
  imports: [NotificationModule, AuditLogModule],
  controllers: [TransactionsController],
  providers: [TransactionsService, PrismaService, AuthGuard, RolesGuard],
})
export class TransactionsModule {}
