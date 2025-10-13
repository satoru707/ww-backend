import { AuditLogService } from 'src/module/audit_log/audit_log.service';
import { CreateAuditLogDto } from 'src/module/audit_log/dto/create-audit_log.dto';

export async function logEvent(
  auditLogService: AuditLogService,
  dto: Partial<CreateAuditLogDto & { details?: any }>,
  req?: any,
) {
  try {
    const payload: CreateAuditLogDto = {
      userId: dto.userId || req?.user?.sub || 'N/A',
      actionType: dto.actionType || 'UNKNOWN',
      level: dto.level || 'INFO',
      details: dto.details ? JSON.stringify(dto.details) : JSON.stringify(''),
      ipAddress: req?.ip || req?.headers?.['x-forwarded-for'] || 'N/A',
      userAgent: req?.headers?.['user-agent'] || 'N/A',
      familyId: dto.familyId,
    } as CreateAuditLogDto;

    await auditLogService.create(payload);
  } catch (error) {
    // non-blocking: log to console if audit logging fails
    console.error('Audit log failed', error);
  }
}
