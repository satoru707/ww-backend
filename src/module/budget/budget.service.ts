import { Injectable } from '@nestjs/common';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { Response } from 'express';
import {
  createSuccessResponse,
  createErrorResponse,
} from 'src/common/response.util';
import { verify } from 'jsonwebtoken';
import { jwtPayload } from 'src/types/types';
import { getAccessTokenFromReq } from 'src/common/cookie.util';
import { safeErrorMessage } from 'src/common/error.util';
import { PrismaService } from 'src/prisma.service';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class BudgetService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationService,
  ) {}
  async create(createBudget: CreateBudgetDto, res: Response) {
    try {
      if (!process.env.JWT_SECRET)
        return createErrorResponse([{ message: 'Server Error' }]);
      const token = getAccessTokenFromReq(res.req);
      const jwt = verify(token ?? '', process.env.JWT_SECRET) as jwtPayload;
      const budget = await this.prisma.budget.create({
        data: { ...createBudget, user_id: jwt.sub },
      });
      try {
        await this.notifications.createForUser(jwt.sub, {
          type: 'PUSH',
          message: `Budget created: ${budget.category}`,
        });
      } catch (e: unknown) {
        console.error(
          'Failed to create budget notification',
          safeErrorMessage(e),
        );
      }
      return createSuccessResponse(budget);
    } catch (err: unknown) {
      console.error(safeErrorMessage(err));
      return createErrorResponse([{ message: 'Error creating Budget' }]);
    }
  }

  async findAll(res: Response) {
    try {
      if (!process.env.JWT_SECRET)
        return createErrorResponse([{ message: 'Internal Server Error' }]);
      const token = getAccessTokenFromReq(res.req);
      const jwt = verify(token ?? '', process.env.JWT_SECRET) as jwtPayload;
      const budgets = await this.prisma.budget.findMany({
        where: {
          user_id: jwt.sub,
        },
      });
      return createSuccessResponse(budgets);
    } catch (err: unknown) {
      console.error(safeErrorMessage(err));
      return createErrorResponse([{ message: 'Error getting budgets' }]);
    }
  }

  async findOne(id: string, res: Response) {
    try {
      if (!process.env.JWT_SECRET)
        return createErrorResponse([{ message: 'Internal Server Error' }]);
      const token = getAccessTokenFromReq(res.req);
      const jwt = verify(token ?? '', process.env.JWT_SECRET) as jwtPayload;
      const budget = await this.prisma.budget.findFirst({
        where: { id: id, user_id: jwt.sub },
      });
      if (!budget)
        return createErrorResponse([{ message: 'Budget not found' }]);
      return createSuccessResponse(budget);
    } catch (err: unknown) {
      console.error(safeErrorMessage(err));
      return createErrorResponse([{ message: 'Error getting budget' }]);
    }
  }

  async update(id: string, updateBudgetDto: UpdateBudgetDto, res: Response) {
    try {
      if (!process.env.JWT_SECRET)
        return createErrorResponse([{ message: 'Internal Server Error' }]);
      const token = getAccessTokenFromReq(res.req);
      const jwt = verify(token ?? '', process.env.JWT_SECRET) as jwtPayload;
      const budget = await this.prisma.budget.findFirst({
        where: { id: id, user_id: jwt.sub },
      });
      if (!budget)
        return createErrorResponse([{ message: 'Budget not found' }]);
      const updatedBudget = await this.prisma.budget.update({
        where: { id: id },
        data: updateBudgetDto,
      });
      return createSuccessResponse(updatedBudget);
    } catch (err: unknown) {
      console.error(safeErrorMessage(err));
      return createErrorResponse([{ message: 'Error updating budget' }]);
    }
  }

  async remove(id: string, res: Response) {
    try {
      if (!process.env.JWT_SECRET)
        return createErrorResponse([{ message: 'Internal Server Error' }]);
      const token = getAccessTokenFromReq(res.req);
      const jwt = verify(token ?? '', process.env.JWT_SECRET) as jwtPayload;
      const budget = await this.prisma.budget.findFirst({
        where: { id: id, user_id: jwt.sub },
      });
      if (!budget)
        return createErrorResponse([{ message: 'Budget not found' }]);
      await this.prisma.budget.delete({
        where: { id: id },
      });
      return createSuccessResponse('Budget deleted successfully');
    } catch (err: unknown) {
      console.error(safeErrorMessage(err));
      return createErrorResponse([{ message: 'Error deleting budget' }]);
    }
  }

  async createFamilyBudget(
    familyId: string,
    createBudgetDto: CreateBudgetDto,
    res: Response,
  ) {
    try {
      if (!process.env.JWT_SECRET)
        return createErrorResponse([{ message: 'Server Error' }]);
      const token = getAccessTokenFromReq(res.req);
      const jwt = verify(token ?? '', process.env.JWT_SECRET) as jwtPayload;
      const budget = await this.prisma.budget.create({
        data: { ...createBudgetDto, familyId: familyId, user_id: jwt.sub },
      });
      try {
        await this.notifications.createForUser(jwt.sub, {
          type: 'PUSH',
          message: `Family budget created: ${budget.category}`,
        });
      } catch (e: unknown) {
        console.error(
          'Failed to create family budget notification',
          safeErrorMessage(e),
        );
      }
      return createSuccessResponse(budget);
    } catch (err: unknown) {
      console.error(safeErrorMessage(err));
      return createErrorResponse([{ message: 'Error creating Family Budget' }]);
    }
  }

  async getFamilyBudgets(familyId: string, res: Response) {
    try {
      if (!process.env.JWT_SECRET)
        return createErrorResponse([{ message: 'Internal Server Error' }]);
      const token = getAccessTokenFromReq(res.req);
      const jwt = verify(token ?? '', process.env.JWT_SECRET) as jwtPayload;
      const budgets = await this.prisma.budget.findMany({
        where: {
          familyId: familyId,
        },
      });
      return createSuccessResponse(budgets);
    } catch (err: unknown) {
      console.error(safeErrorMessage(err));
      return createErrorResponse([{ message: 'Error getting budgets' }]);
    }
  }
}
