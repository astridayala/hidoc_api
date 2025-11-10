import { IsUUID, IsString, IsDateString, IsNotEmpty, IsOptional, IsISO8601 } from 'class-validator';

export class CreateCitaDoctorDto {
  @IsUUID()
  @IsNotEmpty() // Asegura que no sea un string vacío, además de ser UUID
  patientId: string;

  @IsDateString()
  start: string;

  @IsDateString()
  end: string;

  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsOptional()
  @IsString()  
  note?: string;
}
export class GetCitasByDayDto {
  /**
   * Fecha para la consulta en formato YYYY-MM-DD
   * @example '2025-11-10'
   */
  @IsISO8601(
    { strict: true }, 
    { message: 'La fecha debe estar en formato YYYY-MM-DD' }
  )
  date: string;
}