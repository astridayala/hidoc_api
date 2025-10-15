import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Appointment } from './appointments.entity';
import { Repository } from 'typeorm';
import { CreateAppointmentsDto } from './dto/appointments.dto';

/**
 * Servicio para gestionar las citas de los pacientes
 * Proporciona metodos para crear, buscar, actualizar y eliminar las citas
 */
@Injectable()
export class AppointmentsService {  
    constructor(
        @InjectRepository(Appointment)
        private appointmentsRepository: Repository<Appointment>
    ) {}

    /**
     * Crea una cita
     * @param createAppointmentsDto - Datos de la cita
     * @returns La cita creada
     */
    async create(createAppointmentsDto: CreateAppointmentsDto): Promise<Appointment> {
        const { patientId, start, end, description } = createAppointmentsDto;
        const newAppointment = this.appointmentsRepository.create({
            patient: { id: patientId },
            start,
            end,
            description
        })

        return this.appointmentsRepository.save(newAppointment)
    }

    /**
     * Busca todas las citas
     * @returns Lista de citas
     */
    async findAll(): Promise<Appointment[]> {
        return await this.appointmentsRepository.find({ 
            relations: ['patient'],
            order: { start: 'ASC' } 
        })
    }

    /**
     * Busca una cita por su ID
     * @param id - ID de la cita
     * @returns La cita encontrado
     */
    async findOne(id: string): Promise<Appointment> {
        const appointment = await this.appointmentsRepository.findOne({
            where: { id },
            relations: ['patient']
        })
        if (!appointment) {
            throw new NotFoundException('Cita no encontrada');
        }
        return appointment;
    }

    /**
     * Busca las citas de un paciente
     * @param patientId - ID del paciente
     * @returns Las citas de un paciente
     */
    async findByPatient(patientId: string): Promise<Appointment[]> {
        const appointments = await this.appointmentsRepository.find({
            where: { patient: { id: patientId } },
            relations: ['patient'],
            order: { start: 'ASC' }
        });

        if (!appointments || appointments.length === 0) {
            throw new NotFoundException(`No se encontraron citas para el paciente con id ${patientId}`);
        }

        return appointments;
    }

    /**
     * Elimina un cita
     * @param id - ID de la cita
     * @returns true si se elimino correctamente
     */
    async remove(id: string): Promise<{ message: string }> {
        const appointment = await this.appointmentsRepository.delete(id);

        if(appointment.affected === 0 ) {
            throw new NotFoundException(`La cita con ${id} fue eliminada correctamente`)
        }

        return { message: `La cita con id ${id}, fue eliminada correctamente` }
    }
    
}
