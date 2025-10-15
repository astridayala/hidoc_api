import { Patient } from "src/patients/patient.entity";
import { CreateDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { MedicalRecordCondition } from "src/medical_record_conditions/medical_record_condition.entity";
import { Treatment } from "src/treatments/treatment.entity";

/**
 * Entidad Historial Medico
 * Representa a todos los historiales de los pacientes
 */
@Entity('medical_record')
export class MedicalRecord {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @OneToOne(() => Patient, patient => patient.medicalRecord)
    @JoinColumn({ name: 'patient_id' })
    patient: Patient;

    @OneToMany(() => MedicalRecordCondition, mrc => mrc.medicalRecord, { cascade: true })
    conditions: MedicalRecordCondition[];

    @OneToMany(() => Treatment, treatment => treatment.medicalRecord, { cascade:true })
    treatments: Treatment[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
