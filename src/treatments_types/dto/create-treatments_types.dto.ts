import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

/**
 * DTO para crear un tipo de tratamiento
 * Define y valida los datos necesarios para crear un tipo de tratamiento
 */
export class CreateTreatmentTypesDto {
    @ApiProperty({
        example: 'Ortodoncia',
        description: 'Nombre del tipo de tratamiento'
    })
    @IsString({ message: 'El nombre debe ser un texto' })
    @IsNotEmpty({ message: 'El nombre del tipo de tratamiento es requerido' })
    name: string;
}