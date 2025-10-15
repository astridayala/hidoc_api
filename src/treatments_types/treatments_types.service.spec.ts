import { Test, TestingModule } from '@nestjs/testing';
import { TreatmentsTypesService } from './treatments_types.service';

describe('TreatmentsTypesService', () => {
  let service: TreatmentsTypesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TreatmentsTypesService],
    }).compile();

    service = module.get<TreatmentsTypesService>(TreatmentsTypesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
