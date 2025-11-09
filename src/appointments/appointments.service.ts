import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment, AppointmentStatus } from './appointments.entity';
import { Patient } from '../users/entities/patient.entity';
import { User } from '../users/entities/user.entity';
import { Between, Not } from 'typeorm';
import { CreateAppointmentDto } from './appointments.controller';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentsRepository: Repository<Appointment>,
    @InjectRepository(Patient)
    private readonly patientsRepository: Repository<Patient>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  /** Encuentra el Patient por userId (tu esquema actual tiene userId en patient). */
  private async findPatientByUserId(userId: string): Promise<Patient | null> {
    // Si tu Patient tiene la columna plana userId:
    const p = await this.patientsRepository.findOne({ where: { userId: userId as any } });
    return p ?? null;
  }

  /**
   * Crea una cita para el paciente autenticado:
   * - Resuelve patientId a partir del JWT (userId).
   * - Valida que doctorUserId exista y sea rol doctor.
   * - Evita conflicto exacto por scheduledAt (mismo timestamp).
   */
  async createForAuthenticatedPatient(
    userId: string,
    dto: CreateAppointmentDto,
  ): Promise<Appointment> {
    const { doctorUserId, scheduledAt, reason, note } = dto;

    const patient = await this.findPatientByUserId(userId);
    if (!patient) throw new NotFoundException('Paciente no encontrado para este usuario');

    const doctorUser = await this.usersRepository.findOne({ where: { id: doctorUserId } });
    if (!doctorUser || doctorUser.role !== 'doctor') {
      throw new BadRequestException('Doctor inválido');
    }

    const when = new Date(scheduledAt);
    if (Number.isNaN(when.getTime())) throw new BadRequestException('Fecha/hora inválida');

    // Conflicto exacto paciente+fecha
    const conflictPatient = await this.appointmentsRepository.findOne({
      where: { patientId: patient.id, scheduledAt: when },
    });
    if (conflictPatient && conflictPatient.status !== AppointmentStatus.CANCELLED) {
      throw new BadRequestException('El paciente ya tiene una cita en ese horario');
    }

    // Conflicto exacto doctor+fecha
    const conflictDoctor = await this.appointmentsRepository.findOne({
      where: { doctorUserId, scheduledAt: when },
    });
    if (conflictDoctor && conflictDoctor.status !== AppointmentStatus.CANCELLED) {
      throw new BadRequestException('El doctor no está disponible en ese horario');
    }

    const appt = this.appointmentsRepository.create({
      patientId: patient.id,
      doctorUserId,
      scheduledAt: when,
      status: AppointmentStatus.CONFIRMED, // o PENDING si luego confirmas
      reason,
      note,
    });

    return this.appointmentsRepository.save(appt);
  }

  /** Todas las citas (uso doctor/auditoría). */
  async findAll(): Promise<Appointment[]> {
    return this.appointmentsRepository.find({
      order: { scheduledAt: 'DESC' },
    });
  }

  /** Una cita por ID. */
  async findOne(id: string): Promise<Appointment> {
    const appointment = await this.appointmentsRepository.findOne({ where: { id } });
    if (!appointment) throw new NotFoundException('Cita no encontrada');
    return appointment;
  }

  /** Citas del paciente autenticado (para Actividad Reciente del Home). */
  async findByPatientUserId(userId: string): Promise<Appointment[]> {
    const patient = await this.findPatientByUserId(userId);
    if (!patient) return [];
    return this.appointmentsRepository.find({
      where: { patientId: patient.id },
      order: { scheduledAt: 'DESC' },
      take: 10,
    });
  }

  /**
   * Cancela una cita:
   * - Solo el dueño (paciente) puede cancelar, salvo que el rol sea doctor/admin.
   * - Estado -> CANCELLED; anexa el motivo en note.
   */
  async cancel(id: string, reason: string | undefined, user: any) {
    const appt = await this.findOne(id);

    if (user.role === 'paciente') {
      const myPatient = await this.findPatientByUserId(user.id);
      if (!myPatient || appt.patientId !== myPatient.id) {
        throw new ForbiddenException('No puedes cancelar citas de otro paciente');
      }
    }

    if (appt.status === AppointmentStatus.CANCELLED) return appt;

    appt.status = AppointmentStatus.CANCELLED;
    if (reason) {
      appt.note = appt.note ? `${appt.note}\nCancel reason: ${reason}` : `Cancel reason: ${reason}`;
    }

    return this.appointmentsRepository.save(appt);
  }

  /** Elimina una cita (doctor/admin). */
  async remove(id: string): Promise<{ message: string }> {
    const res = await this.appointmentsRepository.delete(id);
    if (res.affected === 0) throw new NotFoundException(`Cita con id ${id} no encontrada`);
    return { message: `La cita con id ${id} fue eliminada correctamente` };
  }
}
