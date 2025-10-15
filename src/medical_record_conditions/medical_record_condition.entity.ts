import { Condition } from "src/conditions/condition.entity";
import { MedicalRecord } from "src/medical_record/medical_record.entity";
import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

/**
 * Entidad condiciones de historiales
 * Representa la relacion entre los historiales y las condiciones/padecimientos de los pacientes
 */
@Entity('medical_record_condition')
export class MedicalRecordCondition {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => MedicalRecord, record => record.conditions, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'medical_record_id' })
    medicalRecord: MedicalRecord;

    @ManyToOne(() => Condition, condition => condition.medicalRecordConditions, { onDelete: 'CASCADE' })
    @JoinColumn({ name:'condition_id' })
    condition: Condition;
}
