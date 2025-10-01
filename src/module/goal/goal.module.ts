import { Module } from '@nestjs/common';
import { GoalService } from './goal.service';
import { GoalController } from './goal.controller';
import { PrismaService } from 'src/prisma.service';
import { AuthGuard } from '../jwt.guard';
import { RolesGuard } from '../role.guard';

@Module({
  controllers: [GoalController],
  providers: [GoalService, AuthGuard, RolesGuard, PrismaService],
})
export class GoalModule {}
