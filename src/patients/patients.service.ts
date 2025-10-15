import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Patient } from './patient.entity';
import { Repository } from 'typeorm';
import { CreatePatientDto } from './dto/create-patient.dto';
import { MedicalRecordService } from 'src/medical_record/medical_record.service';

/**
 * Servicio para gestionar a los pacientes
 * Proporciona metodos para crear, buscar y actualizar los pacientes
 */
@Injectable()
export class PatientsService {
    constructor(
        @InjectRepository(Patient)
        private patientsRepository: Repository<Patient>,

        private medicalRecordService: MedicalRecordService,

    ) {}

    /**
     * Crea un nuevo paciente
     * @param createPatientDto - Datos del paciente a crear
     * @returns El paciente creado
     */

    async create(createPatientDto: CreatePatientDto): Promise<any> {
        const newPatient = this.patientsRepository.create(createPatientDto);
        const savedPatient = await this.patientsRepository.save(newPatient);

        const medicalRecord = await this.medicalRecordService.create({
            patientId: savedPatient.id,
        });

        return {
            ...savedPatient,
            medicalRecordId: medicalRecord.id,
        };
    }
    
    
    /**
     * Obtienen todos los pacientes
     * @returns Lista de pacientes creados
     */
    async findAll(): Promise<Patient[]> {
        return this.patientsRepository.find();
    }

    /**
     * Busca un paciente por su ID
     * @param id - ID del paciente a buscar
     * @returns El paciente encontrado
     */
    async findOne(id: string): Promise<Patient> {
        const patient = await this.patientsRepository.findOne({ where: { id } })

        if (!patient) {
            throw new NotFoundException(`El paciente con ID ${id} no encontrado`)
        }

        return patient;
    }
}
