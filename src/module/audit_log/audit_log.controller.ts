import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Response,
} from '@nestjs/common';
import { AuditLogService } from './audit_log.service';
import { CreateAuditLogDto } from './dto/create-audit_log.dto';
import { AuthGuard } from '../jwt.guard';
import { Roles } from '../role.decorator';
import { RolesGuard } from '../role.guard';

@UseGuards(AuthGuard, RolesGuard)
@Roles(['admin'])
@Controller('audit-log')
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Post()
  create(@Body() createAuditLogDto: CreateAuditLogDto) {
    return this.auditLogService.create(createAuditLogDto);
  }

  @Get()
  findAll() {
    return this.auditLogService.findAll();
  }
}
