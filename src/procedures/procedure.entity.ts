import { Payment } from "src/payments/payment.entity";
import { Treatment } from "src/treatments/treatment.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('procedure')
export class Procedure {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Treatment, treatment => treatment.procedures, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'treatment_id' })
    treatment: Treatment;

    @Column({ type: 'date' })
    date: Date;

    @Column({ type: 'text' })
    description: string;

    @OneToOne(() => Payment, payment => payment.procedure, { cascade: true })
    payment: Payment;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
