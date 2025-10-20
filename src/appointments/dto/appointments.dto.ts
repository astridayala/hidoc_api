import { IsDateString, IsNotEmpty, IsOptional, IsString, IsUUID, Validate } from 'class-validator';

export class CreateAppointmentsDto {
  @IsUUID() patientId: string;        // por ahora lo pasas así; luego puedes tomarlo de req.user
  @IsUUID() doctorUserId: string;     // user.id del doctor
  @IsDateString() start: string;      // ISO: 2025-10-21T09:00:00.000Z
  @IsDateString() end: string;
  @IsOptional() @IsString() reason?: string;
  @IsOptional() @IsString() description?: string;
}

export class CancelAppointmentDto {
  @IsString() @IsNotEmpty() reason: string;
}