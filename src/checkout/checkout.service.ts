// src/checkout/checkout.service.ts
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Payment } from '../payments/payment.entity';
import { CheckoutConsultationDto } from './dtos/checkout-consultation.dto';

@Injectable()
export class CheckoutService {
  constructor(private readonly dataSource: DataSource) {}

  /**
   * Crea el registro en "payment" respetando tu esquema:
   * id (uuid, lo genera la DB), procedure_id, date (YYYY-MM-DD), amount, createdAt (trigger/defecto)
   */
  async checkoutConsultation(dto: CheckoutConsultationDto) {
    return this.dataSource.transaction(async (manager) => {
      // 1) Normaliza monto a number con 2 decimales
      const amountNum = Number.parseFloat(
        (dto.amount ?? 0).toString(),
      );
      if (Number.isNaN(amountNum)) {
        throw new Error('Monto inválido');
      }

      // 2) Fecha tipo 'YYYY-MM-DD' (tu columna es DATE)
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      const isoDate = `${yyyy}-${mm}-${dd}`;

      // 3) Crea el payment
      const payment = manager.create(Payment, {
        procedure: dto.procedureId ? ({ id: dto.procedureId } as any) : null,
        date: isoDate,
        amount: amountNum.toFixed(2),
      } as any);
      const saved = await manager.save(payment);

      // 4) (Opcional) Si más adelante quieres crear la cita aquí,
      // llama a tu AppointmentsService y vincula el appointmentId que te devuelva.

      // 5) Enmascara método para la respuesta
      const masked =
        dto.method === 'card'
          ? maskCard(dto.cardPan ?? '')
          : 'Tigo Money';

      return {
        paymentId: saved.id,
        appointmentId: null, // cuando integres la creación de la cita, envía el real
        maskedMethod: masked,
      };
    });
  }
}

/** Enmascara PAN mostrando solo los últimos 4 dígitos */
function maskCard(pan: string): string {
  // Deja solo dígitos
  const digits = pan.replace(/\D/g, '');
  const last4 = digits.slice(-4).padStart(4, '•');
  return `Tarjeta **** ${last4}`;
}