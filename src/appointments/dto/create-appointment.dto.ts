import { IsUUID, IsISO8601, IsOptional, IsString, IsDateString, IsNotEmpty } from 'class-validator';

export class CreateAppointmentDto {
  @IsUUID() doctorUserId: string;   // user.id del doctor
  @IsDateString() scheduledAt: string; // ISO date
  @IsString() @IsNotEmpty() reason: string;
  note?: string;
}
