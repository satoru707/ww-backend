import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { PrismaService } from 'src/prisma.service';
import { AuthGuard } from '../jwt.guard';
import { RolesGuard } from '../role.guard';

@Module({
  controllers: [NotificationController],
  providers: [NotificationService, PrismaService, AuthGuard, RolesGuard],
  exports: [NotificationService],
})
export class NotificationModule {}
