import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from 'src/prisma.service';
import { AuditLogModule } from '../audit_log/audit_log.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [AuditLogModule, NotificationModule],
  controllers: [AuthController],
  providers: [AuthService, PrismaService],
  exports: [AuthService],
})
export class AuthModule {}
 