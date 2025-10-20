import { Column, CreateDateColumn, Entity, Index, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Patient } from './patient.entity';

export enum UserRole {
  Doctor   = 'doctor',
  Paciente = 'paciente',
  // En tu migración existe 'admin', pero no lo usaremos.
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
    enumName: 'user_role_enum', // <- coincide con la migración
    default: UserRole.Doctor,
  })
  role: UserRole;

  @Column({ type: 'varchar' })
  password: string; // hash

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  // --- relaciones ---
  @OneToOne(() => Patient, (p) => p.user, { cascade: false })
  patient?: Patient;
}
