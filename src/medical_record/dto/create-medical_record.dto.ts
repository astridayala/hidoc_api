import { ApiProperty } from "@nestjs/swagger";
import { IsUUID } from "class-validator";

/**
 * DTO para la creación de historiales medicos
 * Define y valida los datos necesarios para crear un historial medico
 */
export class CreateMedicalRecordDto {
    @ApiProperty({
        example: 'b6d5a9c7-3a0d-4c5a-b8a6-0c84a2e00a3b',
        description: 'ID del paciente'
    })
    @IsUUID()
    patientId: string;
}