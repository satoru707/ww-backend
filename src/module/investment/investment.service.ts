import { Injectable, Inject } from '@nestjs/common';
import { CreateInvestmentDto } from './dto/create-investment.dto';
import { UpdateInvestmentDto } from './dto/update-investment.dto';
import { Response } from 'express';
import { createSuccessResponse, createErrorResponse } from 'src/common/response.util';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { verify } from 'jsonwebtoken';
import { jwtPayload } from 'src/types/types';
import { getAccessTokenFromReq } from 'src/common/cookie.util';
import { safeErrorMessage } from 'src/common/error.util';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class InvestmentService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  async create(createInvestmentDto: CreateInvestmentDto, res: Response) {
    try {
      if (!process.env.JWT_SECRET) return createErrorResponse([{ message: 'Server Error' }]);
      const token = getAccessTokenFromReq(res.req);
      const jwt = verify(token ?? '', process.env.JWT_SECRET) as jwtPayload;

      // Clear the user's investment caches
      await this.cacheManager.del(`${jwt.sub}:/investment`);
      const investment = await this.prisma.investment.create({
        data: { ...createInvestmentDto, user_id: jwt.sub },
      });
      return createSuccessResponse(investment);
    } catch (err: unknown) {
      console.error(safeErrorMessage(err));
      return createErrorResponse([{ message: 'Error creating Investment' }]);
    }
  }

  async findAll(res: Response) {
    try {
      if (!process.env.JWT_SECRET) return createErrorResponse([{ message: 'Internal Server Error' }]);
      const token = getAccessTokenFromReq(res.req);
      const jwt = verify(token ?? '', process.env.JWT_SECRET) as jwtPayload;
      const investments = await this.prisma.investment.findMany({
        where: {
          user_id: jwt.sub,
        },
      });
      return createSuccessResponse(investments);
    } catch (err: unknown) {
      console.error(safeErrorMessage(err));
      return createErrorResponse([{ message: 'Error getting investments' }]);
    }
  }

  async findOne(id: string, res: Response) {
    try {
      if (!process.env.JWT_SECRET) return createErrorResponse([{ message: 'Internal Server Error' }]);
      const token = getAccessTokenFromReq(res.req);
      const jwt = verify(token ?? '', process.env.JWT_SECRET) as jwtPayload;
      const investment = await this.prisma.investment.findFirst({
        where: { id: id, user_id: jwt.sub },
      });
      if (!investment) return createErrorResponse([{ message: 'Investment not found' }]);
      return createSuccessResponse(investment);
    } catch (err: unknown) {
      console.error(safeErrorMessage(err));
      return createErrorResponse([{ message: 'Error getting investment' }]);
    }
  }

  async update(id: string, updateInvestmentDto: UpdateInvestmentDto, res: Response) {
    try {
      if (!process.env.JWT_SECRET) return createErrorResponse([{ message: 'Internal Server Error' }]);
      const token = getAccessTokenFromReq(res.req);
      const jwt = verify(token ?? '', process.env.JWT_SECRET) as jwtPayload;

      // Clear the user's investment caches
      await this.cacheManager.del(`${jwt.sub}:/investment`);
      await this.cacheManager.del(`${jwt.sub}:/investment/${id}`);
      const existingInvestment = await this.prisma.investment.findFirst({
        where: { id, user_id: jwt.sub },
      });
      if (!existingInvestment) return createErrorResponse([{ message: 'Investment not found' }]);

      const updatedInvestment = await this.prisma.investment.update({
        where: { id },
        data: updateInvestmentDto,
      });
      return createSuccessResponse(updatedInvestment);
    } catch (err: unknown) {
      console.error(safeErrorMessage(err));
      return createErrorResponse([{ message: 'Error updating investment' }]);
    }
  }

  async remove(id: string, res: Response) {
    try {
      if (!process.env.JWT_SECRET) return createErrorResponse([{ message: 'Internal Server Error' }]);
      const token = getAccessTokenFromReq(res.req);
      const jwt = verify(token ?? '', process.env.JWT_SECRET) as jwtPayload;
      const existingInvestment = await this.prisma.investment.findFirst({
        where: { id: id, user_id: jwt.sub },
      });
      if (!existingInvestment) return createErrorResponse([{ message: 'Investment not found' }]);

      await this.prisma.investment.delete({
        where: { id },
      });
      return createSuccessResponse({
        message: 'Investment deleted successfully',
      });
    } catch (err: unknown) {
      console.error(safeErrorMessage(err));
      return createErrorResponse([{ message: 'Error deleting investment' }]);
    }
  }
}
