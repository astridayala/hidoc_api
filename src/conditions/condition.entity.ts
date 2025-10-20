import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { MedicalRecordCondition } from '../medical_record_conditions/medical_record_condition.entity';

@Entity('condition')
export class Condition {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @OneToMany(
    () => MedicalRecordCondition,
    (mrc) => mrc.condition,
    { cascade: false }
  )
  medicalRecordConditions: MedicalRecordCondition[];
}