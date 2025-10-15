import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Treatment } from "src/treatments/treatment.entity";

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

    @OneToMany(() => Treatment, treatment => treatment.treatmentType)
    treatments: Treatment[];
}
