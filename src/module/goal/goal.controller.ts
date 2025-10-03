import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Response,
  UseGuards,
} from '@nestjs/common';
import { GoalService } from './goal.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { AuthGuard } from '../jwt.guard';
import { Roles } from '../role.decorator';
import { RolesGuard } from '../role.guard';

@Controller('goal')
@UseGuards(AuthGuard, RolesGuard)
export class GoalController {
  constructor(private readonly goalService: GoalService) {}

  @Roles(['user', 'family_admin'])
  @Post()
  create(
    @Body() createGoal: CreateGoalDto,
    @Response({ passthrough: true }) res,
  ) {
    return this.goalService.create(createGoal, res);
  }

  @Roles(['user', 'family_admin'])
  @Get('')
  findAll(@Response({ passthrough: true }) res) {
    return this.goalService.findAll(res);
  }

  @Roles(['user', 'family_admin'])
  @Get(':goalId')
  findOne(
    @Param() param: { goalId: string },
    @Response({ passthrough: true }) res,
  ) {
    return this.goalService.findOne(param.goalId, res);
  }

  @Roles(['user', 'family_admin'])
  @Patch(':goalId')
  update(
    @Response({ passthrough: true }) res,
    @Param() param: { goalId: string },
    @Body() updateGoalDto: UpdateGoalDto,
  ) {
    return this.goalService.update(param.goalId, updateGoalDto, res);
  }

  @Roles(['user', 'family_admin'])
  @Delete(':goalId')
  remove(
    @Response({ passthrough: true }) res,
    @Param() param: { goalId: string },
  ) {
    return this.goalService.remove(param.goalId, res);
  }
}
