import {
  Entity, PrimaryGeneratedColumn, OneToOne, OneToMany, JoinColumn, CreateDateColumn
} from 'typeorm';
import { Patient } from '../users/entities/patient.entity';
import { Treatment } from '../treatments/treatment.entity';
import { MedicalRecordCondition } from '../medical_record_conditions/medical_record_condition.entity';

@Entity('medical_record')
export class MedicalRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Patient, (p) => p.medicalRecordId, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @OneToMany(() => Treatment, (t) => t.medicalRecord)
  treatments: Treatment[];

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @OneToMany(
    () => MedicalRecordCondition,
    (mrc) => mrc.medicalRecord,
    { cascade: false }
  )
  conditions: MedicalRecordCondition[];
}