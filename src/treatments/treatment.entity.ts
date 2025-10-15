import { MedicalRecord } from "src/medical_record/medical_record.entity";
import { TreatmentType } from "src/treatments_types/treatment_type.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Procedure } from "src/procedures/procedure.entity";
import { TreatmentStatus } from "src/treatment_statuses/treatment_status.entity";

/**
 * Entidad tratamientos
 * Representa a todos los tratamientos que existen en el sistema y se aplican al paciente
 */
@Entity('treatment')
export class Treatment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => MedicalRecord, record => record.treatments, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'medical_record_id' })
    medicalRecord: MedicalRecord;

    @ManyToOne(() => TreatmentType, type => type.treatments)
    @JoinColumn({ name: 'treatment_type_id' })
    treatmentType: TreatmentType

    @Column('decimal', { precision: 10, scale: 2 })
    totalPrice: number;

    @OneToMany(() => Procedure, procedure => procedure.treatment, { cascade: true })
    procedures: Procedure[];

    @ManyToOne(() => TreatmentStatus, status => status.treatments)
    @JoinColumn({ name: 'status_id' })
    status: TreatmentStatus;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
