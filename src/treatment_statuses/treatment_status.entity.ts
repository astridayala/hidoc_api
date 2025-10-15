import { Treatment } from "src/treatments/treatment.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

/**
 * Entidad tratamiento_estado
 * Representa a los estados de los tratamientos
 */
@Entity('treatment_status')
export class TreatmentStatus {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    name: string

    @Column({ default: 1 })
    orderPriority: number;

    @OneToMany(() => Treatment, treatment => treatment.status)
    treatments: Treatment[];
}
