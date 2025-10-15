import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDate, IsNotEmpty, IsOptional, IsString, IsUUID, Matches } from "class-validator";

/**
 * DTO para la creacion de procedimientos
 * Define y valida los datos necesarios para crear un nuevo procedimiento
 */
export class CreateProcedureDto {
    @ApiProperty({
        description: 'ID del tratamiento al que pertenece el procedimiento',
        example: '550e8400-e29b-41d4-a716-446655440000',
    })
    @IsUUID()
    @IsNotEmpty({ message: 'El ID del tratamiento es requerido' })
    treatmentId: string;

    @ApiProperty({
        description: 'Fecha del pago (YYYY-MM-DD)',
        example: '2025-08-21',
    })
    @IsNotEmpty({ message: 'La fecha de pago es requerida' })
    @IsDate({ message: 'La fecha del procedimiento debe ser una fecha válida' })
    @Type(() => Date)
    date: Date;

    @IsOptional()
    @ApiProperty({
        description: 'Descripción del procedimiento realizado',
        example: 'Limpieza dental completa con ultrasonido',
    })
    description?: string;

}