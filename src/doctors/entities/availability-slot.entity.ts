import { Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { DoctorProfile } from './doctor-profile.entity';

@Entity('availability_slot')
@Index('IDX_slot_doctor_start', ['doctor', 'start'])
export class AvailabilitySlot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => DoctorProfile, d => d.availability, { onDelete: 'CASCADE' })
  doctor: DoctorProfile;

  @Column({ type: 'timestamp' }) start: Date;
  @Column({ type: 'timestamp' }) end: Date;
  @Column({ type: 'boolean', default: false }) isBooked: boolean;
}