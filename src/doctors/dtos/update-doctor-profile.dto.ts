// src/doctors/dtos/update-doctor-profile.dto.ts
import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class UpdateDoctorProfileDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @IsString()
  @IsOptional()
  specialty?: string;

  @IsString()
  @IsOptional()
  bio?: string;
}