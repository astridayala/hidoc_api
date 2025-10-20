import { Patient } from '../users/entities/patient.entity';
import { User } from '../users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum AppointmentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

/**
 * Entidad Citas
 * Representa a las citas de los pacientes
 */
@Entity('appointment')
@Index('IDX_appointment_patient_start', ['patient', 'start'])
@Index('IDX_appointment_doctor_start', ['doctorUser', 'start'])
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Patient, (patient) => patient.appointments, { eager: true })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  // Doctor = user con role 'doctor'
  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'doctor_user_id' })
  doctorUser: User;

  @Column({ name: 'start_time', type: 'timestamp' })
  start: Date;

  @Column({ name: 'end_time', type: 'timestamp' })
  end: Date;

  @Column({ type: 'enum', enum: AppointmentStatus, default: AppointmentStatus.PENDING })
  status: AppointmentStatus;

  @Column({ type: 'varchar', nullable: true })
  reason?: string;

  @Column({ nullable: true, name: 'notes', type: 'text' })
  description: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}