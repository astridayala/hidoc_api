import { Test, TestingModule } from '@nestjs/testing';
import { TreatmentStatusesService } from './treatment_statuses.service';

describe('TreatmentStatusesService', () => {
  let service: TreatmentStatusesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TreatmentStatusesService],
    }).compile();

    service = module.get<TreatmentStatusesService>(TreatmentStatusesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
