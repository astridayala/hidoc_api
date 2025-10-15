import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDate, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, Matches } from "class-validator";
import { CreateDateColumn } from "typeorm";

/**
 * DTO para la creación de pacientes
 * Define y valida los datos necesarios para crear un paciente
 */
export class CreatePatientDto {
    @ApiProperty({ example: 'Astrid Violeta', description: 'Nombres del paciente' })
    @IsString({ message: 'El nombre debe ser una cadena de texto' })
    @IsNotEmpty({ message: 'El nombre es requerido' })
    name: string;

    @ApiProperty({ example: 'Ayala Ayala', description: 'Apellidos del paciente' })
    @IsString({ message: 'El Apellido debe ser una cadena de texto' })
    @IsNotEmpty({ message: 'El Apellido es requerido' })
    lastName: string;

    @IsOptional()
    @ApiProperty({
        example: '+(503) 23568956',
        description: 'Celular del paciente en formato +(503) 23568956',
    })
    @Matches(/^\+\(503\)\s\d{8}$/, {
        message: 'El celular debe tener el formato +(503) 12345678',
    })
    phone?: string;


    @IsOptional()
    @ApiProperty({ example: 'astriayala@gmail.com', description: 'Email del paciente' })
    @IsEmail({}, { message: 'Debe proporcionar un email válido' })
    email?: string

    @ApiProperty({ example: '2000-12-31', description: 'Fecha de nacimiento (YYYY-MM-DD)' })
    @IsNotEmpty({ message: 'La fecha de nacimiento es requerida' })
    @IsDate({ message: 'La fecha de nacimiento debe ser una fecha válida' })
    @Type(() => Date)  
    birthDate: Date;

    @ApiProperty({
        example: 'femenino',
        description: 'Genero del paciente',
        enum: ['femenino', 'masculino'],
    })
    @IsEnum(['femenino', 'masculino'], { message: 'El sexo debe ser masculino o femenino' })
    @IsNotEmpty({ message: 'El sexo es requerido' })
    gender: string

    @IsOptional()
    @ApiProperty({ example: 'km 12 ½ carretera al Puerto de La Libertad, calle nueva a Comasagua, Santa Tecla, La Libertad', description: 'Dirección del paciente' })
    @IsString({ message: 'La dirección debe ser una cadena de texto' })
    address?: string
}