export enum UserRoleApi {
  PATIENT = 'PATIENT',
  DOCTOR  = 'DOCTOR',
  ADMIN   = 'ADMIN',
}

import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

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

  @ApiProperty({ enum: ['DOCTOR', 'PATIENT', 'PACIENTE', 'ADMIN'] })
  @IsString()
  role!: string;

  @ApiProperty({ description: 'Debe venir en true si aceptó T&C' })
  @IsBoolean()
  acceptTerms!: boolean;

  // Solo médico (opcionales)
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  professionalId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  specialty?: string;
}