import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty, IsOptional, IsString } from "class-validator";

/**
 * DTO para crear un estado de tratamiento
 * Define y valida los datos necesarios para crear un estado del tratamiento
 */
export class CreateTreatmentStatusDto {
    @ApiProperty({
        example: 'Activo',
        description: 'Nombre del estado del tratamiento'
    })
    @IsString({ message: 'El estado debe ser un texto' })
    @IsNotEmpty({ message: 'El estado es requerido' })
    name: string;

    @ApiProperty({
        description: 'Prioridad de orden del estado',
        example: 4,
        required: false,
    })
    @IsInt({ message: 'El numero de prioridad debe ser un numero' })
    @IsNotEmpty({ message: 'El orden de prioridad es requerido' })
    orderPriority: number;
}