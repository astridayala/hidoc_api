import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TreatmentType } from './treatment_type.entity';
import { Repository } from 'typeorm';
import { CreateTreatmentTypesDto } from './dto/create-treatments_types.dto';

/**
 * Servicio para gestionar los tipos de tratamientos de los pacientes
 * Proporciona metodos para crear, buscar, actualizar y eliminar los tipos de tratamiento
 */
@Injectable()
export class TreatmentsTypesService {
    constructor(
        @InjectRepository(TreatmentType)
        private treatmentsTypeRepository: Repository<TreatmentType>,
    ) {}

    /**
     * Crea un nuevo tipo de tratamiento
     * @param createTreatmentTypesDto - Datos del tipo de tratamiento
     * @returns El tipo de tratamiento creado
     */
    async create(createTreatmentTypesDto: CreateTreatmentTypesDto): Promise<TreatmentType> {
        const newTreatmentType = this.treatmentsTypeRepository.create(createTreatmentTypesDto)

        return this.treatmentsTypeRepository.save(newTreatmentType)
    }

    /**
     * Obtiene todos los tipos de tratamiento
     * @returns Lista de tipos de tratamientos
     */
    async findAll(): Promise<TreatmentType[]> {
        return this.treatmentsTypeRepository.find()
    }

    /**
     * Busca una condicion por su ID
     * @param id - ID del tipo de tratamiento
     * @returns El tipo de tratamiento encontrado
     */
    async findOne(id: string): Promise<TreatmentType> {
        const treatmentType = await this.treatmentsTypeRepository.findOne({ where: { id } })

        if(!treatmentType) {
            throw new NotFoundException(`Tipo de Tratamiento ${id} no encontrado`)
        }

        return treatmentType;
    }

    /**
     * Elimina el tipo de tratamiento
     * @param id - ID del tipo de tratamiento
     * @returns true si se elimino correctamente
     */
    async remove(id: string): Promise<boolean> {
        const treatmentType = await this.findOne(id)
        await this.treatmentsTypeRepository.remove(treatmentType);
        return true
    }
}
