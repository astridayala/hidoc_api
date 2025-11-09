import { IsUUID, IsISO8601, IsOptional, IsString } from 'class-validator';

export class CreateAppointmentsDto {
  @IsUUID()
  doctorUserId: string;

  @IsISO8601()
  start: string;

  @IsISO8601()
  end: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  description?: string;
}