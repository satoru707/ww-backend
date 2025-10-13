import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Response } from 'express';
import {
  createSuccessResponse,
  createErrorResponse,
} from 'src/common/response.util';
import { verify } from 'jsonwebtoken';
import { jwtPayload } from 'src/types/types';
import { log } from 'console';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async find(res: Response) {
    try {
      const jwt = await res.req.cookies.access_token;
      if (!process.env.JWT_SECRET)
        return createErrorResponse([
          { message: 'Internal Server Error, no secret' },
        ]);
      console.log(jwt);

      const token = verify(jwt, process.env.JWT_SECRET) as jwtPayload;
      console.log();

      const user = await this.prisma.user.findUnique({
        where: {
          id: token.sub,
          email: token.email,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          familyId: true,
          family_as_admin: true,
          createdAt: true,
          updatedAt: true,
          tokens: true,
          goals: true,
          transactions: true,
          budgets: true,
          investments: true,
          payments: true,
          debt_plans: true,
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
      console.log('Body', updateUserDto);

      const jwt = await res.req.cookies.access_token;
      if (!process.env.JWT_SECRET)
        return createErrorResponse([{ message: 'Internal Server Error' }]);
      const token = verify(jwt, process.env.JWT_SECRET) as jwtPayload;

      const user = await this.prisma.user.update({
        where: {
          id: token.sub,
          email: token.email,
        },
        data: {
          name: updateUserDto.name,
          role: updateUserDto.role
            ? updateUserDto.role.toUpperCase()
            : undefined,
        },
        select: {
          tokens: true,
          name: true,
          id: true,
          family_as_admin: true,
          familyId: true,
        },
      });
      const refresh = res.req.cookies.refresh_token;
      if (updateUserDto.role && refresh) {
        // if upDateuserdto.role == family admin and user.family_as_admin exists return already a family admin, else create new family, if user.familyId exists return error you're in a family, only create new family if user.familyId and user.family_as_admin is null
        // if upDateuserdto.role == user and user.family_as_admin exists, delete family where user is admin and set familyId of all members to null, set user.family_as_admin to null
        if (updateUserDto.role.toLowerCase() === 'family_admin') {
          if (user.family_as_admin) {
            return createErrorResponse([
              { message: 'You are already a family admin' },
            ]);
          }
          if (user.familyId) {
            return createErrorResponse([
              { message: 'You are already in a family' },
            ]);
          }
          await this.prisma.family.create({
            data: {
              name: `${user.name}'s Family`,
              admin_id: user.id,
            },
          });
        } else if (
          updateUserDto.role.toLowerCase() === 'user' &&
          user.familyId
        ) {
          if (user.family_as_admin) {
            const members = await this.prisma.family.findUnique({
              where: {
                id: user.familyId,
              },
              select: {
                members: true,
              },
            });
            for (const member of members?.members || []) {
              await this.prisma.user.update({
                where: { id: member.id },
                data: { familyId: null },
              });
            }
            await this.prisma.family.delete({
              where: { id: user.familyId },
            });
          }
        }

        // Delete the refresh token cookie
        await this.prisma.token.delete({
          where: {
            id: user.tokens.filter((token) => token.type === 'REFRESH')[0].id,
          },
        });
        res.clearCookie('refresh_token');
        res.clearCookie('access_token');
      }

      return createSuccessResponse(user);
    } catch (error) {
      console.error(error);
      return createErrorResponse([{ message: 'Error updating user' }]);
    }
  }

  async findAll() {
    try {
      const users = await this.prisma.user.findMany();
      return createSuccessResponse(users);
    } catch (error) {
      console.log(error);
      return createErrorResponse([{ message: 'Error fetching users' }]);
    }
  }

  async remove(res: Response) {
    try {
      if (!process.env.JWT_SECRET)
        return createErrorResponse([{ message: 'Internal Server Error' }]);
      const user = verify(
        res.req.cookies.access_token,
        process.env.JWT_SECRET,
      ) as jwtPayload;
      // if (
      //   !(
      //     (user.sub == id && user.role == 'FAMILY_ADMIN') ||
      //     user.role == 'USER'
      //   ) &&
      //   user.sub !== id &&
      //   user.role == 'ADMIN'
      // )
      //   return createErrorResponse([{ message: 'Insufficient Perminssion' }]);
      // await this.prisma.user.delete({
      //   where: { id: id },
      // });
      await this.prisma.user.delete({
        where: { id: user.sub },
      });
      res.clearCookie('access_token');
      res.clearCookie('refresh_token');

      return createSuccessResponse('User deleted');
    } catch (error) {
      console.error(error);
      return createErrorResponse([{ message: 'Error deleting user' }]);
    }
  }

  async exportUserData(res: Response) {
    try {
      const jwt = await res.req.cookies.access_token;
      if (!process.env.JWT_SECERT)
        return createErrorResponse([{ message: 'Internal Server Error' }]);
      const token = verify(jwt, process.env.JWT_SECERT) as jwtPayload;
      const user = await this.prisma.user.findFirst({
        where: {
          id: token.sub,
          email: token.email,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          tokens: true,
          goals: true,
          transactions: true,
          budgets: true,
          investments: true,
          payments: true,
          debt_plans: true,
        },
      });
      if (!user) return createErrorResponse([{ message: 'User not found' }]);

      res.setHeader(
        'Content-Disposition',
        `attachment; filename=${user.email}_data.json`,
      );
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(user, null, 2));
    } catch (error) {
      console.error(error);
      return createErrorResponse([{ message: 'Error exporting user data' }]);
    }
  }
}
