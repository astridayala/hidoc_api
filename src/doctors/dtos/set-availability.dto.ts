// src/doctors/dtos/set-availability.dto.ts
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsString, ValidateNested } from 'class-validator';

export class AvailabilitySlotDto {
  @IsInt()
  dayOfWeek: number; // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado

  @IsString()
  startTime: string; // "HH:mm" e.g., "08:00"

  @IsString()
  endTime: string; // "HH:mm" e.g., "17:00"
}

export class SetAvailabilityDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AvailabilitySlotDto)
  slots: AvailabilitySlotDto[];
}