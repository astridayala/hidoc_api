import { Column, Entity, PrimaryGeneratedColumn, ManyToMany } from 'typeorm';
import { DoctorProfile } from './doctor-profile.entity';

@Entity('doctor_category')
export class DoctorCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  code: string; // GENERAL / ESPECIALIZADA / PEDIATRIA

  @Column({ type: 'varchar' })
  name: string;

  @ManyToMany(() => DoctorProfile, (d) => d.categories)
  doctors: DoctorProfile[];
}
