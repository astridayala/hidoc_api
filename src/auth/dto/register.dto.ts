import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

/**
 * DTO para registro de usuarios
 * Define y valida los datos necesarios para registrar un usuario
 */
export class RegisterDto {
    @ApiProperty( { example: 'usuario@ejemplo.com', description: 'Email del usuario' })
    @IsEmail({}, { message: 'Debe proporcionar un email válido'})
    @IsNotEmpty( {message: 'El email es requerido'} )
    email: string

    @ApiProperty({ example: 'Juan Pérez', description: 'Nombre completo del usuario' })
    @IsString({ message: 'El nombre debe ser una cadena de texto' })
    @IsNotEmpty({ message: 'El nombre es requerido' })
    name: string;

    @ApiProperty({ example: 'Contraseña123', description: 'Contraseña del usuario' })
    @IsString({ message: 'La contraseña debe ser una cadena de texto' })
    @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
    @IsNotEmpty({ message: 'La contraseña es requerida' })
    password: string;
}