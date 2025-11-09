import {
  Column, CreateDateColumn, Entity, Index, JoinColumn,
  OneToOne, PrimaryGeneratedColumn, OneToMany
} from 'typeorm';
import { User } from './user.entity';
import { Appointment } from '../../appointments/appointments.entity';
import { CitaDoctor } from 'src/citas/citas.entity';

export enum PatientGender {
  Femenino  = 'femenino',
  Masculino = 'masculino',
}

@Entity('patient')
@Index('IDX_patient_name', ['name'])
@Index('IDX_patient_lastName', ['lastName'])
@Index('IDX_patient_email', ['email'])
@Index('IDX_patient_createdAt', ['createdAt'])
export class Patient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // 👇 agrega la columna física que usará el JoinColumn
  @Column({ type: 'uuid', name: 'userId', nullable: true })
  userId?: string;

  @OneToOne(() => User, (u) => u.patient, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user?: User;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar' })
  lastName: string;

  @Column({ type: 'varchar', nullable: true })
  phone?: string;

  @Column({ type: 'varchar', nullable: true })
  email?: string;

  @Column({ type: 'date' })
  birthDate: Date;

  @Column({
    type: 'enum',
    enum: PatientGender,
    enumName: 'patient_gender_enum', // ← coincide con tu migración original
  })
  gender: PatientGender;

  @Column({ type: 'text', nullable: true })
  address?: string;

  @Column({ type: 'uuid', nullable: true, unique: true })
  medicalRecordId?: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @OneToMany(() => Appointment, (a) => a.patientId)
  appointments?: Appointment[];

  @OneToMany(() => CitaDoctor, cita => cita.patient)
      citas: CitaDoctor[];
}