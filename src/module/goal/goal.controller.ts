import { Controller, Get, Post, Body, Patch, Param, Delete, Response, UseGuards, UseInterceptors } from '@nestjs/common';
import { GoalService } from './goal.service';
import { UserAwareCacheInterceptor } from '../../user-aware-cache.interceptor';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { AuthGuard } from '../jwt.guard';
import { Roles } from '../role.decorator';
import { RolesGuard } from '../role.guard';
import { ApiSecurity, ApiParam, ApiResponse, ApiOperation, ApiBadRequestResponse } from '@nestjs/swagger';

@Controller('goal')
@ApiSecurity('access_token')
@ApiSecurity('refresh_token')
@UseGuards(AuthGuard, RolesGuard)
export class GoalController {
  constructor(private readonly goalService: GoalService) {}

  @ApiOperation({
    summary: 'Create a new goal',
    description: 'Endpoint to create a new financial goal for the authenticated user.',
  })
  @ApiResponse({
    status: 201,
    description: 'The goal has been successfully created.',
    schema: {
      example: {
        id: 'cuid1234567890',
        user_id: 'usercuid123456',
        title: 'Buy a House',
        description: 'Saving for a down payment on a new house',
        target_amount: 50000.0,
        current_amount: 10000.0,
        target_date: '2024-12-31T00:00:00.000Z',
        createdAt: '2024-01-01T12:00:00.000Z',
        updatedAt: '2024-01-01T12:00:00.000Z',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Error creating goal',
    schema: {
      example: {
        statusCode: 400,
        errors: [
          {
            message: 'Error creating goal',
          },
        ],
      },
    },
  })
  @ApiOperation({
    summary: 'Create a new goal',
    description: 'Endpoint to create a new financial goal for the authenticated user.',
  })
  @Roles(['user', 'family_admin'])
  @Post()
  create(@Body() createGoal: CreateGoalDto, @Response({ passthrough: true }) res) {
    return this.goalService.create(createGoal, res);
  }

  @ApiOperation({
    summary: 'Get all goals',
    description: 'Endpoint to retrieve all financial goals for the authenticated user.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of financial goals',
    schema: {
      example: [
        {
          id: 'cuid1234567890',
          user_id: 'usercuid123456',
          title: 'Buy a House',
          description: 'Saving for a down payment on a new house',
          target_amount: 50000.0,
          current_amount: 10000.0,
          target_date: '2024-12-31T00:00:00.000Z',
          createdAt: '2024-01-01T12:00:00.000Z',
          updatedAt: '2024-01-01T12:00:00.000Z',
        },
      ],
    },
  })
  @ApiBadRequestResponse({
    description: 'Error fetching goals',
    schema: {
      example: {
        statusCode: 400,
        errors: [
          {
            message: 'Error fetching goals',
          },
        ],
      },
    },
  })
  @Roles(['user', 'family_admin'])
  @UseInterceptors(UserAwareCacheInterceptor)
  @Get('')
  findAll(@Response({ passthrough: true }) res) {
    return this.goalService.findAll(res);
  }

  @ApiOperation({
    summary: 'Get a goal by ID',
    description: 'Endpoint to retrieve a specific financial goal by its ID for the authenticated user.',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The unique identifier of the goal',
    example: 'cuid1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'The financial goal details',
    schema: {
      example: {
        id: 'cuid1234567890',
        user_id: 'usercuid123456',
        title: 'Buy a House',
        description: 'Saving for a down payment on a new house',
        target_amount: 50000.0,
        current_amount: 10000.0,
        target_date: '2024-12-31T00:00:00.000Z',
        createdAt: '2024-01-01T12:00:00.000Z',
        updatedAt: '2024-01-01T12:00:00.000Z',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid goal ID',
    schema: {
      example: {
        statusCode: 400,
        errors: [
          {
            message: 'Invalid goal ID',
          },
        ],
      },
    },
  })
  @Roles(['user', 'family_admin'])
  @UseInterceptors(UserAwareCacheInterceptor)
  @Get(':id')
  findOne(@Param('id') id: string, @Response({ passthrough: true }) res) {
    return this.goalService.findOne(id, res);
  }

  @ApiOperation({
    summary: 'Update a goal',
    description: 'Endpoint to update an existing financial goal for the authenticated user.',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The unique identifier of the goal to be updated',
    example: 'cuid1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'The updated financial goal details',
    schema: {
      example: {
        id: 'cuid1234567890',
        user_id: 'usercuid123456',
        title: 'Buy a House',
        description: 'Saving for a down payment on a new house',
        target_amount: 60000.0,
        current_amount: 15000.0,
        target_date: '2025-12-31T00:00:00.000Z',
        createdAt: '2024-01-01T12:00:00.000Z',
        updatedAt: '2024-06-01T12:00:00.000Z',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data or goal ID',
    schema: {
      example: {
        statusCode: 400,
        errors: [
          {
            message: 'Invalid input data or goal ID',
          },
        ],
      },
    },
  })
  @Roles(['user', 'family_admin'])
  @Patch(':id')
  update(@Response({ passthrough: true }) res, @Param('id') id: string, @Body() updateGoalDto: UpdateGoalDto) {
    return this.goalService.update(id, updateGoalDto, res);
  }

  @ApiOperation({
    summary: 'Delete a goal',
    description: 'Endpoint to delete a financial goal for the authenticated user.',
  })
  @ApiResponse({
    status: 200,
    description: 'The goal has been successfully deleted.',
    schema: {
      example: {
        message: 'Goal deleted successfully',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid goal ID',
    schema: {
      example: {
        statusCode: 400,
        errors: [
          {
            message: 'Invalid goal ID',
          },
        ],
      },
    },
  })
  @Roles(['user', 'family_admin'])
  @Delete(':id')
  remove(@Response({ passthrough: true }) res, @Param('id') id: string) {
    return this.goalService.remove(id, res);
  }
}
