import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { PrismaService } from 'src/prisma.service';
import { AuthGuard } from '../jwt.guard';
import { RolesGuard } from '../role.guard';

@Module({
  controllers: [PaymentController],
  providers: [PaymentService, PrismaService, AuthGuard, RolesGuard],
})
export class PaymentModule {}
