import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { DoctorCategory } from './doctor-category.entity';
import { AvailabilitySlot } from './availability-slot.entity';

@Entity('doctor_profile')
export class DoctorProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // 👇 mapea a la columna real user_id
  @Column('uuid', { name: 'user_id' })
  userId: string;

  @Column({ name: 'fullName', type: 'varchar' })
  fullName: string;

  @Column({ type: 'varchar' })
  specialty: string;

  @Column({ type: 'integer', default: 0 })
  price: number;

  @Column({ type: 'numeric', precision: 3, scale: 2, default: 0 })
  rating: number;

  @Column({ name: 'isOnline', type: 'boolean', default: false })
  isOnline: boolean;

  // Relación con categorías (tabla puente doctor_category_on_doctor)
  @ManyToMany(() => DoctorCategory, (c) => c.doctors, { eager: false })
  @JoinTable({
    name: 'doctor_category_on_doctor',
    joinColumn: { name: 'doctor_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'category_id', referencedColumnName: 'id' },
  })
  categories: DoctorCategory[];

  // ✅ Relación inversa que te faltaba
  @OneToMany(() => AvailabilitySlot, (s) => s.doctor, { eager: false })
  availability: AvailabilitySlot[];
}