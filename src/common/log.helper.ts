import { AuditLogService } from 'src/module/audit_log/audit_log.service';
import { CreateAuditLogDto } from 'src/module/audit_log/dto/create-audit_log.dto';
import type { Request } from 'express';

export async function logEvent(
  auditLogService: AuditLogService,
  dto: Partial<CreateAuditLogDto & { details?: unknown }>,
  req?: Request,
) {
  try {
    // safely extract user sub if present on the request
    let userId = 'N/A';
    if (dto.userId) userId = dto.userId;
    else if (req && 'user' in req && req.user && typeof req.user === 'object') {
      const u = req.user as { sub?: string };
      if (u.sub) userId = u.sub;
    }

    const ipAddress =
      req?.ip ??
      (req && req.headers
        ? (req.headers['x-forwarded-for'] as string | undefined)
        : undefined) ??
      'N/A';
    const userAgent =
      req && req.headers ? (req.headers['user-agent'] ?? 'N/A') : 'N/A';

    const payload: CreateAuditLogDto = {
      userId,
      actionType: dto.actionType || 'UNKNOWN',
      level: (dto.level as 'INFO' | 'ERROR') || 'INFO',
      details: dto.details ? JSON.stringify(dto.details) : JSON.stringify(''),
      ipAddress,
      userAgent,
      familyId: dto.familyId,
    } as CreateAuditLogDto;

    await auditLogService.create(payload);
  } catch (err: unknown) {
    // non-blocking: log to console if audit logging fails
    console.error(
      'Audit log failed',
      err instanceof Error ? err.message : String(err),
    );
  }
}
