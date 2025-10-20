import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn } from 'typeorm';
import { MedicalRecord } from '../medical_record/medical_record.entity';
import { TreatmentType } from '../treatments_types/treatment_type.entity';
import { TreatmentStatus } from '../treatment_statuses/treatment_status.entity';
import { Procedure } from '../procedures/procedure.entity';

@Entity('treatment')
export class Treatment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => MedicalRecord, (mr) => mr.treatments, { onDelete: 'CASCADE' })
  medicalRecord: MedicalRecord;

  @ManyToOne(() => TreatmentType, { eager: true })
  treatmentType: TreatmentType;

  @ManyToOne(() => TreatmentStatus, { eager: true })
  status: TreatmentStatus;

  @Column('decimal', {
    precision: 10,
    scale: 2,
    transformer: {
      to: (value: number) => value,             // escribir number
      from: (value: string) => parseFloat(value), // leer como number
    },
  })
  totalPrice: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // 🔹 relación inversa que faltaba
  @OneToMany(() => Procedure, (p) => p.treatment, { cascade: true })
  procedures: Procedure[];
}