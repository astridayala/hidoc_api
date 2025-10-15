import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsUUID } from "class-validator";

/**
 * DTO para la creación de tratamientos
 * Define y valida los datos necesarios para crear un nuevo tratamiento
 */
export class CreateTreatmentDto {
    @ApiProperty({
        description: 'ID del historial medico del paciente',
        example: '550e8400-e29b-41d4-a716-446655440000',
    })
    @IsUUID()
    @IsNotEmpty({ message: 'El historial medico es requerido' })
    medicalRecordId: string;

    @ApiProperty({
        description: 'ID del tipo de tratamiento',
        example: '550e8400-e29b-41d4-a716-446655440111',
    })
    @IsUUID()
    @IsNotEmpty({ message: 'El tipo de tratamiento es requerido' })
    treatmentTypeId: string;

    @ApiProperty({
        description: 'Precio total del tratamiento',
        example: 1199.99,
    })
    @IsNumber({}, { message: 'El precio debe ser un numero' })
    @IsNotEmpty({ message: 'El precio es requerido' })
    totalPrice: number;

    /**@ApiProperty({
        description: 'ID del estado de tratamiento',
        example: '550e8400-e29b-41d4-a716-446655440222'
    })
    @IsUUID()
    @IsNotEmpty({ message: 'El estado del tratamiento es requerido' })
    statusId: string;
    */
}
