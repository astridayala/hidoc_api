import { Patient } from "src/patients/patient.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

/**
 * Entidad Citas
 * Representa a las citas de los pacientes
 */
@Entity('appointment')
export class Appointment {
    /**
     * id, pacienteId, fechaHoraInicio, fechaHoraFin, 
     * estado (pendiente, confirmada, cancelada), notas, etc.
     */
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Patient, patient => patient.appointments)
    @JoinColumn({ name: 'patient_id' })
    patient: Patient;

    @Column({ name: 'start_time', type: 'date' })
    start: Date

    @Column({ name: 'end_time', type: 'date' })
    end: Date

    @Column({ nullable: true, name: 'notes' })
    description: string

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
