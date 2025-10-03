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
import { NotificationService } from './notification.service';
import { AuthGuard } from '../jwt.guard';
import { Roles } from '../role.decorator';
import { RolesGuard } from '../role.guard';


@UseGuards(AuthGuard, RolesGuard)
@Roles(['user', 'family_admin'])
@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  findAll(@Response() res) {
    return this.notificationService.findAll(res);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Response() res) {
    return this.notificationService.findOne(id, res);
  }

  @Delete(':id')
  update(@Param('id') id: string, @Response() res) {
    return this.notificationService.delete(id, res);
  }

  @Delete('all')
  deleteAll(@Response() res) {
    return this.notificationService.deleteAll(res);
  }
}
