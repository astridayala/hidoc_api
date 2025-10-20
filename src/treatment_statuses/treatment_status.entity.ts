import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Treatment } from '../treatments/treatment.entity';

@Entity('treatment_status')
export class TreatmentStatus {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  name: string;

  @Column({ type: 'int', default: 1 })
  orderPriority: number;

  @OneToMany(() => Treatment, (t) => t.status)
  treatments: Treatment[];
}