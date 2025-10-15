import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDate, IsNotEmpty, IsNumber, IsUUID, Matches } from "class-validator";

/**
 * DTO para la creacion de pagos
 * Define y valida los datos necesarios para crear un nuevo pago
 */
export class CreatePaymentsDto {
    @ApiProperty({
        description: 'ID del procedimiento al que pertenece el pago',
        example: '550e8400-e29b-41d4-a716-446655440000',
    })
    @IsUUID()
    @IsNotEmpty({ message: 'El procedimiento del tratamiento es requerido' })
    procedureId: string;

    @ApiProperty({ example: '2025/09/14', description: 'Fecha del pago en formato YYYY/MM/DD' })
    @IsNotEmpty({ message: 'La fecha es requerida' })
    @Matches(/^\d{4}\/\d{2}\/\d{2}$/, {
    message: 'La fecha debe tener el formato YYYY/MM/DD',
    })
    date: string;

    @ApiProperty({
        description: 'Monto del pago',
        example: 120.50,
    })
    @IsNotEmpty({ message: 'El monto del pago es requerido' })
    @IsNumber({ maxDecimalPlaces: 2 })
    amount: number;
}