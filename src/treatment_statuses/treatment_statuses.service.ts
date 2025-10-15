import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TreatmentStatus } from './treatment_status.entity';
import { Repository } from 'typeorm';
import { CreateTreatmentStatusDto } from './dto/create-treatment_statuses.dto';

/**
 * Servicio para gestionar los estados de los tratamientos de los pacientes
 * Proporciona metodos para crear, buscar, actualizar y eliminar los estados de los tratamientos
 */
@Injectable()
export class TreatmentStatusesService {
    constructor(
        @InjectRepository(TreatmentStatus)
        private treatmentStatusRepository: Repository<TreatmentStatus>,
    ) {}

    /**
     * Crea un nuevo status de los tratamientos
     * @param createTreatmentStatusDto - Datos de los estados del tratamiento
     * @returns El estado de tratamiendo creado
     */
    async create(createTreatmentStatusDto: CreateTreatmentStatusDto): Promise<TreatmentStatus> {
        const newTreatmentStatus = this.treatmentStatusRepository.create(createTreatmentStatusDto)

        return this.treatmentStatusRepository.save(newTreatmentStatus)
    }

    /**
     * Obtiene todos los estados de los tratamientos
     * @returns Lista de los estados de los tratamientos
     */
    async findAll(): Promise<TreatmentStatus[]> {
        return this.treatmentStatusRepository.find();
    }

    /**
     * Busca un estado de tratamiento por su ID
     * @param id - ID del estado de tratamiento
     * @returns El estado de tratamiento encontrado
     */
    async findOne(id: string): Promise<TreatmentStatus> {
        const treatmentStatus = await this.treatmentStatusRepository.findOne({ where: { id } })
        
        if (!treatmentStatus) {
            throw new NotFoundException(`Estado de tratamiento ${id} no encontrado`)
        }

        return treatmentStatus;
    }

    /**
     * Elimina el estado de tratamientos
     * @param id - ID del estado de tratamiento
     * @returns true si se elimino correctamente
     */
    async remove(id: string): Promise<boolean> {
        const treatmentStatus = await this.findOne(id)
        await this.treatmentStatusRepository.remove(treatmentStatus);
        return true;
    }
}
