import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

/**
 * DTO para crear relacion entre historial y condicion
 * Define y valida los datos necesarios para crear relacion entre historial y condicion
 */
export class CreateMedicalRecordConditionDto {
  @ApiProperty({
    description: 'ID del historial médico asociado',
    example: 'f1d8a1d2-3b4e-4c5a-9a7f-1b2c3d4e5f6a',
  })
  @IsUUID()
  @IsNotEmpty({ message: 'El ID es requerido' })
  medicalRecordId: string;

  @ApiProperty({
    description: 'ID de la condición médica',
    example: 'a3b2c1d4-e5f6-4a7b-9c8d-2f1e3d4b5a6c',
  })
  @IsUUID()
  @IsNotEmpty({ message: 'El ID es requerido' })
  conditionId: string;
}
