import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Response,
} from '@nestjs/common';
import { deptplanService } from './debt_plan.service';
import { CreatedeptplanDto } from './dto/create-debit_plan.dto';
import { UpdatedeptplanDto } from './dto/update-debit_plan.dto';
import { AuthGuard } from '../jwt.guard';
import { Roles } from '../role.decorator';
import { RolesGuard } from '../role.guard';
import {
  ApiSecurity,
  ApiParam,
  ApiResponse,
  ApiOperation,
  ApiBadRequestResponse,
} from '@nestjs/swagger';

@Controller('debit-plan')
@UseGuards(AuthGuard, RolesGuard)
@ApiSecurity('access_token')
@ApiSecurity('refresh_token')
export class deptplanController {
  constructor(private readonly deptplanService: deptplanService) {}

  @ApiOperation({
    summary: 'Create a new debt plan',
    description:
      'Endpoint to create a new debt plan for the authenticated user.',
  })
  @ApiResponse({
    status: 201,
    description: 'The debt plan has been successfully created.',
    schema: {
      example: {
        id: 'cuid1234567890',
        user_id: 'usercuid123456',
        name: 'Debt Repayment Plan',
        total_amount: 10000.0,
        monthly_payment: 500.0,
        interest_rate: 5.0,
        createdAt: '2024-01-01T12:00:00.000Z',
        updatedAt: '2024-01-01T12:00:00.000Z',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Error creating debt plan',
    schema: {
      example: {
        statusCode: 400,
        errors: [
          {
            message: 'Error creating debt plan',
          },
        ],
      },
    },
  })
  @Roles(['users', 'family_admin'])
  @Post()
  create(
    @Body() createdeptplanDto: CreatedeptplanDto,
    @Response({ passthrough: true }) res,
  ) {
    return this.deptplanService.create(createdeptplanDto, res);
  }

  @ApiOperation({
    summary: 'Get all debt plans',
    description:
      'Endpoint to retrieve all debt plans for the authenticated user.',
  })
  @ApiResponse({
    status: 200,
    description: 'A list of debt plans.',
    schema: {
      example: [
        {
          id: 'cuid1234567890',
          user_id: 'usercuid123456',
          name: 'Debt Repayment Plan',
          total_amount: 10000.0,
          monthly_payment: 500.0,
          interest_rate: 5.0,
          createdAt: '2024-01-01T12:00:00.000Z',
          updatedAt: '2024-01-01T12:00:00.000Z',
        },
      ],
    },
  })
  @ApiBadRequestResponse({
    description: 'Error retrieving debt plans',
    schema: {
      example: {
        statusCode: 400,
        errors: [
          {
            message: 'Error retrieving debt plans',
          },
        ],
      },
    },
  })
  @Roles(['users', 'family_admin'])
  @Get()
  findAll(@Response({ passthrough: true }) res) {
    return this.deptplanService.findAll(res);
  }

  @ApiOperation({
    summary: 'Get a debt plan by ID',
    description:
      'Endpoint to retrieve a specific debt plan by its ID for the authenticated user.',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The unique identifier of the debt plan',
    example: 'cuid1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'The requested debt plan.',
    schema: {
      example: {
        id: 'cuid1234567890',
        user_id: 'usercuid123456',
        name: 'Debt Repayment Plan',
        total_amount: 10000.0,
        monthly_payment: 500.0,
        interest_rate: 5.0,
        createdAt: '2024-01-01T12:00:00.000Z',
        updatedAt: '2024-01-01T12:00:00.000Z',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Error retrieving debt plan',
    schema: {
      example: {
        statusCode: 400,
        errors: [
          {
            message: 'Error retrieving debt plan',
          },
        ],
      },
    },
  })
  @Roles(['users', 'family_admin'])
  @Get(':id')
  findOne(@Param('id') id: string, @Response({ passthrough: true }) res) {
    return this.deptplanService.findOne(id, res);
  }

  @ApiOperation({
    summary: 'Update a debt plan',
    description:
      'Endpoint to update an existing debt plan for the authenticated user.',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The unique identifier of the debt plan to update',
    example: 'cuid1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'The updated debt plan.',
    schema: {
      example: {
        id: 'cuid1234567890',
        user_id: 'usercuid123456',
        name: 'Updated Debt Repayment Plan',
        total_amount: 9000.0,
        monthly_payment: 450.0,
        interest_rate: 4.5,
        createdAt: '2024-01-01T12:00:00.000Z',
        updatedAt: '2024-01-02T12:00:00.000Z',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Error updating debt plan',
    schema: {
      example: {
        statusCode: 400,
        errors: [
          {
            message: 'Error updating debt plan',
          },
        ],
      },
    },
  })
  @Roles(['users', 'family_admin'])
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatedeptplan: UpdatedeptplanDto,
    @Response({ passthrough: true }) res,
  ) {
    return this.deptplanService.update(id, updatedeptplan, res);
  }

  @ApiOperation({
    summary: 'Delete a debt plan',
    description:
      'Endpoint to delete a specific debt plan by its ID for the authenticated user.',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The unique identifier of the debt plan to delete',
    example: 'cuid1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'The debt plan has been successfully deleted.',
    schema: {
      example: {
        message: 'Debt plan deleted successfully',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Error deleting debt plan',
    schema: {
      example: {
        statusCode: 400,
        errors: [
          {
            message: 'Error deleting debt plan',
          },
        ],
      },
    },
  })
  @Roles(['users', 'family_admin'])
  @Delete(':id')
  remove(@Param('id') id: string, @Response({ passthrough: true }) res) {
    return this.deptplanService.remove(id, res);
  }
}
