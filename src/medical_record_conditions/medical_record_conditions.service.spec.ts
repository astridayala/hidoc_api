import { Test, TestingModule } from '@nestjs/testing';
import { MedicalRecordConditionsService } from './medical_record_conditions.service';

describe('MedicalRecordConditionsService', () => {
  let service: MedicalRecordConditionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MedicalRecordConditionsService],
    }).compile();

    service = module.get<MedicalRecordConditionsService>(MedicalRecordConditionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
