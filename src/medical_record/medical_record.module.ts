import { Module } from '@nestjs/common';
import { MedicalRecordService } from './medical_record.service';
import { MedicalRecordController } from './medical_record.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicalRecord } from './medical_record.entity';
import { Patient } from 'src/patients/patient.old.entity';

/**
 * Modulo de historial medico
 * Configura el repositorio y servicios relacionados con el historial medico
 */
@Module({
  imports: [TypeOrmModule.forFeature([MedicalRecord, Patient])],
  providers: [MedicalRecordService],
  controllers: [MedicalRecordController],
  exports: [MedicalRecordService]
})
export class MedicalRecordModule {}
