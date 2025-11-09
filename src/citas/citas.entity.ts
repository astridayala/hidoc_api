import { AppointmentStatus } from 'src/appointments/appointments.entity';
import { User } from 'src/users/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Patient } from 'src/users/entities/patient.entity';

@Entity('citas')
export class CitaDoctor {

    @PrimaryGeneratedColumn('uuid') 
    id: string; 

    @Column({ name: 'patient_id', type: 'uuid' })
    patientId: string; 

    @Column({ name: 'doctor_user_id', type: 'uuid' })
    doctorUserId: string;

    @Column({ type: 'timestamp with time zone' })
    start: Date; 

    @Column({ type: 'timestamp with time zone' })
    end: Date; 

    @Column()
    reason: string; 

    @Column({ nullable: true })
    note: string; 

    @Column({ type: 'enum', enum: AppointmentStatus })
    status: AppointmentStatus; 

    @ManyToOne(() => Patient, patient => patient.citas)
    @JoinColumn({ name: 'patient_id' })
    patient: Patient; 

    // Propiedad de relación del doctor
    @ManyToOne(() => User, user => user.doctorCitas)
    @JoinColumn({ name: 'doctor_user_id' })
    doctor: User; 
}