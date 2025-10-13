import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Res,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { AuthGuard } from '../jwt.guard';
import { Roles } from '../role.decorator';
import { RolesGuard } from '../role.guard';
import {
  ApiResponse,
  ApiOperation,
  ApiSecurity,
  ApiBadRequestResponse,
  ApiParam,
} from '@nestjs/swagger';

@Controller('transactions')
@ApiSecurity('access_token')
@ApiSecurity('refresh_token')
@UseGuards(AuthGuard, RolesGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}
  @ApiOperation({
    summary: 'Create a transaction',
    description:
      'Create a transaction for a user. Accessible by users with roles user and family_admin.',
  })
  @ApiResponse({
    status: 201,
    description: 'The transaction has been successfully created.',
    schema: {
      example: {
        success: true,
        data: {
          id: 'string',
          user_id: 'string',
          amount: 100.0,
          type: 'income',
          category: 'salary',
          description: 'Monthly salary',
          date: '2023-10-01T00:00:00.000Z',
          createdAt: '2023-10-01T00:00:00.000Z',
          updatedAt: '2023-10-01T00:00:00.000Z',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Error creating transaction',
    schema: {
      example: {
        success: false,
        errors: [{ message: 'Error creating transaction' }],
      },
    },
  })
  @Roles(['user', 'family_admin'])
  @Post()
  create(
    @Body() createTransaction: CreateTransactionDto,
    @Res({ passthrough: true }) res,
  ) {
    return this.transactionsService.create(createTransaction, res);
  }

  @ApiOperation({
    summary: 'Get all transactions',
    description:
      'Retrieve all transactions for the authenticated user. Accessible by users with roles user and family_admin.',
  })
  @ApiResponse({
    status: 200,
    description: 'A list of transactions',
    schema: {
      example: {
        success: true,
        data: [
          {
            id: 'string',
            user_id: 'string',
            amount: 100.0,
            type: 'income',
            category: 'salary',
            description: 'Monthly salary',
            date: '2023-10-01T00:00:00.000Z',
            createdAt: '2023-10-01T00:00:00.000Z',
            updatedAt: '2023-10-01T00:00:00.000Z',
          },
        ],
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Error finding transactions',
    schema: {
      example: {
        success: false,
        errors: [{ message: 'Error finding transactions' }],
      },
    },
  })
  @Roles(['user', 'family_admin'])
  @Get()
  findAll(@Res({ passthrough: true }) res) {
    return this.transactionsService.findAll(res);
  }

  @ApiOperation({
    summary: 'Get all family transactions',
    description:
      'Retrieve all family transactions for the authenticated user. Accessible by users with roles user and family_admin.',
  })
  @ApiResponse({
    status: 200,
    description: 'A list of family transactions',
    schema: {
      example: {
        success: true,
        data: [
          {
            id: 'string',
            user_id: 'string',
            familyId: 'string',
            amount: 100.0,
            type: 'income',
            category: 'salary',
            description: 'Monthly salary',
            date: '2023-10-01T00:00:00.000Z',
            createdAt: '2023-10-01T00:00:00.000Z',
            updatedAt: '2023-10-01T00:00:00.000Z',
          },
        ],
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Error finding family transactions',
    schema: {
      example: {
        success: false,
        errors: [{ message: 'Error finding family transactions' }],
      },
    },
  })
  @Roles(['family_admin', 'user'])
  @Get('family')
  findAllFam(@Res({ passthrough: true }) res) {
    return this.transactionsService.findFamTransaction(res);
  }

  @ApiOperation({
    summary: 'Get a transaction by ID',
    description:
      'Retrieve a specific transaction by its ID. Accessible by users with roles user and family_admin.',
  })
  @ApiParam({ name: 'id', required: true, description: 'Transaction ID' })
  @ApiResponse({
    status: 200,
    description: 'The transaction details',
    schema: {
      example: {
        success: true,
        data: {
          id: 'string',
          user_id: 'string',
          amount: 100.0,
          type: 'income',
          category: 'salary',
          description: 'Monthly salary',
          date: '2023-10-01T00:00:00.000Z',
          createdAt: '2023-10-01T00:00:00.000Z',
          updatedAt: '2023-10-01T00:00:00.000Z',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Error finding transaction',
    schema: {
      example: {
        success: false,
        errors: [{ message: 'Error finding transaction' }],
      },
    },
  })
  @Roles(['user', 'family_admin'])
  @Get(':id')
  findOne(@Param() param: { id: string }, @Res({ passthrough: true }) res) {
    return this.transactionsService.findOne(param.id, res);
  }

  @ApiOperation({
    summary: 'Delete a transaction by ID',
    description:
      'Delete a specific transaction by its ID. Accessible by users with roles user and family_admin.',
  })
  @ApiParam({ name: 'id', required: true, description: 'Transaction ID' })
  @ApiResponse({
    status: 200,
    description: 'The transaction has been successfully deleted.',
    schema: {
      example: {
        success: true,
        data: {
          id: 'string',
          user_id: 'string',
          amount: 100.0,
          type: 'income',
          category: 'salary',
          description: 'Monthly salary',
          date: '2023-10-01T00:00:00.000Z',
          createdAt: '2023-10-01T00:00:00.000Z',
          updatedAt: '2023-10-01T00:00:00.000Z',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Error deleting transaction',
    schema: {
      example: {
        success: false,
        errors: [{ message: 'Error deleting transaction' }],
      },
    },
  })
  @Roles(['user', 'family_admin'])
  @Delete(':id')
  delete(@Param() param: { id: string }, @Res({ passthrough: true }) res) {
    return this.transactionsService.remove(param.id, res);
  }

  @ApiOperation({
    summary: 'Create a family transaction',
    description:
      'Create a family transaction for a user. Accessible by users with role family_admin only.',
  })
  @ApiResponse({
    status: 201,
    description: 'The family transaction has been successfully created.',
    schema: {
      example: {
        success: true,
        data: {
          id: 'string',
          user_id: 'string',
          familyId: 'string',
          amount: 100.0,
          type: 'income',
          category: 'salary',
          description: 'Monthly salary',
          date: '2023-10-01T00:00:00.000Z',
          createdAt: '2023-10-01T00:00:00.000Z',
          updatedAt: '2023-10-01T00:00:00.000Z',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Error creating family transaction',
    schema: {
      example: {
        success: false,
        errors: [{ message: 'Error creating family transaction' }],
      },
    },
  })
  @Roles(['family_admin'])
  @Post('family')
  createFam(
    @Res({ passthrough: true }) res,
    @Body() body: CreateTransactionDto,
  ) {
    return this.transactionsService.createFamily(res, body);
  }
}
