import { Column, CreateDateColumn, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { MedicalRecord } from "src/medical_record/medical_record.entity";
import { Appointment } from "src/appointments/appointments.entity";

/**
 * Entidad Paciente
 * Representa a todos los paciente del sistema
 */
@Entity('patient')
export class Patient {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string

    @Column()
    lastName: string

    @Column({ nullable: true })
    phone: string

    @Column({ nullable: true })
    email: string

    @Column({ type: 'date' })
    birthDate: Date;

    @Column({
        type: 'enum',
        enum: ['femenino', 'masculino']
    })
    gender: string

    @Column({ nullable: true, type: 'text' })
    address: string

    @OneToOne(() => MedicalRecord, record => record.patient, { cascade:true })
    medicalRecord: MedicalRecord;
    
    @OneToMany(() => Appointment, appointment => appointment.patient)
    appointments: Appointment[];
    
}
