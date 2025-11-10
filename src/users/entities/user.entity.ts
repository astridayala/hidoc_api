import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Patient } from './patient.entity';
import { CitaDoctor } from 'src/citas/citas.entity';

export enum UserRole {
  Doctor   = 'doctor',
  Paciente = 'paciente',
}

@Entity('user')
@Index('IDX_user_email', ['email'])
@Index('IDX_user_name', ['name'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    enumName: 'user_role_enum', // coincide con tu migración
    default: UserRole.Doctor,
  })
  role: UserRole;

  @Column({ type: 'varchar' })
  password: string; // hash

  @Column({ type: 'varchar', nullable: true })
  phone?: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @OneToOne(() => Patient, (p) => p.user, { cascade: false, nullable: true })
  patient?: Patient;

  @OneToMany(() => CitaDoctor, (cita) => cita.doctor)
  doctorCitas: CitaDoctor[];
}