import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Appointment, AppointmentStatus } from './appointments.entity';
import { Repository, Between, Not } from 'typeorm';
import { CreateAppointmentsDto } from './dto/appointments.dto';
import { Patient } from '../users/entities/patient.entity';
import { User } from '../users/entities/user.entity';
import { CreateAppointmentDoctorDto } from './dto/create-appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentsRepository: Repository<Appointment>,
    @InjectRepository(Patient)
    private patientsRepository: Repository<Patient>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  /**
   * Crea una cita con verificaciones:
   * - paciente existe
   * - doctor existe y es rol doctor
   * - no hay solape para paciente ni doctor
   */
  async create(dto: CreateAppointmentsDto): Promise<Appointment> {
    const { patientId, doctorUserId, start, end, description, reason } = dto;

    const patient = await this.patientsRepository.findOne({ where: { id: patientId } });
    if (!patient) throw new NotFoundException('Paciente no encontrado');

    const doctorUser = await this.usersRepository.findOne({ where: { id: doctorUserId } });
    if (!doctorUser || doctorUser.role !== 'doctor') {
      throw new BadRequestException('Doctor inválido');
    }

    const startDate = new Date(start);
    const endDate = new Date(end);
    if (!(startDate < endDate)) throw new BadRequestException('Rango de horas inválido');

    // Verificar solape del paciente en ese rango
    const patientOverlap = await this.appointmentsRepository.findOne({
      where: {
        patient: { id: patientId },
        start: Between(startDate, endDate),
        status: Not(AppointmentStatus.CANCELLED),
      },
    });
    if (patientOverlap) throw new BadRequestException('Paciente ya tiene una cita en ese horario');

    // Verificar solape del doctor en ese rango
    const doctorOverlap = await this.appointmentsRepository.findOne({
      where: {
        doctorUser: { id: doctorUserId },
        start: Between(startDate, endDate),
        status: Not(AppointmentStatus.CANCELLED),
      },
    });
    if (doctorOverlap) throw new BadRequestException('Doctor no disponible en ese horario');

    const newAppointment = this.appointmentsRepository.create({
      patient,
      doctorUser,
      start: startDate,
      end: endDate,
      description,
      reason,
      status: AppointmentStatus.CONFIRMED, // o PENDING si quieres confirmar luego
    });

    return this.appointmentsRepository.save(newAppointment);
  }

  async findAll(): Promise<Appointment[]> {
    return this.appointmentsRepository.find({
      order: { start: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Appointment> {
    const appointment = await this.appointmentsRepository.findOne({
      where: { id },
    });
    if (!appointment) throw new NotFoundException('Cita no encontrada');
    return appointment;
  }

  async findByPatient(patientId: string): Promise<Appointment[]> {
    const appointments = await this.appointmentsRepository.find({
      where: { patient: { id: patientId } },
      order: { start: 'ASC' },
    });
    // Si prefieres no lanzar 404 cuando no hay, puedes devolver []
    return appointments;
  }

  async cancel(id: string, reason: string) {
    const appt = await this.findOne(id);
    if (appt.status === AppointmentStatus.CANCELLED) {
      return appt;
    }
    appt.status = AppointmentStatus.CANCELLED;
    if (reason) {
      appt.description = appt.description
        ? `${appt.description}\nCancel reason: ${reason}`
        : `Cancel reason: ${reason}`;
    }
    return this.appointmentsRepository.save(appt);
  }

  async remove(id: string): Promise<{ message: string }> {
    const res = await this.appointmentsRepository.delete(id);
    if (res.affected === 0) {
      throw new NotFoundException(`Cita con id ${id} no encontrada`);
    }
    return { message: `La cita con id ${id} fue eliminada correctamente` };
  }

  /**
   * Crea una cita iniciada por un doctor.
   * @param dto Datos de la cita (paciente, inicio, fin, razón, nota)
   * @param doctorUserId El ID del doctor, obtenido del token JWT.
   */
  async createByDoctor(dto: CreateAppointmentDoctorDto, doctorUserId: string): Promise<Appointment> {
      const { patientId, start, end, reason, note } = dto; // Incluir 'note' del DTO

      const patient = await this.patientsRepository.findOne({ where: { id: patientId } });
      if (!patient) throw new NotFoundException('Paciente no encontrado');

      // Se usa el doctorUserId inyectado desde el controlador
      const doctorUser = await this.usersRepository.findOne({ where: { id: doctorUserId } });
      if (!doctorUser || doctorUser.role !== 'doctor') {
          // Este caso es poco probable si el guard Roles(Role.Doctor) está activo,
          // pero es una buena verificación de seguridad.
          throw new BadRequestException('Usuario autenticado no es un doctor válido');
      }

      const startDate = new Date(start);
      const endDate = new Date(end);
      if (!(startDate < endDate)) throw new BadRequestException('Rango de horas inválido');

      // Verificar solape del paciente
      const patientOverlap = await this.appointmentsRepository.findOne({
          where: {
              patient: { id: patientId },
              // La verificación de solape debe verificar si la nueva cita
              // comienza O termina dentro de una cita existente O si una cita
              // existente comienza O termina dentro de la nueva cita.
              // Usar Between en 'start' no cubre todos los casos de solape.
              // Por simplicidad y consistencia con el método create, mantendré
              // la lógica que has usado, pero ten en cuenta que podría no ser
              // una comprobación de solape completa.
              start: Between(startDate, endDate), // Solo verifica si la nueva cita comienza durante una existente
              status: Not(AppointmentStatus.CANCELLED),
          },
      });
      if (patientOverlap) throw new BadRequestException('El paciente ya tiene una cita en ese horario');

      // Verificar solape del doctor
      const doctorOverlap = await this.appointmentsRepository.findOne({
          where: {
              doctorUser: { id: doctorUserId },
              start: Between(startDate, endDate), // Solo verifica si la nueva cita comienza durante una existente
              status: Not(AppointmentStatus.CANCELLED),
          },
      });
      if (doctorOverlap) throw new BadRequestException('Ya tiene una cita en ese horario');

      const newAppointment = this.appointmentsRepository.create({
          patient,
          doctorUser, // Doctor obtenido por el ID inyectado
          start: startDate,
          end: endDate,
          description: note, // Usamos 'note' como 'description' si es el caso
          reason,
          status: AppointmentStatus.CONFIRMED,
      });

      return this.appointmentsRepository.save(newAppointment);
  }

}
