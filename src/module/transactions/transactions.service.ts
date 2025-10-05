import { Injectable } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { Response } from 'express';
import { PrismaService } from 'src/prisma.service';
import {
  createErrorResponse,
  createSuccessResponse,
} from 'src/common/response.util';
import { verify } from 'jsonwebtoken';
import { jwtPayload } from 'src/types/types';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}
  async create(body: CreateTransactionDto, res: Response) {
    try {
      if (!process.env.JWT_SECRET)
        return createErrorResponse([{ message: 'Internal Server Error' }]);
      const jwt = verify(
        res.req.cookies.access_token,
        process.env.JWT_SECRET,
      ) as jwtPayload;
      const transaction = await this.prisma.transactions.create({
        data: {
          ...body,
          user_id: jwt.sub,
        },
      });
      return createSuccessResponse(transaction);
    } catch (error) {
      console.error(error);
      return createErrorResponse([{ message: 'Error creating transaction' }]);
    }
  }

  async findAll(res: Response) {
    try {
      if (!process.env.JWT_SECRET)
        return createErrorResponse([{ message: 'Internal Server Error' }]);
      const jwt = verify(
        res.req.cookies.access_token,
        process.env.JWT_SECRET,
      ) as jwtPayload;
      const transactions = await this.prisma.transactions.findMany({
        where: { user_id: jwt.sub, familyId: null },
      });
      return createSuccessResponse(transactions);
    } catch (error) {
      console.error(error);
      return createErrorResponse([{ message: 'Error finding transactions' }]);
    }
  }

  async findOne(transactionId: string, res: Response) {
    try {
      if (!process.env.JWT_SECRET)
        return createErrorResponse([{ message: 'Interna Server Error' }]);
      const jwt = verify(
        res.req.cookies.access_token,
        process.env.JWT_SECRET,
      ) as jwtPayload;
      const transaction = await this.prisma.transactions.findFirst({
        where: {
          user_id: jwt.sub,
          id: transactionId,
        },
      });

      return createSuccessResponse(transaction);
    } catch (error) {
      console.error(error);
      return createErrorResponse([{ message: 'Error finding transaction' }]);
    }
  }

  async remove(id: string, res: Response) {
    try {
      if (!process.env.JWT_SECRET)
        return createErrorResponse([{ message: 'Interna Server Error' }]);
      const jwt = verify(
        res.req.cookies.access_token,
        process.env.JWT_SECRET,
      ) as jwtPayload;
      await this.prisma.transactions.delete({
        where: { id: id, user_id: jwt.sub },
      });

      return createSuccessResponse('Success deleting transaction');
    } catch (error) {
      console.error(error);
      return createErrorResponse([{ message: 'Error deleting transaction' }]);
    }
  }

  async findFamTransaction(res: Response) {
    try {
      console.log('Testing');
      if (!process.env.JWT_SECRET)
        return createErrorResponse([{ message: 'Interna Server Error' }]);
      const jwt = verify(
        res.req.cookies.access_token,
        process.env.JWT_SECRET,
      ) as jwtPayload;
      const user = await this.prisma.user.findUnique({
        where: { id: jwt.sub },
        include: { family: true },
      });

      if (!user?.familyId && user?.family)
        return createErrorResponse([
          { message: 'User does not belong to a family' },
        ]);
      let transactions;
      if (user?.role == 'FAMILY_ADMIN' && user.family) {
        transactions = await this.prisma.transactions.findMany({
          where: {
            familyId: user.family.id,
          },
        });
      } else {
        transactions = await this.prisma.transactions.findMany({
          where: {
            familyId: user?.familyId,
          },
        });
      }
     

      return createSuccessResponse(transactions);
    } catch (error) {
      console.error(error);
      return createErrorResponse([{ message: 'Error creating transaction' }]);
    }
  }

  async createFamily(res: Response, body: CreateTransactionDto) {
    try {
      if (!process.env.JWT_SECRET)
        return createErrorResponse([{ message: 'Interna Server Error' }]);
      const jwt = verify(
        res.req.cookies.access_token,
        process.env.JWT_SECRET,
      ) as jwtPayload;
      const transaction = await this.prisma.transactions.create({
        data: {
          ...body,
          user_id: jwt.sub,
        },
      });
      return createSuccessResponse(transaction);
    } catch (error) {
      console.error(error);
      return createErrorResponse([{ message: 'Error creating transaction' }]);
    }
  }
}
