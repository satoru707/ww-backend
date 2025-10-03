import { Injectable } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { Response } from 'express';
import { PrismaService } from 'src/prisma.service';
import {
  createErrorResponse,
  createSuccessResponse,
} from 'src/common/response.util';
import { verify } from 'jsonwebtoken';
import { jwtPayload } from 'src/types/types';

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {}

  async create(createNotificationDto: CreateNotificationDto, res: Response) {
    try {
      if (!process.env.JWT_SECRET)
        return createErrorResponse([{ message: 'Internal Server Error' }]);
      const jwt = verify(
        res.req.cookies.access_token,
        process.env.JWT_SECRET,
      ) as jwtPayload;

      const notification = await this.prisma.notification.create({
        data: { ...createNotificationDto, user_id: jwt.sub },
      });
      return createSuccessResponse(notification);
    } catch (error) {
      return createErrorResponse([{ message: 'Error creating notification' }]);
    }
  }

  async findAll(res: Response) {
    try {
      if (!process.env.JWT_SECRET)
        return createErrorResponse([{ message: 'Interna Server Error' }]);
      const jwt = verify(
        res.req.cookies.access_token,
        process.env.JWT_SECRET,
      ) as jwtPayload;
      const notifications = await this.prisma.notification.findMany({
        where: {
          user_id: jwt.sub,
        },
        orderBy: {
          sentAt: 'desc',
        },
      });
      return createSuccessResponse(notifications);
    } catch (error) {
      return createErrorResponse([{ message: 'Error fetching notifications' }]);
    }
  }

  async findOne(id: string, res: Response) {
    try {
      if (!process.env.JWT_SECRET)
        return createErrorResponse([{ message: 'Interna Server Error' }]);
      const jwt = verify(
        res.req.cookies.access_token,
        process.env.JWT_SECRET,
      ) as jwtPayload;
      const notification = await this.prisma.notification.findFirst({
        where: {
          id,
          user_id: jwt.sub,
        },
      });
      if (!notification) {
        return createErrorResponse([{ message: 'Notification not found' }]);
      }
      return createSuccessResponse(notification);
    } catch (error) {
      return createErrorResponse([{ message: 'Error fetching notification' }]);
    }
  }

  async delete(id: string, res: Response) {
    try {
      if (!process.env.JWT_SECRET)
        return createErrorResponse([{ message: 'Interna Server Error' }]);
      const jwt = verify(
        res.req.cookies.access_token,
        process.env.JWT_SECRET,
      ) as jwtPayload;
      const notification = await this.prisma.notification.findFirst({
        where: {
          id,
          user_id: jwt.sub,
        },
      });
      if (!notification) {
        return createErrorResponse([{ message: 'Notification not found' }]);
      }
      await this.prisma.notification.delete({
        where: {
          id,
        },
      });
      return createSuccessResponse({ message: 'Notification deleted' });
    } catch (error) {
      console.error(error);
      return createErrorResponse([{ message: 'Error deleting notifications' }]);
    }
  }

  async deleteAll(res: Response) {
    try {
      if (!process.env.JWT_SECRET)
        return createErrorResponse([{ message: 'Interna Server Error' }]);
      const jwt = verify(
        res.req.cookies.access_token,
        process.env.JWT_SECRET,
      ) as jwtPayload;
      await this.prisma.notification.deleteMany({
        where: {
          user_id: jwt.sub,
        },
      });
      return createSuccessResponse({ message: 'All notifications deleted' });
    } catch (error) {
      console.error(error);
      return createErrorResponse([{ message: 'Error deleting notifications' }]);
    }
  }
}
