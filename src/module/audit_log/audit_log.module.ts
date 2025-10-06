import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuditLogService } from './audit_log.service';
import { AuditLogController } from './audit_log.controller';
import { AuthGuard } from '../jwt.guard';
import { RolesGuard } from '../role.guard';
import { PrismaService } from 'src/prisma.service';
import { Logs, LogsSchema } from './mongo/mongo.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Logs.name, schema: LogsSchema }]),
  ],
  controllers: [AuditLogController],
  providers: [AuditLogService, AuthGuard, RolesGuard, PrismaService],
  exports: [AuditLogService],
})
export class AuditLogModule {}