import { Module } from '@nestjs/common';
import { GoalService } from './goal.service';
import { GoalController } from './goal.controller';
import { PrismaService } from 'src/prisma.service';
import { AuthGuard } from '../jwt.guard';
import { RolesGuard } from '../role.guard';
import { AuditLogModule } from '../audit_log/audit_log.module';

@Module({
  imports: [AuditLogModule],
  controllers: [GoalController],
  providers: [GoalService, AuthGuard, RolesGuard, PrismaService],
})
export class GoalModule {}
