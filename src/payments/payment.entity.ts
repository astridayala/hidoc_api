import { Procedure } from "src/procedures/procedure.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";

/**
 * Entidad Payments
 * Representa el pago que se realiza para un procedimiento específico
 */
@Entity('payment')
export class Payment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @OneToOne(() => Procedure, procedure => procedure.payment, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'procedure_id' })
    procedure: Procedure;

    @Column({ type: 'date' })
    date: Date;

    @Column('decimal', { precision: 10, scale: 2 })
    amount: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
