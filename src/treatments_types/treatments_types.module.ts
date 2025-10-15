import { Module } from '@nestjs/common';
import { TreatmentsTypesService } from './treatments_types.service';
import { TreatmentsTypesController } from './treatments_types.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TreatmentType } from './treatment_type.entity';

/**
 * Modulo de tipo de tratamiento
 * Configura el repositorio y servicios relacionados con los tipos de tratamiento
 */
@Module({
  imports: [TypeOrmModule.forFeature([TreatmentType])],
  providers: [TreatmentsTypesService],
  controllers: [TreatmentsTypesController],
  exports: [TreatmentsTypesService]
})
export class TreatmentsTypesModule {}
