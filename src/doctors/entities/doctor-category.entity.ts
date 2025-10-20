import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('doctor_category')
export class DoctorCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  code: string; // GENERAL | ESPECIALIZADA | PEDIATRIA

  @Column({ type: 'varchar' })
  name: string;
}
