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
import { InvestmentService } from './investment.service';
import { CreateInvestmentDto } from './dto/create-investment.dto';
import { UpdateInvestmentDto } from './dto/update-investment.dto';
import { AuthGuard } from '../jwt.guard';
import { Roles } from '../role.decorator';
import { RolesGuard } from '../role.guard';
import {
  ApiResponse,
  ApiBadRequestResponse,
  ApiOperation,
  ApiSecurity,
} from '@nestjs/swagger';

// create , get all, get one, edit investment, delete
@UseGuards(AuthGuard, RolesGuard)
@ApiSecurity('access_token')
@ApiSecurity('refresh_token')
@Controller('investment')
export class InvestmentController {
  constructor(private readonly investmentService: InvestmentService) {}

  @ApiOperation({ summary: 'Create an investment' })
  @ApiResponse({
    status: 201,
    description: 'The investment has been successfully created',
    schema: {
      example: {
        data: {
          id: '1',
          symbol: '$',
          quantity: 100,
          purchase_price: 50.0,
          current_price: 55.0,
          purchase_date: '2023-10-01T00:00:00.000Z',
          createdAt: '2023-10-01T12:00:00.000Z',
        },
        errors: null,
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Error creating investment',
    schema: { example: { errors: [{ message: 'Error creating investment' }] } },
  })
  @Roles(['user', 'family_admin'])
  @Post()
  create(
    @Body() createInvestmentDto: CreateInvestmentDto,
    @Response({ passthrough: true }) res,
  ) {
    return this.investmentService.create(createInvestmentDto, res);
  }

  @ApiOperation({ summary: 'Get all user investments' })
  @ApiResponse({
    status: 201,
    description: 'List of investments retreived successfully',
    schema: {
      example: {
        data: [
          {
            id: '1',
            symbol: '$',
            quantity: 100,
            purchase_price: 50.0,
            current_price: 55.0,
            purchase_date: '2023-10-01T00:00:00.000Z',
            createdAt: '2023-10-01T12:00:00.000Z',
          },
        ],
        errors: null,
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Error retreiving investments',
    schema: {
      example: { errors: [{ message: 'Error retreiving investments' }] },
    },
  })
  @Roles(['user', 'family_admin'])
  @Get()
  findAll(@Response({ passthrough: true }) res) {
    return this.investmentService.findAll(res);
  }

  @ApiOperation({ summary: 'Get one investment' })
  @ApiResponse({
    status: 200,
    description: 'Investment retrieved successfully',
    schema: {
      example: {
        data: {
          id: '1',
          symbol: '$',
          quantity: 100,
          purchase_price: 50.0,
          current_price: 55.0,
          purchase_date: '2023-10-01T00:00:00.000Z',
          createdAt: '2023-10-01T12:00:00.000Z',
        },
        errors: null,
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Error retreiving investment',
    schema: {
      example: { errors: [{ message: 'Error retreiving investment' }] },
    },
  })
  @Roles(['user', 'family_admin'])
  @Get(':id')
  findOne(@Param('id') id: string, @Response({ passthrough: true }) res) {
    return this.investmentService.findOne(id, res);
  }

  @ApiOperation({ summary: 'Update an investment' })
  @ApiResponse({
    status: 200,
    description: 'Investment updated successfully',
    schema: {
      example: {
        data: {
          id: '1',
          symbol: '$',
          quantity: 100,
          purchase_price: 50.0,
          current_price: 55.0,
          purchase_date: '2023-10-01T00:00:00.000Z',
          createdAt: '2023-10-01T12:00:00.000Z',
          updatedAt: '2023-10-02T12:00:00.000Z',
        },
        errors: null,
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Error updating investment',
    schema: { example: { errors: [{ message: 'Error updating investment' }] } },
  })
  @Roles(['user', 'family_admin'])
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateInvestmentDto: UpdateInvestmentDto,
    @Response({ passthrough: true }) res,
  ) {
    return this.investmentService.update(id, updateInvestmentDto, res);
  }

  @ApiOperation({ summary: 'Delete an investment' })
  @ApiResponse({
    status: 200,
    description: 'Investment deleted successfully',
    schema: {
      example: {
        data: { message: 'Investment deleted successfully' },
        errors: null,
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Error deleting investment',
    schema: { example: { errors: [{ message: 'Error deleting investment' }] } },
  })
  @Roles(['user', 'family_admin'])
  @Delete(':id')
  remove(@Param('id') id: string, @Response({ passthrough: true }) res) {
    return this.investmentService.remove(id, res);
  }
}
