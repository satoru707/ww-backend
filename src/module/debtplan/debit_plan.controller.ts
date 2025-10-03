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

// create, get all,get one, edit plan, delete plan
@UseGuards(AuthGuard, RolesGuard)
@Controller('debit-plan')
export class deptplanController {
  constructor(private readonly deptplanService: deptplanService) {}

  @Roles(['users', 'family_admin'])
  @Post()
  create(
    @Body() createdeptplanDto: CreatedeptplanDto,
    @Response({ passthrough: true }) res,
  ) {
    return this.deptplanService.create(createdeptplanDto, res);
  }
  @Roles(['users', 'family_admin'])
  @Get()
  findAll(@Response({ passthrough: true }) res) {
    return this.deptplanService.findAll(res);
  }
  @Roles(['users', 'family_admin'])
  @Get(':id')
  findOne(@Param('id') id: string, @Response({ passthrough: true }) res) {
    return this.deptplanService.findOne(id, res);
  }
  @Roles(['users', 'family_admin'])
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatedeptplan: UpdatedeptplanDto,
    @Response({ passthrough: true }) res,
  ) {
    return this.deptplanService.update(id, updatedeptplan, res);
  }

  @Roles(['users', 'family_admin'])
  @Delete(':id')
  remove(@Param('id') id: string, @Response({ passthrough: true }) res) {
    return this.deptplanService.remove(id, res);
  }
}
