import { Module } from '@nestjs/common';
import { deptplanService } from './debt_plan.service';
import { deptplanController } from './debit_plan.controller';
import { PrismaService } from 'src/prisma.service';
import { AuthGuard } from '../jwt.guard';
import { RolesGuard } from '../role.guard';
import { AuditLogModule } from '../audit_log/audit_log.module';

@Module({
  imports: [AuditLogModule],
  controllers: [deptplanController],
  providers: [deptplanService, PrismaService, AuthGuard, RolesGuard],
})
export class deptplanModule {}
