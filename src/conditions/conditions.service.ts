import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Condition } from './condition.entity';
import { Repository } from 'typeorm';
import { CreateConditionDto } from './dto/create-condition.dto';

/**
 * Servicio para gestionar los padecimientos de los pacientes
 * Proporciona metodos para crear, buscar y actualizar padecimiento
 */
@Injectable()
export class ConditionsService {
    constructor(
        @InjectRepository(Condition)
        private conditionsRepository: Repository<Condition>,
    ) {}

    /**
     * Crea un nuevo padecimiento
     * @param createConditionDto - Datos del padecimiento a crear
     * @returns La condicion creada
     */
    async create(createConditionDto: CreateConditionDto): Promise<Condition> {
        const newCondition = this.conditionsRepository.create(createConditionDto)
        
        return this.conditionsRepository.save(newCondition)
    }

    /**
     * Obtiene todos los padecimientos
     * @returns Lista de padecimientos
     */
    async findAll(): Promise<Condition[]> {
        return this.conditionsRepository.find()
    }

    /**
     * Busca una condicion por su ID
     * @param id - ID del padecimiento
     * @returns El padecimiento encontrado
     */
    async finOne(id: string): Promise<Condition> {
        const condition = await this.conditionsRepository.findOne({ where: { id } })

        if (!condition) {
            throw new NotFoundException(`Padecimiento con ID ${id} no encontrado`)
        }

        return condition;
    }

    /**
     * Elimina un padecimiento
     * @param id - ID del padecimiento a eliminar
     * @returns true si se elimino correctamente
     */
    async remove(id: string): Promise<boolean> {
        const condition = await this.finOne(id)
        await this.conditionsRepository.remove(condition);
        return true;
    }
}
