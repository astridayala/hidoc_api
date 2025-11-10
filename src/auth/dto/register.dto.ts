// auth/dto/register.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  ValidateIf,
  Equals,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';

export enum UserRoleApi {
  PATIENT = 'PATIENT',
  DOCTOR  = 'DOCTOR',
  ADMIN   = 'ADMIN',
}

const toBool = ({ value }: { value: any }) =>
  value === true || value === 'true' || value === 1 || value === '1';

export class RegisterDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  password!: string;

  // Permitimos DOCTOR, PATIENT, PACIENTE y ADMIN (tu backend mapea PACIENTE→paciente)
  @ApiProperty({ enum: ['DOCTOR', 'PATIENT', 'PACIENTE', 'ADMIN'] })
  @IsString()
  @Matches(/^(DOCTOR|PATIENT|PACIENTE|ADMIN)$/i, {
    message: 'role debe ser DOCTOR, PATIENT, PACIENTE o ADMIN',
  })
  role!: string;

  // Debe venir en true
  @ApiProperty({ description: 'Debe venir en true si aceptó T&C' })
  @Transform(toBool)
  @IsBoolean()
  @Equals(true, { message: 'Debe aceptar los términos y condiciones' })
  acceptTerms!: boolean;

  // ===== Campos solo para DOCTOR =====
  @ApiProperty({ required: false })
  @ValidateIf(o => String(o.role).toUpperCase() === 'DOCTOR')
  @IsString()
  professionalId?: string;

  @ApiProperty({
    required: false,
    description:
      'Checkbox: “Afirmo que mi identificación profesional está aprobada por la Junta…”.',
  })
  @ValidateIf(o => String(o.role).toUpperCase() === 'DOCTOR')
  @Transform(toBool)
  @IsBoolean()
  // Si quisieras forzar que sea true, descomenta:
  // @Equals(true, { message: 'Debe afirmar la aprobación de la Junta' })
  boardApproved?: boolean;

  // ===== Opcional para ambos roles =====
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  specialty?: string;
}