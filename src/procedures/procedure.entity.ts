import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column, CreateDateColumn, OneToOne } from 'typeorm';
import { Treatment } from '../treatments/treatment.entity';
import { Payment } from '../payments/payment.entity';

@Entity('procedure')
export class Procedure {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Treatment, (treatment) => treatment.procedures, { onDelete: 'CASCADE' })
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
