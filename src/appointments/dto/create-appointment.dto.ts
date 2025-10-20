import { IsDateString, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateAppointmentDto {
  @IsUUID() doctorUserId: string;   // user.id del doctor
  @IsDateString() scheduledAt: string; // ISO date
  @IsString() @IsNotEmpty() reason: string;
  note?: string;
}
