import { Module } from '@nestjs/common';
import { TreatmentsService } from './treatments.service';
import { TreatmentsController } from './treatments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Treatment } from './treatment.entity';
import { TreatmentStatus } from 'src/treatment_statuses/treatment_status.entity';

/**
 * Modulo para los tratamientos
 * Configura el repositorio y servicios relacionados con los tratamientos
 */
@Module({
    imports: [TypeOrmModule.forFeature([Treatment, TreatmentStatus])],
    providers: [TreatmentsService],
    controllers: [TreatmentsController],
    exports: [TreatmentsService]
})
export class TreatmentsModule {}
