import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { AuthService } from '../auth/auth.service';
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
  ) {}
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
      return createSuccessResponse(family);
    } catch (error) {
      console.error(error);
      return createErrorResponse([{ message: 'Error creating Family' }]);
    }
  }

  async add_member(familyId: string, familyName: string, email: string) {
    try {
      const user = await this.prisma.user.findFirst({
        where: { email: email },
      });
      if (!user)
        return createErrorResponse([{ message: 'User does not exist' }]);
      const nonce = crypto.randomBytes(32).toString('hex');
      await this.prisma.token.create({
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
      return createSuccessResponse('Email sent successfully');
    } catch (error) {
      console.error(error);
      return createErrorResponse([{ message: 'Error sending mail' }]);
    }
  }

  async accept_invite(nonce: string) {
    try {
      const data = await this.prisma.token.findFirst({
        where: { token: nonce },
      });
      if (!data || data.expiresAt > new Date())
        return createErrorResponse([{ message: 'Invalid token' }]);
      if (data.member_id) {
        await this.prisma.user.update({
          where: { id: data.member_id },
          data: {
            familyId: data.family_id,
          },
        });
      }
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

  async delete(familyId: string) {
    try {
      await this.prisma.family.delete({
        where: { id: familyId },
      });
      return createSuccessResponse('Family deleted successfully');
    } catch (error) {
      console.error(error);
      return createErrorResponse([{ message: 'Error deleting family' }]);
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
