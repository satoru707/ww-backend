import { Controller, Get, UseGuards, Param, UseInterceptors } from '@nestjs/common';
import { AuditLogService } from './audit_log.service';
import { AuthGuard } from '../jwt.guard';
import { Roles } from '../role.decorator';
import { RolesGuard } from '../role.guard';
import { ApiSecurity, ApiOperation, ApiParam } from '@nestjs/swagger';
import { UserAwareCacheInterceptor } from '../../user-aware-cache.interceptor';

@UseGuards(AuthGuard, RolesGuard)
@ApiSecurity('access_token')
@ApiSecurity('refresh_token')
@Controller('audit-log')
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Roles(['admin'])
  @ApiOperation({ summary: 'Get all audit logs' })
  @UseInterceptors(UserAwareCacheInterceptor)
  @Get('all_logs')
  findAll() {
    return this.auditLogService.findAll();
  }

  @Roles(['admin'])
  @ApiOperation({ summary: "Get user's audit log" })
  @ApiParam({ name: 'id', type: 'string' })
  @UseInterceptors(UserAwareCacheInterceptor)
  @Get(':id')
  findSome(@Param('id') id: string) {
    return this.auditLogService.findSome(id);
  }
}
