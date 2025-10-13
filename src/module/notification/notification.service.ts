import { Injectable } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { Response } from 'express';
import {
  ApiResponse,
  createErrorResponse,
  createSuccessResponse,
} from 'src/common/response.util';
import { safeErrorMessage } from 'src/common/error.util';
import { getAccessTokenFromReq } from 'src/common/cookie.util';
import { verify } from 'jsonwebtoken';
import { jwtPayload } from 'src/types/types';
import { InjectModel } from '@nestjs/mongoose';
import { Notification } from 'src/services/mongo/notification.schema';
import { Model } from 'mongoose';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<Notification>,
  ) {}
  // create, make one or all as read, delete one or all

  async create(
    createNotificationDto: CreateNotificationDto,
    res: Response,
  ): Promise<ApiResponse<any>> {
    try {
      if (!process.env.JWT_SECRET)
        return createErrorResponse([{ message: 'Internal Server Error' }]);
      const token = getAccessTokenFromReq(res.req);
      const jwt = verify(
        token ?? '',
        process.env.JWT_SECRET,
      ) as unknown as jwtPayload;

      const notification = await this.notificationModel.create({
        ...createNotificationDto,
        user_id: jwt.sub,
      });
      return createSuccessResponse(notification);
    } catch (error: unknown) {
      console.error(safeErrorMessage(error));
      return createErrorResponse([{ message: 'Error creating notification' }]);
    }
  }

  async findAll(res: Response): Promise<ApiResponse<any>> {
    try {
      if (!process.env.JWT_SECRET)
        return createErrorResponse([{ message: 'Interna Server Error' }]);
      const token = getAccessTokenFromReq(res.req);
      const jwt = verify(
        token ?? '',
        process.env.JWT_SECRET,
      ) as unknown as jwtPayload;
      const notifications = await this.notificationModel
        .find({ user_id: jwt.sub })
        .sort({ createdAt: -1 })
        .limit(50);
      return createSuccessResponse(notifications);
    } catch (error: unknown) {
      console.error(safeErrorMessage(error));
      return createErrorResponse([{ message: 'Error fetching notifications' }]);
    }
  }

  async markAsRead(id: string, res: Response): Promise<ApiResponse<any>> {
    try {
      if (!process.env.JWT_SECRET)
        return createErrorResponse([{ message: 'Interna Server Error' }]);
      const token = getAccessTokenFromReq(res.req);
      const jwt = verify(
        token ?? '',
        process.env.JWT_SECRET,
      ) as unknown as jwtPayload;
      // isRead is true
      await this.notificationModel.findOneAndUpdate(
        {
          id,
          user_id: jwt.sub,
        },
        {
          isRead: true,
        },
      );
      return createSuccessResponse('Marked as read');
    } catch (error: unknown) {
      console.error(safeErrorMessage(error));
      return createErrorResponse([{ message: 'Error fetching notification' }]);
    }
  }

  async markAllAsRead(res: Response): Promise<ApiResponse<any>> {
    try {
      if (!process.env.JWT_SECRET)
        return createErrorResponse([{ message: 'Interna Server Error' }]);
      const token = getAccessTokenFromReq(res.req);
      const jwt = verify(
        token ?? '',
        process.env.JWT_SECRET,
      ) as unknown as jwtPayload;
      await this.notificationModel.updateMany(
        {
          user_id: jwt.sub,
        },
        {
          isRead: true,
        },
      );
      return createSuccessResponse('Marked all as read');
    } catch (error: unknown) {
      console.error(safeErrorMessage(error));
      return createErrorResponse([{ message: 'Error fetching notification' }]);
    }
  }

  async delete(id: string, res: Response): Promise<ApiResponse<any>> {
    try {
      if (!process.env.JWT_SECRET)
        return createErrorResponse([{ message: 'Interna Server Error' }]);
      const token = getAccessTokenFromReq(res.req);
      const jwt = verify(
        token ?? '',
        process.env.JWT_SECRET,
      ) as unknown as jwtPayload;

      await this.notificationModel.deleteOne({ id, user_id: jwt.sub });
      return createSuccessResponse({ message: 'Notification deleted' });
    } catch (error: unknown) {
      console.error(safeErrorMessage(error));
      return createErrorResponse([{ message: 'Error deleting notifications' }]);
    }
  }

  async deleteAll(res: Response): Promise<ApiResponse<any>> {
    try {
      if (!process.env.JWT_SECRET)
        return createErrorResponse([{ message: 'Interna Server Error' }]);
      const token = getAccessTokenFromReq(res.req);
      const jwt = verify(
        token ?? '',
        process.env.JWT_SECRET,
      ) as unknown as jwtPayload;
      await this.notificationModel.deleteMany({ user_id: jwt.sub });
      return createSuccessResponse({ message: 'All notifications deleted' });
    } catch (error: unknown) {
      console.error(safeErrorMessage(error));
      return createErrorResponse([{ message: 'Error deleting notifications' }]);
    }
  }

  // Create a notification for a specific user id (used when Response / cookie is not available)
  async createForUser(
    userId: string,
    createNotificationDto: CreateNotificationDto,
  ): Promise<ApiResponse<any>> {
    try {
      const notification = await this.notificationModel.create({
        ...createNotificationDto,
        user_id: userId,
      });
      return createSuccessResponse(notification);
    } catch (error: unknown) {
      console.error(
        'Error creating notification for user',
        safeErrorMessage(error),
      );
      return createErrorResponse([{ message: 'Error creating notification' }]);
    }
  }
}
