import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

/**
 * DTO para la creacion de padecimientos o condiciones
 * Define y valida los datos necesarios para crear un padecimiento
 */
export class CreateConditionDto {
    @ApiProperty({ 
        example: 'Ninguna', 
        description: 'Nombre del padecimiento del paciente' 
    })
    @IsString({ message: 'El nombre debe ser una cadena de texto' })
    @IsNotEmpty({ message: 'El padecimiento es requerido' })
    name: string;
}