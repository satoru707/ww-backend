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
import { BudgetService } from './budget.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { AuthGuard } from '../jwt.guard';
import { Roles } from '../role.decorator';
import { RolesGuard } from '../role.guard';
import {
  ApiResponse,
  ApiSecurity,
  ApiOperation,
  ApiBadRequestResponse,
} from '@nestjs/swagger';

@UseGuards(AuthGuard, RolesGuard)
@ApiSecurity('access_token')
@ApiSecurity('refresh_token')
@Controller('budget')
export class BudgetController {
  constructor(private readonly budgetService: BudgetService) {}

  @ApiOperation({ summary: 'Create a budget' })
  @ApiResponse({
    status: 201,
    description: 'The budget has been successfully created.',
    schema: {
      example: {
        data: {
          id: '1',
          name: 'Monthly Budget',
          amount: 1000.0,
          limit_amount: 800.0,
          month: '2023-10-01T00:00:00.000Z',
          createdAt: '2023-10-01T12:00:00.000Z',
        },
        errors: null,
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data.',
    schema: { example: { errors: [{ message: 'Error creating budget' }] } },
  })
  @Roles(['user', 'family_admin'])
  @Post()
  create(
    @Body() createBudget: CreateBudgetDto,
    @Response({ passthrough: true }) res,
  ) {
    return this.budgetService.create(createBudget, res);
  }

  @ApiOperation({ summary: 'Get all budgets' })
  @ApiResponse({
    status: 200,
    description: 'List of budgets retrieved successfully.',
    schema: {
      example: {
        data: [
          {
            id: '1',
            name: 'Monthly Budget',
            amount: 1000.0,
            limit_amount: 800.0,
            month: '2023-10-01T00:00:00.000Z',
            createdAt: '2023-10-01T12:00:00.000Z',
          },
        ],
        errors: [],
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid request.',
    schema: { example: { errors: [{ message: 'Error fetching budgets' }] } },
  })
  @ApiSecurity('access_token')
  @ApiSecurity('refresh_token')
  @Roles(['user', 'family_admin'])
  @Get()
  findAll(@Response({ passthrough: true }) res) {
    return this.budgetService.findAll(res);
  }

  @Roles(['user', 'family_admin'])
  @Get(':id')
  findOne(@Param('id') id: string, @Response({ passthrough: true }) res) {
    return this.budgetService.findOne(id, res);
  }

  @Roles(['user', 'family_admin'])
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateBudgetDto: UpdateBudgetDto,
    @Response({ passthrough: true }) res,
  ) {
    return this.budgetService.update(id, updateBudgetDto, res);
  }

  @Roles(['user', 'family_admin'])
  @Delete(':id')
  remove(@Param('id') id: string, @Response({ passthrough: true }) res) {
    return this.budgetService.remove(id, res);
  }

  @Roles(['family_admin'])
  @Post('family/:familyId')
  createFamilyBudget(
    @Param('familyId') familyId: string,
    @Body() createBudgetDto: CreateBudgetDto,
    @Response({ passthrough: true }) res,
  ) {
    return this.budgetService.createFamilyBudget(
      familyId,
      createBudgetDto,
      res,
    );
  }

  @Roles(['family_admin', 'user'])
  @Get('family/:familyId')
  getFamilyBudgets(
    @Param('familyId') familyId: string,
    @Response({ passthrough: true }) res,
  ) {
    return this.budgetService.getFamilyBudgets(familyId, res);
  }
}
