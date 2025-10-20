import { IsDateString, IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { PatientGender } from '../entities/patient.entity';

export class UpsertPatientDto {
  @IsString() name: string;
  @IsString() lastName: string;

  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsEmail()  email?: string;

  @IsDateString() birthDate: string; // YYYY-MM-DD

  @IsEnum(PatientGender) gender: PatientGender;

  @IsOptional() @IsString() address?: string;
}
