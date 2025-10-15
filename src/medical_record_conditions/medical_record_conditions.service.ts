import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MedicalRecordCondition } from './medical_record_condition.entity';
import { Repository } from 'typeorm';
import { CreateMedicalRecordConditionDto } from './dto/create-medical_record_condition.dto';

/**
 * Servicio para gestionar la relacion entre historial medico y la condicion
 * Proporciona metodos para crear, buscar, actualizar y eliminar la relacion entre historial y condicion
 */
@Injectable()
export class MedicalRecordConditionsService {
    constructor(
        @InjectRepository(MedicalRecordCondition)
        private medicalRecordConditionRepository: Repository<MedicalRecordCondition>
    ) {}

    /**
     * Crea una relacion entre historial medico y condicion
     * @param createMedicalRecordConditionDto - Datos de la relacion
     * @returns La relacion creada
     */
    async create(createMedicalRecordConditionDto: CreateMedicalRecordConditionDto): Promise<MedicalRecordCondition> {
        const { medicalRecordId, conditionId } = createMedicalRecordConditionDto;

        const newMedicalRecordCondition = this.medicalRecordConditionRepository.create({
            medicalRecord: { id: medicalRecordId },
            condition: { id: conditionId },
        })

        return this.medicalRecordConditionRepository.save(newMedicalRecordCondition)
    }

    /**
     * Obtiene todas las relaciones entre historial y condicion
     * @returns Lista de las relaciones
     */
    async findAll(): Promise<MedicalRecordCondition[]> {
        return this.medicalRecordConditionRepository.find();
    }

    /**
     * Busca una relacion en especifico
     * @param id - ID de la relacion entre historial y condicion
     * @returns La relacion entre historial y condicion
     */
    async findOne(id: string): Promise<MedicalRecordCondition> {
        const medicalRecordCondition = await this.medicalRecordConditionRepository.findOne({ 
            where: { id },
            relations: [
                'medicalRecord.patient',
                'condition'
            ] 
        })

        if(!medicalRecordCondition) {
            throw new NotFoundException(`La relacion ${id} entre historial y condicion no encontrado`)
        }

        return medicalRecordCondition;
    }

    /**
     * Elimina una relacion entre historial y condicion
     * @param id - ID de la relacion
     * @returns true si se elimino correctamente
     */
    async remove(id: string): Promise<Boolean> {
        const medicalRecordCondition = await this.findOne(id)
        await this.medicalRecordConditionRepository.remove(medicalRecordCondition)
        return true;
    }
}
