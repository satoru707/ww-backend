import { Injectable } from '@nestjs/common';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { Response } from 'express';
import { PrismaService } from 'src/prisma.service';
import {
  createErrorResponse,
  createSuccessResponse,
} from 'src/common/response.util';
import { verify } from 'jsonwebtoken';
import { jwtPayload } from 'src/types/types';

@Injectable()
export class GoalService {
  constructor(private prisma: PrismaService) {}
  async create(body: CreateGoalDto, res: Response) {
    try {
      if (!process.env.JWT_SECRET)
        return createErrorResponse([{ message: 'Interna Server Error' }]);
      const jwt = verify(
        res.cookie['access_token'],
        process.env.JWT_SECRET,
      ) as jwtPayload;
      const goal = await this.prisma.goals.create({
        data: {
          name: body.name,
          user_id: jwt.sub,
          target_amount: body.deadline,
          current_amount: body.current,
          deadline: new Date(body.deadline),
        },
      });
      return createSuccessResponse(goal);
    } catch (error) {
      console.error(error);
      return createErrorResponse([{ message: 'Error creating goal' }]);
    }
  }

  async findAll(res: Response) {
    try {
      if (!process.env.JWT_SECRET)
        return createErrorResponse([{ message: 'Interna Server Error' }]);
      const jwt = verify(
        res.cookie['access_token'],
        process.env.JWT_SECRET,
      ) as jwtPayload;
      const goals = await this.prisma.goals.findMany({
        where: {
          user_id: jwt.sub,
        },
      });
      return createSuccessResponse(goals);
    } catch (error) {
      console.error(error);
      return createErrorResponse([{ message: 'Error getting goals' }]);
    }
  }

  async findOne(id: string, res: Response) {
    try {
      if (!process.env.JWT_SECRET)
        return createErrorResponse([{ message: 'Interna Server Error' }]);
      const jwt = verify(
        res.cookie['access_token'],
        process.env.JWT_SECRET,
      ) as jwtPayload;
      const goal = await this.prisma.goals.findFirst({
        where: {
          id: id,
          user_id: jwt.sub,
        },
      });
      return createSuccessResponse(goal);
    } catch (error) {
      console.error(error);
      return createErrorResponse([{ message: 'Error getting goal' }]);
    }
  }

  async update(id: string, updateGoal: UpdateGoalDto, res: Response) {
    try {
      if (!process.env.JWT_SECRET)
        return createErrorResponse([{ message: 'Interna Server Error' }]);
      const jwt = verify(
        res.cookie['access_token'],
        process.env.JWT_SECRET,
      ) as jwtPayload;
      const goal = await this.prisma.goals.update({
        where: {
          id: id,
          user_id: jwt.sub,
        },
        data: updateGoal,
      });
      return createSuccessResponse(goal);
    } catch (error) {
      console.error(error);
      return createErrorResponse([{ message: 'Error editing goal' }]);
    }
  }

  async remove(id: string, res: Response) {
    try {
      if (!process.env.JWT_SECRET)
        return createErrorResponse([{ message: 'Internal Server Error' }]);
      const jwt = verify(
        res.cookie['access_token'],
        process.env.JWT_SECRET,
      ) as jwtPayload;
      await this.prisma.goals.delete({
        where: {
          user_id: jwt.sub,
          id: id,
        },
      });
      return createSuccessResponse('Deleted successfully');
    } catch (error) {
      console.error(error);
      return createErrorResponse([{ message: 'Error deleting goal' }]);
    }
  }
}
