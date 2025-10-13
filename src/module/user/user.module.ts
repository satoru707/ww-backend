import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaService } from 'src/prisma.service';
import { AuthGuard } from '../jwt.guard';
import { RolesGuard } from '../role.guard';
import { AuthService } from '../auth/auth.service';
import { AuditLogModule } from '../audit_log/audit_log.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [AuditLogModule, NotificationModule],
  controllers: [UserController],
  providers: [UserService, PrismaService, AuthGuard, RolesGuard, AuthService],
})
export class UserModule {}
