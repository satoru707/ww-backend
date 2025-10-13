import { Injectable } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { Response } from 'express';
import { PrismaService } from 'src/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { AuditLogService } from '../audit_log/audit_log.service';
import { logEvent } from 'src/common/log.helper';
import { safeErrorMessage } from 'src/common/error.util';
import {
  createErrorResponse,
  createSuccessResponse,
} from 'src/common/response.util';
import { verify } from 'jsonwebtoken';
import { jwtPayload } from 'src/types/types';
import { getAccessTokenFromReq } from 'src/common/cookie.util';

@Injectable()
export class TransactionsService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationService,
    private logs: AuditLogService,
  ) {}
  async create(body: CreateTransactionDto, res: Response) {
    try {
      if (!process.env.JWT_SECRET)
        return createErrorResponse([{ message: 'Internal Server Error' }]);
      const token = getAccessTokenFromReq(res.req);
      const jwt = verify(token ?? '', process.env.JWT_SECRET) as jwtPayload;
      const transaction = await this.prisma.transactions.create({
        data: {
          ...body,
          user_id: jwt.sub,
        },
      });
      // create in-app notification (non-blocking)
      try {
        await this.notifications.createForUser(jwt.sub, {
          type: 'PUSH',
          message: `New transaction recorded: ₦${String(transaction.amount)}`,
        });
      } catch (e: unknown) {
        console.error(
          'Failed to create transaction notification',
          safeErrorMessage(e),
        );
      }
      // audit log
      await logEvent(this.logs, {
        userId: jwt.sub || 'N/A',
        actionType: 'TRANSACTION_CREATED',
        level: 'INFO',
        details: JSON.stringify({
          id: transaction.id,
          amount: transaction.amount,
          category: transaction.category,
        }),
      });
      return createSuccessResponse(transaction);
    } catch (err: unknown) {
      console.error(safeErrorMessage(err));
      await logEvent(this.logs, {
        userId: 'N/A',
        actionType: 'TRANSACTION_CREATED',
        level: 'ERROR',
        details: safeErrorMessage(err),
      });
      return createErrorResponse([{ message: 'Error creating transaction' }]);
    }
  }

  async findAll(res: Response) {
    try {
      if (!process.env.JWT_SECRET)
        return createErrorResponse([{ message: 'Internal Server Error' }]);
      const token = getAccessTokenFromReq(res.req);
      const jwt = verify(token ?? '', process.env.JWT_SECRET) as jwtPayload;
      const transactions = await this.prisma.transactions.findMany({
        where: { user_id: jwt.sub, familyId: null },
      });
      return createSuccessResponse(transactions);
    } catch (err: unknown) {
      console.error(safeErrorMessage(err));
      await logEvent(this.logs, {
        userId: 'N/A',
        actionType: 'TRANSACTION_FETCH',
        level: 'ERROR',
        details: safeErrorMessage(err),
      });
      return createErrorResponse([{ message: 'Error finding transactions' }]);
    }
  }

  async findOne(transactionId: string, res: Response) {
    try {
      if (!process.env.JWT_SECRET)
        return createErrorResponse([{ message: 'Interna Server Error' }]);
      const token = getAccessTokenFromReq(res.req);
      const jwt = verify(token ?? '', process.env.JWT_SECRET) as jwtPayload;
      const transaction = await this.prisma.transactions.findFirst({
        where: {
          user_id: jwt.sub,
          id: transactionId,
        },
      });

      return createSuccessResponse(transaction);
    } catch (err: unknown) {
      console.error(safeErrorMessage(err));
      await logEvent(this.logs, {
        userId: 'N/A',
        actionType: 'TRANSACTION_FETCH',
        level: 'ERROR',
        details: safeErrorMessage(err),
      });
      return createErrorResponse([{ message: 'Error finding transaction' }]);
    }
  }

  async remove(id: string, res: Response) {
    try {
      if (!process.env.JWT_SECRET)
        return createErrorResponse([{ message: 'Interna Server Error' }]);
      const token = getAccessTokenFromReq(res.req);
      const jwt = verify(token ?? '', process.env.JWT_SECRET) as jwtPayload;
      await this.prisma.transactions.delete({
        where: { id: id, user_id: jwt.sub },
      });

      return createSuccessResponse('Success deleting transaction');
    } catch (err: unknown) {
      console.error(safeErrorMessage(err));
      await logEvent(this.logs, {
        userId: 'N/A',
        actionType: 'TRANSACTION_DELETE',
        level: 'ERROR',
        details: safeErrorMessage(err),
      });
      return createErrorResponse([{ message: 'Error deleting transaction' }]);
    }
  }

  async findFamTransaction(res: Response) {
    try {
      console.log('Testing');
      if (!process.env.JWT_SECRET)
        return createErrorResponse([{ message: 'Interna Server Error' }]);
      const token = getAccessTokenFromReq(res.req);
      const jwt = verify(token ?? '', process.env.JWT_SECRET) as jwtPayload;
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
    } catch (err: unknown) {
      console.error(safeErrorMessage(err));
      await logEvent(this.logs, {
        userId: 'N/A',
        actionType: 'TRANSACTION_CREATED',
        level: 'ERROR',
        details: safeErrorMessage(err),
      });
      return createErrorResponse([{ message: 'Error creating transaction' }]);
    }
  }

  async createFamily(res: Response, body: CreateTransactionDto) {
    try {
      if (!process.env.JWT_SECRET)
        return createErrorResponse([{ message: 'Interna Server Error' }]);
      const token = getAccessTokenFromReq(res.req);
      const jwt = verify(token ?? '', process.env.JWT_SECRET) as jwtPayload;
      const transaction = await this.prisma.transactions.create({
        data: {
          ...body,
          user_id: jwt.sub,
        },
      });
      try {
        await this.notifications.createForUser(jwt.sub, {
          type: 'PUSH',
          message: `New family transaction: ₦${String(transaction.amount)}`,
        });
      } catch (e: unknown) {
        console.error(
          'Failed to create family transaction notification',
          safeErrorMessage(e),
        );
      }
      await logEvent(this.logs, {
        userId: jwt.sub || 'N/A',
        actionType: 'TRANSACTION_CREATED',
        level: 'INFO',
        details: JSON.stringify({
          id: transaction.id,
          amount: transaction.amount,
          familyId: transaction.familyId,
        }),
      });

      return createSuccessResponse(transaction);
    } catch (err: unknown) {
      console.error(safeErrorMessage(err));
      return createErrorResponse([{ message: 'Error creating transaction' }]);
    }
  }
}
