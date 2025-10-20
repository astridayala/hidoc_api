import { IsOptional, IsString, IsEmail } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  // Si quieres permitir cambio de email (no recomendado)
  @IsOptional()
  @IsEmail()
  email?: string;
}
