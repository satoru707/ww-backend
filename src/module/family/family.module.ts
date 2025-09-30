import { Module } from '@nestjs/common';
import { FamilyService } from './family.service';
import { FamilyController } from './family.controller';
import { PrismaService } from 'src/prisma.service';
import { AuthGuard } from '../jwt.guard';
import { RolesGuard } from '../role.guard';
import { AuthService } from '../auth/auth.service';

@Module({
  controllers: [FamilyController],
  providers: [FamilyService, AuthGuard, RolesGuard, PrismaService, AuthService],
})
export class FamilyModule {}
