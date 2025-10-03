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


// create , get all, get one, edit investment, delete
@UseGuards(AuthGuard, RolesGuard)
@Controller('investment')
export class InvestmentController {
  constructor(private readonly investmentService: InvestmentService) {}

  @Roles(['user', 'family_admin'])
  @Post()
  create(
    @Body() createInvestmentDto: CreateInvestmentDto,
    @Response({ passthrough: true }) res,
  ) {
    return this.investmentService.create(createInvestmentDto, res);
  }

  @Roles(['user', 'family_admin'])
  @Get()
  findAll(@Response({ passthrough: true }) res) {
    return this.investmentService.findAll(res);
  }

  @Roles(['user', 'family_admin'])
  @Get(':id')
  findOne(@Param('id') id: string, @Response({ passthrough: true }) res) {
    return this.investmentService.findOne(id, res);
  }

  @Roles(['user', 'family_admin'])
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateInvestmentDto: UpdateInvestmentDto,
    @Response({ passthrough: true }) res,
  ) {
    return this.investmentService.update(id, updateInvestmentDto, res);
  }

  @Roles(['user', 'family_admin'])
  @Delete(':id')
  remove(@Param('id') id: string, @Response({ passthrough: true }) res) {
    return this.investmentService.remove(id, res);
  }
}
