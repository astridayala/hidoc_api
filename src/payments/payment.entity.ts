// src/payments/entities/payment.entity.ts
import { Column, Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn, RelationId } from 'typeorm';
import { Procedure } from '../procedures/procedure.entity';

@Entity('payment')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Relación con Procedure. La columna en BBDD es procedure_id
  @OneToOne(() => Procedure, (procedure) => procedure.payment, { nullable: true })
  @JoinColumn({ name: 'procedure_id' })
  procedure?: Procedure | null;

  @RelationId((payment: Payment) => payment.procedure)
  procedureId: string | null;

  @Column({ type: 'date' })
  date: string; // YYYY-MM-DD

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  amount: string;

  @Column({ name: 'createdAt', type: 'timestamp', default: () => 'now()' })
  createdAt: Date;
}