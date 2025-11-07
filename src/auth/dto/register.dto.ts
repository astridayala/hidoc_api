import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail, IsString, MinLength, IsEnum, IsBoolean,
  ValidateIf, IsOptional
} from 'class-validator';

export enum UserRoleApi {
  PATIENT = 'PATIENT',
  DOCTOR  = 'DOCTOR',
  ADMIN   = 'ADMIN',
}

export class RegisterDto {
  @ApiProperty({ example: 'Ana Pérez' })
  @IsString()
  @MinLength(2)
  fullName!: string;

  @ApiProperty({ example: 'ana@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Secreta123!' })
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiProperty({ enum: UserRoleApi, example: UserRoleApi.PATIENT })
  @IsEnum(UserRoleApi)
  role!: UserRoleApi;

  @ApiProperty({ example: true })
  @IsBoolean()
  acceptTerms!: boolean;

  // SOLO para doctores
  @ApiPropertyOptional({ example: 'JVPM-123456' })
  @ValidateIf(o => o.role === UserRoleApi.DOCTOR)
  @IsString()
  @MinLength(3)
  professionalId?: string;

  @ApiPropertyOptional({ example: 'Cardiología' })
  @ValidateIf(o => o.role === UserRoleApi.DOCTOR)
  @IsOptional()
  @IsString()
  specialty?: string; // ← opcional; si no viene, pondremos 'General'

  @ApiPropertyOptional({ description: 'Confirmación de Junta de Vigilancia' })
  @ValidateIf(o => o.role === UserRoleApi.DOCTOR)
  @IsOptional()
  @IsBoolean()
  medicalBoardAck?: boolean; // ← ahora el request es válido
}