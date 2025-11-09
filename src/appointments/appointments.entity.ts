// appointments.entity.ts (fragmento relevante)
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum AppointmentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

@Entity({ name: 'appointment' })
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Mapea a column patient_id
  @Column('uuid', { name: 'patient_id' })
  patientId: string;

  // Mapea a column doctor_user_id
  @Column('uuid', { name: 'doctor_user_id' })
  doctorUserId: string;

  // Mapea a column scheduledAt (timestamp without time zone)
  @Column({ name: 'scheduledAt', type: 'timestamp without time zone' })
  scheduledAt: Date;

  @Column({
    type: 'enum',
    enum: AppointmentStatus,
    default: AppointmentStatus.CONFIRMED,
  })
  status: AppointmentStatus;

  @Column({ type: 'varchar', nullable: true })
  reason?: string;

  // <- Esto te faltaba en el entity (por eso TS decía que no existe)
  @Column({ type: 'text', nullable: true })
  note?: string;

  @Column({ name: 'createdAt', type: 'timestamp without time zone', default: () => 'now()' })
  createdAt: Date;
}