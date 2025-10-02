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
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { AuthGuard } from '../jwt.guard';
import { Roles } from '../role.decorator';

@Controller('transactions')
@UseGuards(AuthGuard, RolesGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}
  @Roles(['user', 'family_admin'])
  @Post()
  create(@Body() createTransaction: CreateTransactionDto, @Response() res) {
    return this.transactionsService.create(createTransaction, res);
  }

  @Roles(['user', 'family_admin'])
  @Get()
  findAll(@Response() res) {
    return this.transactionsService.findAll(res);
  }

  @Roles(['user', 'family_admin'])
  @Get(':id')
  findOne(@Param() param: { id: string }, @Response() res) {
    return this.transactionsService.findOne(param.id, res);
  }

  @Roles(['user', 'family_admin'])
  @Delete(':id')
  delete(@Param() param: { id: string }, @Response() res) {
    return this.transactionsService.remove(param.id, res);
  }

  @Roles(['family_admin', 'user'])
  @Get('family')
  findAllFam(@Response() res) {
    return this.transactionsService.findFamTransaction(res);
  }

  @Roles(['family_admin'])
  @Post('family')
  createFam(@Response() res, @Body() body: CreateTransactionDto) {
    return this.transactionsService.createFamily(res, body);
  }
}
