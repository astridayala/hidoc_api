import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity'; 
import { DoctorCategory } from './doctor-category.entity';
import { AvailabilitySlot } from './availability-slot.entity';

@Entity('doctor_profile')
export class DoctorProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { eager: true })
  user: User; // user.role === 'doctor'

  @Column({ type: 'varchar' })  fullName: string;
  @Column({ type: 'varchar' })  specialty: string;
  @Column({ type: 'int', default: 0 }) price: number;
  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 }) rating: number;
  @Column({ type: 'text', nullable: true }) about?: string;
  @Column({ type: 'boolean', default: false }) isOnline: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @ManyToMany(() => DoctorCategory, { eager: true })
  @JoinTable({
    name: 'doctor_category_on_doctor',
    joinColumn: { name: 'doctor_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'category_id', referencedColumnName: 'id' },
  })
  categories: DoctorCategory[];

  @OneToMany(() => AvailabilitySlot, s => s.doctor, { cascade: true })
  availability: AvailabilitySlot[];
}
