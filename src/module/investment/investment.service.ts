import { Injectable } from '@nestjs/common';
import { CreateInvestmentDto } from './dto/create-investment.dto';
import { UpdateInvestmentDto } from './dto/update-investment.dto';
import { Response } from 'express';
import {
  createSuccessResponse,
  createErrorResponse,
} from 'src/common/response.util';
import { verify } from 'jsonwebtoken';
import { jwtPayload } from 'src/types/types';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class InvestmentService {
  constructor(private prisma: PrismaService) {}

  async create(createInvestmentDto: CreateInvestmentDto, res: Response) {
    try {
      if (!process.env.JWT_SECRET)
        return createErrorResponse([{ message: 'Server Error' }]);
      const jwt = verify(
        res.req.cookies.access_token,
        process.env.JWT_SECRET,
      ) as jwtPayload;

      const investment = await this.prisma.investment.create({
        data: { ...createInvestmentDto, user_id: jwt.sub },
      });
      return createSuccessResponse(investment);
    } catch (error) {
      console.error(error);
      return createErrorResponse([{ message: 'Error creating Investment' }]);
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
      const investments = await this.prisma.investment.findMany({
        where: {
          user_id: jwt.sub,
        },
      });
      return createSuccessResponse(investments);
    } catch (error) {
      console.error(error);
      return createErrorResponse([{ message: 'Error getting investments' }]);
    }
  }

  async findOne(id: string, res: Response) {
    try {
      if (!process.env.JWT_SECRET)
        return createErrorResponse([{ message: 'Internal Server Error' }]);
      const jwt = verify(
        res.req.cookies.access_token,
        process.env.JWT_SECRET,
      ) as jwtPayload;
      const investment = await this.prisma.investment.findFirst({
        where: { id: id, user_id: jwt.sub },
      });
      if (!investment)
        return createErrorResponse([{ message: 'Investment not found' }]);
      return createSuccessResponse(investment);
    } catch (error) {
      console.error(error);
      return createErrorResponse([{ message: 'Error getting investment' }]);
    }
  }

  async update(
    id: string,
    updateInvestmentDto: UpdateInvestmentDto,
    res: Response,
  ) {
    try {
      if (!process.env.JWT_SECRET)
        return createErrorResponse([{ message: 'Internal Server Error' }]);
      const jwt = verify(
        res.req.cookies.access_token,
        process.env.JWT_SECRET,
      ) as jwtPayload;
      const existingInvestment = await this.prisma.investment.findFirst({
        where: { id, user_id: jwt.sub },
      });
      if (!existingInvestment)
        return createErrorResponse([{ message: 'Investment not found' }]);

      const updatedInvestment = await this.prisma.investment.update({
        where: { id },
        data: updateInvestmentDto,
      });
      return createSuccessResponse(updatedInvestment);
    } catch (error) {
      console.error(error);
      return createErrorResponse([{ message: 'Error updating investment' }]);
    }
  }

  async remove(id: string, res: Response) {
    try {
      if (!process.env.JWT_SECRET)
        return createErrorResponse([{ message: 'Internal Server Error' }]);
      const jwt = verify(
        res.req.cookies.access_token,
        process.env.JWT_SECRET,
      ) as jwtPayload;
      const existingInvestment = await this.prisma.investment.findFirst({
        where: { id: id, user_id: jwt.sub },
      });
      if (!existingInvestment)
        return createErrorResponse([{ message: 'Investment not found' }]);

      await this.prisma.investment.delete({
        where: { id },
      });
      return createSuccessResponse({
        message: 'Investment deleted successfully',
      });
    } catch (error) {
      console.error(error);
      return createErrorResponse([{ message: 'Error deleting investment' }]);
    }
  }
}
