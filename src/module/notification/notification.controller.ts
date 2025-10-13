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
import {
  ApiResponse,
  ApiBadRequestResponse,
  ApiOperation,
  ApiSecurity,
} from '@nestjs/swagger';

@UseGuards(AuthGuard, RolesGuard)
@ApiSecurity('access_token')
@ApiSecurity('refresh_token')
@Roles(['user', 'family_admin'])
@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @ApiOperation({ summary: 'Get all notifications' })
  @ApiResponse({
    status: 200,
    description: 'Returns all notifications',
  })
  @Get()
  findAll(@Response({ passthrough: true }) res) {
    return this.notificationService.findAll(res);
  }

  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiResponse({
    status: 200,
    description: 'Notification marked as read',
  })
  @Patch('/read:id')
  markAsRead(@Param('id') id: string, @Response({ passthrough: true }) res) {
    return this.notificationService.markAsRead(id, res);
  }

  @ApiOperation({ summary: 'Mark all notification as read' })
  @ApiResponse({
    status: 200,
    description: 'All notifications marked as read',
  })
  @Patch('/read')
  markAllAsRead(@Response({ passthrough: true }) res) {
    return this.notificationService.markAllAsRead(res);
  }

  @ApiOperation({ summary: 'Delete notification' })
  @ApiResponse({
    status: 200,
    description: 'Notification deleted',
  })
  @Delete(':id')
  @Delete(':id')
  delete(@Param('id') id: string, @Response({ passthrough: true }) res) {
    return this.notificationService.delete(id, res);
  }

  @ApiOperation({ summary: 'Delete all notifications' })
  @ApiResponse({
    status: 200,
    description: 'All notifications deleted',
  })
  @Delete('all')
  deleteAll(@Response({ passthrough: true }) res) {
    return this.notificationService.deleteAll(res);
  }
}
