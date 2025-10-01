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

@UseGuards(AuthGuard)
@Controller('budget')
export class BudgetController {
  constructor(private readonly budgetService: BudgetService) {}
  @Roles(['user', 'family_admin'])
  @Post()
  create(@Body() createBudget: CreateBudgetDto, @Response() res) {
    return this.budgetService.create(createBudget, res);
  }

  @Roles(['user', 'family_admin'])
  @Get()
  findAll(@Response() res) {
    return this.budgetService.findAll(res);
  }

  @Roles(['user', 'family_admin'])
  @Get(':id')
  findOne(@Param('id') id: string, @Response() res) {
    return this.budgetService.findOne(id, res);
  }

  @Roles(['user', 'family_admin'])
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateBudgetDto: UpdateBudgetDto,
    @Response() res,
  ) {
    return this.budgetService.update(id, updateBudgetDto, res);
  }

  @Roles(['user', 'family_admin'])
  @Delete(':id')
  remove(@Param('id') id: string, @Response() res) {
    return this.budgetService.remove(id, res);
  }

  @Roles(['family_admin'])
  @Post('family/:familyId')
  createFamilyBudget(
    @Param('familyId') familyId: string,
    @Body() createBudgetDto: CreateBudgetDto,
    @Response() res,
  ) {
    return this.budgetService.createFamilyBudget(
      familyId,
      createBudgetDto,
      res,
    );
  }

  @Roles(['family_admin', 'user'])
  @Get('family/:familyId')
  getFamilyBudgets(@Param('familyId') familyId: string, @Response() res) {
    return this.budgetService.getFamilyBudgets(familyId, res);
  }
}
