import { Module } from '@nestjs/common';
import { MedicalRecordConditionsService } from './medical_record_conditions.service';
import { MedicalRecordConditionsController } from './medical_record_conditions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicalRecordCondition } from './medical_record_condition.entity';

/**
 * Modulo para la relacion entre historial y condicion
 * Configura el repositorio y servicios relacionados entre historial y condicion
 */
@Module({
  imports: [TypeOrmModule.forFeature([MedicalRecordCondition])],
  providers: [MedicalRecordConditionsService],
  controllers: [MedicalRecordConditionsController],
  exports: [MedicalRecordConditionsService]
})
export class MedicalRecordConditionsModule {}
