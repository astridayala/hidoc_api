import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Procedure } from './procedure.entity';
import { Repository } from 'typeorm';
import { CreateProcedureDto } from './dto/create-procedures.dto';

/**
 * Servicio para gestionar los procedimientos
 * Proporciona metodos para crear, buscar, actualizar y eliminar los procedimientos
 */
@Injectable()
export class ProceduresService {
    constructor(
        @InjectRepository(Procedure)
        private procedureRepository: Repository<Procedure>
    ) {}

    /**
     * Crea un nuevo procedimiento
     * @param createProceduresDto - DTO del procedimiento
     * @returns El procedimiento creado
     */
    async create(createProceduresDto: CreateProcedureDto): Promise<Procedure> {
        const { treatmentId, date, description } = createProceduresDto;

        const newProcedure = this.procedureRepository.create({
            treatment: { id: treatmentId },
            date,
            description,
        })

        return this.procedureRepository.save(newProcedure)
    }

    /**
     * Busca todos los procedimientos
     * @returns Lista de procedimientos
     */
    async findAll(): Promise<Procedure[]> {
        return this.procedureRepository.find({ 
            relations: ['payment']
        })
    }

    /**
     * Busca un procedimiento por su ID
     * @param id - ID del procedimiento
     * @returns El procedimiento encontrado
     */
    async findOne(id: string): Promise<Procedure> {
        const procedure = await this.procedureRepository.findOne({ 
            where: { id },
            relations: ['payment']
        })

        if (!procedure) {
            throw new NotFoundException(`Procedimiento ${id} no encontrado`)
        }

        return procedure;
    }

    /**
     * Elimina un pago 
     * @param id - ID del procedimiento
     * @returns true si se elimina correctamente
     */
    async remove(id: string): Promise<boolean> {
        const procedure = await this.findOne(id)
        await this.procedureRepository.remove(procedure)
        return true
    }
}
