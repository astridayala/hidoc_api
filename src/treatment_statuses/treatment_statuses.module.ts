import { Module } from '@nestjs/common';
import { TreatmentStatusesService } from './treatment_statuses.service';
import { TreatmentStatusesController } from './treatment_statuses.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TreatmentStatus } from './treatment_status.entity';

/**
 * Modulo para el estado de tratamientos
 * Configura el repositorio y servicios relacionados con los estados de tratamiento
 */
@Module({
    imports: [TypeOrmModule.forFeature([TreatmentStatus])],
    providers: [TreatmentStatusesService],
    controllers: [TreatmentStatusesController],
    exports: [TreatmentStatusesService]
})
export class TreatmentStatusesModule {}
