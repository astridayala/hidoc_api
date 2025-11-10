import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from './payment.entity';
import { Repository } from 'typeorm';
import { CreatePaymentsDto } from './dto/create-payments.dto';

/**
 * Servicio para gestionar los pagos
 * Proporciona metodos para crear, buscar, actualizar y eliminar los pagos
 */
@Injectable()
export class PaymentsService {
    constructor(
        @InjectRepository(Payment)
        private paymentsRepository: Repository<Payment>
    ) {}

    /**
     * Crea un nuevo pago
     * @param createPaymentsDto - DTO del pago
     * @returns El pago creado
     */
    async create(createPaymentsDto: CreatePaymentsDto): Promise<Payment> {
        const { procedureId, date, amount } = createPaymentsDto;

        // Aceptar formato YYYY/MM/DD o YYYY-MM-DD
        const parts = date.split(/[-\\/]/).map(Number);
        if (parts.length !== 3) {
            throw new Error('La fecha debe tener el formato YYYY/MM/DD o YYYY-MM-DD');
        }

        const [year, month, day] = parts;

        if (
            isNaN(year) || isNaN(month) || isNaN(day) ||
            year < 1900 || month < 1 || month > 12 || day < 1 || day > 31
        ) {
            throw new Error('La fecha contiene valores inválidos');
        }

        // Usar formato ISO (YYYY-MM-DD) para la columna date
        const isoDate = `${year.toString().padStart(4,'0')}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;

        // Normalizar monto a string con 2 decimales (la columna es numeric almacenada como string)
        const amountNum = typeof amount === 'number' ? amount : Number(amount);
        if (Number.isNaN(amountNum)) {
            throw new Error('El monto es inválido');
        }
        const amountStr = amountNum.toFixed(2);

        const newPayment = this.paymentsRepository.create({
            date: isoDate,
            amount: amountStr,
            procedure: procedureId ? ({ id: procedureId } as any) : null,
        } as any);

        const saved = await this.paymentsRepository.save(newPayment) as unknown as Payment;
        return saved;
    }
    

    /**
     * Busca todos los pagos
     * @returns Lista de pagos
     */
    async findAll(): Promise<Payment[]> {
        return this.paymentsRepository.find()
    }

    /**
     * Busca un pago por su ID
     * @param id - ID del pago
     * @returns El pago encontrado
     */
    async findOne(id: string): Promise<Payment> {
    const payment = await this.paymentsRepository.findOne({ where: { id }, relations: ['procedure'] });

        if (!payment) throw new NotFoundException(`Pago con id ${id} no encontrado`);

        return payment;
    }

    /**
     * Elimina un pago
     * @param id - ID del pago
     * @returns true si se elimina correctamente
     */
    async remove(id: string): Promise<{ message: string }> {
        const payment = await this.paymentsRepository.delete(id);

        if (payment.affected === 0) {
            throw new NotFoundException(`Pago con id ${id} no encontrado`);
        }

        return { message: `El pago con id ${id} fue eliminado correctamente` };
    }
}
