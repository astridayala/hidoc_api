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

        const [year, month, day] = date.split('/').map(Number);

        if (
            isNaN(year) || isNaN(month) || isNaN(day) ||
            year < 1900 || month < 1 || month > 12 || day < 1 || day > 31
        ) {
            throw new Error('La fecha contiene valores inválidos');
        }

        const paymentDate = new Date(year, month - 1, day);

        const newPayment = this.paymentsRepository.create({
            date: paymentDate,
            amount,
            procedure: { id: procedureId }
        });

        return this.paymentsRepository.save(newPayment);
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
        const payment = await this.paymentsRepository.findOne({
            where: { id },
            relations: ['procedure']
        });

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
