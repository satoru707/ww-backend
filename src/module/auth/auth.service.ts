import { Injectable } from '@nestjs/common';
import crypto from 'crypto';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { PrismaService } from 'src/prisma.service';
import {
  ApiResponse,
  createErrorResponse,
  createSuccessResponse,
} from 'src/common/response.util';
import { AuthEntity } from './entities/auth.entity';
import bcrypt from 'node_modules/bcryptjs';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}
  async create(createAuthDto: CreateAuthDto) {
    try {
      const hashed = await bcrypt.hash(createAuthDto.password, 10);
      const userExists = await this.prisma.user.findFirst({
        where: { email: createAuthDto.email },
      });
      if (userExists) {
        return createErrorResponse([{ message: 'User already exists' }]);
      }
      const user = await this.prisma.user.create({
        data: {
          name: createAuthDto.name,
          email: createAuthDto.email,
          password: hashed,
        },
      });
      const nonce = crypto.randomBytes(32).toString('hex');
      // send verification mail
      await this.prisma.token.create({
        data: {
          user_id: user.id,
          token: nonce,
          type: 'CONFIRMATION',
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });

      return createSuccessResponse('Verify Email');
    } catch (error) {
      console.error(error);
      return createErrorResponse([{ message: 'Error creating email' }]);
    }
  }

  async check(
    checkAuthDto: { email: string; password: string },
    res: Response,
  ) {
    try {
      const userExists = await this.prisma.user.findFirst({
        where: { email: checkAuthDto.email },
      });
      if (!userExists)
        return createErrorResponse([{ message: 'User does not exist' }]);
      const pass = bcrypt.compare(checkAuthDto.password, userExists.password);
      if (!pass)
        return createErrorResponse([{ message: 'Invalid Credentials' }]);
      // can send verification mail again
      if (userExists.status == 'PENDING')
        return createErrorResponse([{ message: 'Verify email' }]);
      // send jwt and refresh token in cookie
      const nonce = crypto.randomBytes(32).toString('hex');
      await this.prisma.token.create({
        data: {
          user_id: userExists.id,
          token: nonce,
          type: 'REFRESH',
          expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
        },
      });
      return createSuccessResponse('Login successful');
    } catch (error) {
      console.error(error);
      return createErrorResponse([{ message: 'Error logging in' }]);
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
