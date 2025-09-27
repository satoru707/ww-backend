import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaService } from 'src/prisma.service';
import { AuthGuard } from '../jwt.guard';

@Module({
  controllers: [UserController],
  providers: [UserService, PrismaService, AuthGuard],
})
export class UserModule {}
