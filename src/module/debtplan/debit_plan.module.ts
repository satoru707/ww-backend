import { Module } from '@nestjs/common';
import { deptplanService } from './debt_plan.service';
import { deptplanController } from './debit_plan.controller';
import { PrismaService } from 'src/prisma.service';
import { AuthGuard } from '../jwt.guard';
import { RolesGuard } from '../role.guard';

@Module({
  controllers: [deptplanController],
  providers: [deptplanService, PrismaService, AuthGuard, RolesGuard],
})
export class deptplanModule {}
