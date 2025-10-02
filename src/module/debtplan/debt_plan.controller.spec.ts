import { Test, TestingModule } from '@nestjs/testing';
import { deptplanController } from './debit_plan.controller';
import { deptplanService } from './debt_plan.service';

describe('deptplanController', () => {
  let controller: deptplanController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [deptplanController],
      providers: [deptplanService],
    }).compile();

    controller = module.get<deptplanController>(deptplanController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
