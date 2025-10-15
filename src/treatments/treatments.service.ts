import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Treatment } from './treatment.entity';
import { Repository } from 'typeorm';
import { CreateTreatmentDto } from './dto/create-treatment.dto';
import { TreatmentStatus } from 'src/treatment_statuses/treatment_status.entity';

/**
 * Servicio para gestionar los tratamientos de los pacientes
 * Proporciona metodos para crear, buscar, actualizar y elimianr los tratammientos
 */
@Injectable()
export class TreatmentsService {
    constructor(
        @InjectRepository(Treatment)
        private treatmentRepository: Repository<Treatment>,

        @InjectRepository(TreatmentStatus)
        private treatmentStatusRepository: Repository<TreatmentStatus>,
    ) {}

    /**
     * Crea un nuevo tratamiento
     * @param createTreatmentDto - Datos del tratamiento
     * @returns El tratamiento creado
     */
    async create(createTreatmentDto: CreateTreatmentDto): Promise<Treatment> {
        const { medicalRecordId, treatmentTypeId, totalPrice } = createTreatmentDto;
        const newTreatment = this.treatmentRepository.create({
            totalPrice,
            medicalRecord: { id: medicalRecordId },
            treatmentType: { id: treatmentTypeId },      
        })

        const activeStatus = await this.treatmentStatusRepository.findOne({
            where: { name: 'Activo' },
        });

        if (!activeStatus) {
            throw new Error('El estado "Activo" no está registrado en la base de datos.');
        }

        newTreatment.status = activeStatus;

        return this.treatmentRepository.save(newTreatment)
    }

    /**
     * Busca todos los tratamientos
     * @returns Lista de tratamientos
     */
    async findAll(): Promise<Treatment[]> {
        return await this.treatmentRepository.find({
            relations: [
                'medicalRecord',
                'treatmentType'
            ],
            order: { createdAt: 'DESC' },
        });
    }

    /**
     * Busca un tratamiento por su ID
     * @param id - ID del tratamiento
     * @returns El tratamiento encontrado
     */
    async findOne(id: string): Promise<Treatment> {
        const treatment = await this.treatmentRepository.findOne({
            where: { id },
            relations: [
                'medicalRecord',
                'treatmentType',
                'procedures',
                'procedures.payment'
            ],
        });

        if (!treatment) {
            throw new NotFoundException(`El tratamiento con id ${id} no existe`);
        }

        return treatment;
    }

    /**
     * Elimina un tratamiento
     * @param id - ID del tratamiento
     * @returns true si se elimino correctamente
     */
    async remove(id: string): Promise<{ message: string }> {
        const result = await this.treatmentRepository.delete(id);

        if (result.affected === 0) {
            throw new NotFoundException(`El tratamiento con id ${id} no existe`);
        }

        return { message: `El tratamiento con id ${id} fue eliminado correctamente` }
    }
}
