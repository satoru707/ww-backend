import { Module } from '@nestjs/common';
import { AuditLogService } from './audit_log.service';
import { AuditLogController } from './audit_log.controller';
import { AuthGuard } from '../jwt.guard';
import { RolesGuard } from '../role.guard';

@Module({
  controllers: [AuditLogController],
  providers: [AuditLogService, AuthGuard, RolesGuard],
})
export class AuditLogModule {}
