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

// Get user info,edit user, delete user,get al users, search for users I guess
@Controller('user')
@UseGuards(AuthGuard)
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

  @Roles(['admin', 'user'])
  @Delete(':id')
  remove(@Param('id') params: { id: string }) {
    return this.userService.remove(params.id);
  }
}
