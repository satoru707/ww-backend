import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { AuthModule } from './module/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './module/user/user.module';

// nest g resource <name>
@Module({
  imports: [AuthModule, ConfigModule.forRoot(), UserModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
