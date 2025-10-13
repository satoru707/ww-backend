import { Injectable } from '@nestjs/common';
import { CreatedeptplanDto } from './dto/create-debit_plan.dto';
import { UpdatedeptplanDto } from './dto/update-debit_plan.dto';
import { Response } from 'express';
import { PrismaService } from 'src/prisma.service';
import { NotificationService } from '../notification/notification.service';
import {
  createErrorResponse,
  createSuccessResponse,
} from 'src/common/response.util';
import { verify } from 'jsonwebtoken';
import { jwtPayload } from 'src/types/types';
import { getAccessTokenFromReq } from 'src/common/cookie.util';
import { safeErrorMessage } from 'src/common/error.util';

@Injectable()
export class deptplanService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationService,
  ) {}

  async create(body: CreatedeptplanDto, res: Response) {
    try {
      if (!process.env.JWT_SECRET)
        return createErrorResponse([{ message: 'Internal Server Error' }]);
      const token = getAccessTokenFromReq(res.req);
      const jwt = verify(token ?? '', process.env.JWT_SECRET) as jwtPayload;
      const debtplan = await this.prisma.debtPlan.create({
        data: {
          ...body,
          user_id: jwt.sub,
        },
      });
      try {
        await this.notifications.createForUser(jwt.sub, {
          type: 'PUSH',
          message: `Debt plan created: ${debtplan.id}`,
        });
      } catch (e: unknown) {
        console.error(
          'Failed to create debt plan notification',
          safeErrorMessage(e),
        );
      }
      return createSuccessResponse(debtplan);
    } catch (err: unknown) {
      console.error(safeErrorMessage(err));
      return createErrorResponse([{ message: 'Error creating debt plan' }]);
    }
  }

  async findAll(res: Response) {
    try {
      if (!process.env.JWT_SECRET)
        return createErrorResponse([{ message: 'Internal Server Error' }]);
      const token = getAccessTokenFromReq(res.req);
      const jwt = verify(token ?? '', process.env.JWT_SECRET) as jwtPayload;
      const debtplans = await this.prisma.debtPlan.findMany({
        where: { user_id: jwt.sub },
      });
      return createSuccessResponse(debtplans);
    } catch (err: unknown) {
      console.error(safeErrorMessage(err));
      return createErrorResponse([{ message: 'Error finding debt plans' }]);
    }
  }

  async findOne(debtplanId: string, res: Response) {
    try {
      if (!process.env.JWT_SECRET)
        return createErrorResponse([{ message: 'Internal Server Error' }]);
      const token = getAccessTokenFromReq(res.req);
      const jwt = verify(token ?? '', process.env.JWT_SECRET) as jwtPayload;
      const debtplan = await this.prisma.debtPlan.findFirst({
        where: { id: debtplanId, user_id: jwt.sub },
      });
      if (!debtplan) {
        return createErrorResponse([{ message: 'Debt plan not found' }]);
      }
      return createSuccessResponse(debtplan);
    } catch (err: unknown) {
      console.error(safeErrorMessage(err));
      return createErrorResponse([{ message: 'Error finding debt plan' }]);
    }
  }

  async update(
    id: string,
    updatedeptplanDto: UpdatedeptplanDto,
    res: Response,
  ) {
    try {
      if (!process.env.JWT_SECRET)
        return createErrorResponse([{ message: 'Internal Server Error' }]);
      const token = getAccessTokenFromReq(res.req);
      const jwt = verify(token ?? '', process.env.JWT_SECRET) as jwtPayload;

      const existingPlan = await this.prisma.debtPlan.findFirst({
        where: { id: id, user_id: jwt.sub },
      });

      if (!existingPlan) {
        return createErrorResponse([{ message: 'Debt plan not found' }]);
      }

      const updatedPlan = await this.prisma.debtPlan.update({
        where: { id: id },
        data: { ...updatedeptplanDto },
      });
      return createSuccessResponse(updatedPlan);
    } catch (err: unknown) {
      console.error(safeErrorMessage(err));
      return createErrorResponse([{ message: 'Error updating debt plan' }]);
    }
  }

  async remove(id: string, res: Response) {
    try {
      if (!process.env.JWT_SECRET)
        return createErrorResponse([{ message: 'Internal Server Error' }]);
      const token = getAccessTokenFromReq(res.req);
      const jwt = verify(token ?? '', process.env.JWT_SECRET) as jwtPayload;

      const existingPlan = await this.prisma.debtPlan.findFirst({
        where: { id: id, user_id: jwt.sub },
      });

      if (!existingPlan) {
        return createErrorResponse([{ message: 'Debt plan not found' }]);
      }

      await this.prisma.debtPlan.delete({
        where: { id: id },
      });
      return createSuccessResponse({
        message: 'Debt plan deleted successfully',
      });
    } catch (err: unknown) {
      console.error(safeErrorMessage(err));
      return createErrorResponse([{ message: 'Error deleting debt plan' }]);
    }
  }
}
