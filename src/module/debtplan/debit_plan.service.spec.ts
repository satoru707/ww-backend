import { Test, TestingModule } from '@nestjs/testing';
import { deptplanService } from './debt_plan.service';

describe('deptplanService', () => {
  let service: deptplanService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [deptplanService],
    }).compile();

    service = module.get<deptplanService>(deptplanService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
