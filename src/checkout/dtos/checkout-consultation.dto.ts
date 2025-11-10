// src/checkout/dto/checkout.dto.ts
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min, IsUUID } from 'class-validator';

export class CheckoutConsultationDto {
  @IsString() @IsNotEmpty()
  doctorId: string;

  @IsOptional()
  @IsUUID()
  procedureId?: string;

  @IsNumber() @Min(0)
  amount: number;

  @IsString() @IsNotEmpty()
  concept: string;

  @IsEnum(['card','tigo'])
  method: 'card' | 'tigo';

  // Solo si method = card
  @IsOptional() @IsString() cardPan?: string;
  @IsOptional() @IsString() cardExp?: string; // MM/AA
  @IsOptional() @IsString() cardCvv?: string;
  @IsOptional() @IsString() cardHolder?: string;
}