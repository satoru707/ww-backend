import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma.service';
import { Response } from 'express';
import {
  createSuccessResponse,
  createErrorResponse,
} from 'src/common/response.util';
import { verify } from 'jsonwebtoken';
import { jwtPayload } from 'src/types/types';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async find(res: Response) {
    try {
      const jwt = await res.cookie['access_token'];
      if (!process.env.JWT_SECERT)
        return createErrorResponse([{ message: 'Internal Server Error' }]);
      const token = verify(jwt, process.env.JWT_SECERT) as jwtPayload;
      const user = this.prisma.user.findFirst({
        where: {
          id: token.sub,
          email: token.email,
        },
        select: {
          tokens: true,
          goals: true,
          transactions: true,
          budgets: true,
          investments: true,
          payments: true,
          debt_plans: true,
          community_posts: true,
          challenge_participants: true,
          notifications: true,
          sustainability_scores: true,
        },
      });
      return createSuccessResponse(user);
    } catch (error) {
      console.error(error);
      return createErrorResponse([{ message: 'Error returning user object' }]);
    }
  }

  async update(res: Response, updateUserDto) {
    try {
      const jwt = await res.cookie['access_token'];
      if (!process.env.JWT_SECERT)
        return createErrorResponse([{ message: 'Internal Server Error' }]);
      const token = verify(jwt, process.env.JWT_SECERT) as jwtPayload;
      const user = await this.prisma.user.update({
        where: {
          id: token.sub,
          email: token.email,
        },
        data: updateUserDto,
        select: {
          tokens: true,
        },
      });
      const refresh = res.cookie['refresh_token'];
      if (updateUserDto.role && refresh) {
        await this.prisma.token.delete({
          where: {
            id: user.tokens.filter((token) => token.type === 'REFRESH')[0].id,
          },
        });
        res.clearCookie('refresh_token');
        res.clearCookie('access_token');
      }

      return createSuccessResponse('User updated successfully');
    } catch (error) {
      console.error(error);
      return createErrorResponse([{ message: 'Error updating user' }]);
    }
  }

  async findAll() {
    const users = await this.prisma.user.findMany();

    return createSuccessResponse(users);
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  remove(id: string) {
    try {
      return createSuccessResponse('User deleted');
    } catch (error) {
      console.error(error);
      return createErrorResponse([{ message: 'Error deleting user' }]);
    }
  }
}
