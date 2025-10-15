import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MedicalRecord } from './medical_record.entity';
import { Repository } from 'typeorm';
import { CreateMedicalRecordDto } from './dto/create-medical_record.dto';
import { Patient } from 'src/patients/patient.entity';

/**
 * Servicio para gestionar los historiales medicos
 * Proporciona metodos para crear y buscar
 */
@Injectable()
export class MedicalRecordService {
    constructor(
        @InjectRepository(MedicalRecord)
        private medicalRecordRepository: Repository<MedicalRecord>,

        @InjectRepository(Patient)
        private patientRepository: Repository<Patient>,

    ) {}

    /**
     * Crea un nuevo historial medico
     * @param createMedicalRecordDto - Datos del historial medico a crear
     */
    async create(createMedicalRecordDto: CreateMedicalRecordDto): Promise<MedicalRecord> {
        //revisar si existe el cliente
        const patient = await this.patientRepository.findOneBy({
            id: createMedicalRecordDto.patientId
        })
        //valida si existe, sino manda un error
        if(!patient) throw new NotFoundException('Paciente no encontrado')

        const newMedicalRecord = this.medicalRecordRepository.create({
            patient: patient,
            conditions: [],
            treatments: []
        });
        return this.medicalRecordRepository.save(newMedicalRecord);
    }

    /**
     * Busca una historial por su ID
     * @param id - ID del historial medico
     * @returns El historial medico encontrado
     */
    async findOne(id: string): Promise<MedicalRecord> {
        const medicalRecord = await this.medicalRecordRepository.findOne({
            where: { id },
            relations: [
                'patient',
                'conditions',
                'conditions.condition',
                'treatments',
                'treatments.treatmentType',   
                'treatments.status',         
                'treatments.procedures',
                'treatments.procedures.payment',
            ],
        });

        if (!medicalRecord) {
            throw new NotFoundException(`Historial Medico ${id} no encontrado`);
        }

        return medicalRecord; // ya cumple con el ResponseDto
    }

    /**
     * Obtiene todos los historiales medicos de los pacientes
     * @returns Lista de historiales
     */
    async findAll(): Promise<MedicalRecord[]> {
        const medicalRecord = await this.medicalRecordRepository.find({
            relations: ['patient'],
            order: { createdAt: 'DESC' },
        });

        if (!medicalRecord || medicalRecord.length === 0) {
            throw new NotFoundException('No hay historiales médicos registrados');
        }

        return medicalRecord;
    }
}
