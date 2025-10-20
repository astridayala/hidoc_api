import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Treatment } from '../treatments/treatment.entity';

/**
 * Entidad Tipos de Tratamientos
 * Representa a los tipos de tratamientos que existen en el sistema
 */
@Entity('treatment_type')
export class TreatmentType {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    name: string;

   @OneToMany(() => Treatment, (t) => t.treatmentType)
    treatments: Treatment[];
}
