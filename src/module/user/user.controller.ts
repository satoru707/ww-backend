import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Res,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '../jwt.guard';
import { Roles } from '../role.decorator';

@Controller('user')
@UseGuards(AuthGuard, RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  find(@Res({ passthrough: true }) res) {
    return this.userService.find(res);
  }

  @Patch('me')
  @Roles(['user', 'family_admin', 'admin'])
  update(
    @Res({ passthrough: true }) res,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(res, updateUserDto);
  }

  @Get()
  @Roles(['admin'])
  findAll() {
    return this.userService.findAll();
  }

  @Roles(['admin', 'user', 'family_admin'])
  @Delete(':id')
  remove(@Param('id') params: { id: string }, @Res({ passthrough: true }) res) {
    return this.userService.remove(params.id, res);
  }

  @Roles(['user', 'family_admin'])
  @Get('export')
  exportUserData(@Res() res) {
    return this.userService.exportUserData(res);
  }
}
