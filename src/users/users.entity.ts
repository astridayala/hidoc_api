import { Exclude } from "class-transformer";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

/**
 * Entidad Usuario
 * Representa a los usuarios del sistema de analítica
 * Roles disponibles: admin, doctor
 */
@Entity('user')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    email: string;

    @Column()
    name: string;

    @Column({
        type: 'enum',
        enum: ['admin', 'doctor'],
        default: 'doctor'
    })
    role: string;

    @Column()
    @Exclude() //Excluye este campo al serializar la entidad
    password: string;

    @CreateDateColumn()
    createdAt: Date;
}
