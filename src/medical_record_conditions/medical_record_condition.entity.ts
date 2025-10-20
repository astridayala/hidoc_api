import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { MedicalRecord } from '../medical_record/medical_record.entity';
import { Condition } from '../conditions/condition.entity';

@Entity('medical_record_condition')
export class MedicalRecordCondition {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // FK -> medical_record.id
  @ManyToOne(() => MedicalRecord, (record) => record.conditions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'medical_record_id' })
  medicalRecord: MedicalRecord;

  // FK -> condition.id
  @ManyToOne(() => Condition, (c) => c.medicalRecordConditions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'condition_id' })
  condition: Condition;
}