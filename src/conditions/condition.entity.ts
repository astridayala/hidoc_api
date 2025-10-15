import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { MedicalRecordCondition } from "src/medical_record_conditions/medical_record_condition.entity";

/**
 * Entidad Historial Medico
 * Representa a todos los historiales de los pacientes
 */
@Entity('condition')
export class Condition {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    name: string;

    @OneToMany(() => MedicalRecordCondition, mrc => mrc.condition)
    medicalRecordConditions: MedicalRecordCondition[];
}
