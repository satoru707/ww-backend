import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { AuthService } from '../auth/auth.service';
import { NotificationService } from '../notification/notification.service';
import { AuditLogService } from '../audit_log/audit_log.service';
import { logEvent } from 'src/common/log.helper';
import { Response } from 'express';
import {
  createSuccessResponse,
  createErrorResponse,
} from 'src/common/response.util';
import { verify } from 'jsonwebtoken';
import { jwtPayload } from 'src/types/types';
import crypto from 'crypto';

@Injectable()
export class FamilyService {
  constructor(
    private prisma: PrismaService,
    private auth: AuthService,
    private notifications: NotificationService,
    private logs: AuditLogService,
  ) {}

  async get_family(res: Response) {
    try {
      if (!process.env.JWT_SECRET)
        return createErrorResponse([{ message: 'Server Error' }]);
      const jwt = verify(
        res.req.cookies.access_token,
        process.env.JWT_SECRET,
      ) as jwtPayload;
      const user = await this.prisma.user.findFirst({
        where: { id: jwt.sub },
        include: { family: true },
      });
      let family;
      if (jwt.role === 'FAMILY_ADMIN') {
        family = await this.prisma.family.findFirst({
          where: { admin_id: jwt.sub },
          include: { members: true },
        });
      } else if (user?.familyId) {
        family = await this.prisma.family.findFirst({
          where: { id: user?.familyId },
          include: { members: true },
        });
      }

      if (!family)
        return createErrorResponse([{ message: 'User has no family' }]);
      return createSuccessResponse(family);
    } catch (error) {
      console.error(error);
      return createErrorResponse([{ message: 'Error fetching family' }]);
    }
  }

  async create(name, res: Response) {
    try {
      if (!process.env.JWT_SECRET)
        return createErrorResponse([{ message: 'Server Error' }]);
      const jwt = verify(
        res.req.cookies.access_token,
        process.env.JWT_SECRET,
      ) as jwtPayload;
      const family = await this.prisma.family.create({
        data: { name: name, admin_id: jwt.sub },
      });
      try {
        await this.notifications.createForUser(jwt.sub, {
          type: 'PUSH',
          message: `Family created: ${family.name}`,
        });
      } catch (e) {
        console.error('Failed to create family notification', e);
      }
      return createSuccessResponse(family);
    } catch (error) {
      console.error(error);
      return createErrorResponse([{ message: 'Error creating Family' }]);
    }
  }

  async add_member(familyId: string, familyName: string, email: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: email },
      });
      if (!user)
        return createErrorResponse([{ message: 'User does not exist' }]);
      if (user.familyId)
        return createErrorResponse([{ message: 'User already in a family' }]);
      const nonce = crypto.randomBytes(32).toString('hex');
      const token = await this.prisma.token.create({
        data: {
          token: nonce,
          type: 'FAMILY',
          family_id: familyId,
          member_id: user.id,
          expiresAt: new Date(Date() + 24 * 60 * 60 * 1000),
        },
      });
      await this.auth.send_mail(
        {
          email: user.email,
          name: user.name,
          status: 'FAMILY',
          family_name: familyName,
        },
        nonce,
      );
      // create in-app notification for invite
      try {
        await this.notifications.createForUser(user.id, {
          type: 'PUSH',
          message: `You have been invited to join family ${familyName}`,
        });
      } catch (e) {
        console.error('Failed to create family invite notification', e);
      }
      // audit log
      await logEvent(this.logs, {
        userId: user.id,
        actionType: 'FAMILY_INVITE_SENT',
        level: 'INFO',
        details: { familyId: familyId, invitedEmail: user.email },
      });
      return createSuccessResponse('Email sent successfully');
    } catch (error) {
      console.error(error);
      return createErrorResponse([{ message: 'Error sending mail' }]);
    }
  }

  async accept_invite(nonce: string) {
    try {
      const data = await this.prisma.token.findUnique({
        where: {
          token_type: {
            token: nonce,
            type: 'FAMILY',
          },
        },
      });
      if (!data || data.expiresAt < new Date())
        return createErrorResponse([{ message: 'Invalid token' }]);
      if (data.family_id && data.member_id) {
        await this.prisma.family.update({
          where: { id: data?.family_id },
          data: {
            members: {
              connect: { id: data?.member_id },
            },
          },
        });
      }
      // delete all token family types where member_id is user
      await this.prisma.token.deleteMany({
        where: { member_id: data?.member_id },
      });
      return createSuccessResponse('Join Family successful');
    } catch (error) {
      console.error(error);
      return createErrorResponse([{ message: 'Error joining family' }]);
    }
  }

  async edit_family(familyId: string, name: string) {
    try {
      await this.prisma.family.update({
        where: { id: familyId },
        data: { name: name },
      });
      return createSuccessResponse('Family name updated successfully');
    } catch (error) {
      console.error(error);
      return createErrorResponse([{ message: 'Error editing family' }]);
    }
  }

  async leave(res: Response) {
    try {
      if (!process.env.JWT_SECRET)
        return createErrorResponse([{ message: 'Server Error' }]);
      const jwt = verify(
        res.req.cookies.access_token,
        process.env.JWT_SECRET,
      ) as jwtPayload;
      const user = await this.prisma.user.findUnique({
        where: { id: jwt.sub },
      });
      if (!user?.familyId)
        return createErrorResponse([{ message: 'User not in a family' }]);
      await this.prisma.user.update({
        where: { id: jwt.sub },
        data: { familyId: null },
      });

      return createSuccessResponse('Left family successfully');
    } catch (error) {
      console.error(error);
      return createErrorResponse([{ message: 'Error joining family' }]);
    }
  }

  async delete(res: Response, familyId: string) {
    try {
      if (!process.env.JWT_SECRET)
        return createErrorResponse([{ message: 'Server Error' }]);
      const jwt = verify(
        res.req.cookies.access_token,
        process.env.JWT_SECRET,
      ) as jwtPayload;
      await this.prisma.family.delete({
        where: { id: familyId, admin_id: jwt.sub },
      });
      await this.prisma.user.updateMany({
        where: { familyId: familyId },
        data: { familyId: null },
      });
      await this.prisma.token.deleteMany({
        where: { family_id: familyId },
      });
      await this.prisma.transactions.deleteMany({
        where: { familyId: familyId },
      });
      await this.prisma.budget.deleteMany({
        where: { familyId: familyId },
      });
      return createSuccessResponse('Family deleted successfully');
    } catch (error) {
      console.error(error);
      return createErrorResponse([
        { message: 'Error deleting family or insufficient permissions' },
      ]);
    }
  }

  async getAll() {
    try {
      const users = await this.prisma.family.findMany();
      return createSuccessResponse(users);
    } catch (error) {
      console.error(error);
      return createErrorResponse([{ message: 'Error fetching all users' }]);
    }
  }
}
