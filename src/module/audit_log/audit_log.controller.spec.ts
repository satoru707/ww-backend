import { Test, TestingModule } from '@nestjs/testing';
import { AuditLogController } from './audit_log.controller';
import { AuditLogService } from './audit_log.service';

describe('AuditLogController', () => {
  let controller: AuditLogController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuditLogController],
      providers: [AuditLogService],
    }).compile();

    controller = module.get<AuditLogController>(AuditLogController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
