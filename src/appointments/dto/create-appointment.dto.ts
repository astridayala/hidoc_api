import { IsDateString, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateAppointmentDto {
  @IsUUID() doctorUserId: string;   // user.id del doctor
  @IsDateString() scheduledAt: string; // ISO date
  @IsString() @IsNotEmpty() reason: string;
  note?: string;
}

export class CreateAppointmentDoctorDto {
  @IsUUID()
  patientId: string; // el ID del paciente

  @IsDateString()
  start: string; // inicio de la cita (start_time en la BD)

  @IsDateString()
  end: string; // fin de la cita (end_time en la BD)

  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsString()
  note?: string;
}
