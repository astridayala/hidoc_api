import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
// Imports añadidos para los nuevos queries
import { Repository, MoreThanOrEqual, LessThan, Not } from 'typeorm';
import { AppointmentStatus } from '../appointments/appointments.entity';
// Asumo que 'Patient' es la entidad correcta, aunque en tu UsersService
// usas una tabla "patient" con 'p'. Si esta ruta es incorrecta, ajústala.
import { Patient } from 'src/patients/patient.old.entity'; 
import { User } from '../users/entities/user.entity';
import { CreateCitaDoctorDto } from './dto/create-cita.dto';
import { CitaDoctor } from './citas.entity';

@Injectable()
export class CitasService {
  constructor(
    @InjectRepository(CitaDoctor)
    private readonly citaRepository: Repository<CitaDoctor>,

    @InjectRepository(Patient)
    private readonly patientsRepository: Repository<Patient>,

    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  /**
   * Crea una cita iniciada por un doctor. (Tu código original, que está correcto)
   * @param dto Datos de la cita (paciente, inicio, fin, razón, nota)
   * @param doctorUserId El ID del doctor, obtenido del token JWT.
   */
  async createByDoctor(
    dto: CreateCitaDoctorDto,
    doctorUserId: string,
  ): Promise<CitaDoctor> {
    const { patientId, start, end, reason, note } = dto;

    // 1. Validar existencia del paciente
    const patient = await this.patientsRepository.findOne({ where: { id: patientId } });
    if (!patient) {
      throw new NotFoundException('Paciente no encontrado');
    }

    // 2. Validar existencia y rol del doctor
    const doctorUser = await this.usersRepository.findOne({ where: { id: doctorUserId } });
    
    // Tu entidad User usa UserRole.Doctor, que es el string 'doctor'
    if (!doctorUser || doctorUser.role !== 'doctor') {
      throw new BadRequestException('Usuario autenticado no es un doctor válido');
    }

    // 3. Validar rango horario
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (!(startDate < endDate)) {
      throw new BadRequestException('Rango de horas inválido (el inicio debe ser anterior al fin)');
    }

    // 4. Verificación de solapamiento robusta
    const overlapQuery = this.citaRepository
      .createQueryBuilder('appointment')
      .where('appointment.status != :cancelled', { cancelled: AppointmentStatus.CANCELLED })
      .andWhere('appointment.start < :newEnd AND appointment.end > :newStart', {
        newStart: startDate,
        newEnd: endDate,
      });

    // Verificar solape del doctor
    const doctorConflict = await overlapQuery
      .clone()
      .andWhere('appointment.doctorUserId = :doctorId', { doctorId: doctorUserId })
      .getOne();

    if (doctorConflict) {
      throw new BadRequestException('El doctor ya tiene una cita en ese horario');
    }

    // Verificar solape del paciente
    const patientConflict = await overlapQuery
      .clone()
      .andWhere('appointment.patientId = :patId', { patId: patientId })
      .getOne();

    if (patientConflict) {
      throw new BadRequestException('El paciente ya tiene una cita en ese horario');
    }

    // 5. Crear la cita (Versión única y correcta)
    const newCita = this.citaRepository.create({
      patientId: patient.id,
      doctorUserId: doctorUser.id, 
      start: startDate,
      end: endDate,
      reason,
      note,
      status: AppointmentStatus.CONFIRMED,
    });

    // 6. Guardar la cita y devolverla
    return this.citaRepository.save(newCita);
  }

  /**
   * Obtiene TODAS las citas (no canceladas) del doctor autenticado.
   * @param doctorUserId ID del doctor (obtenido del token)
   */
  async getAllByDoctor(doctorUserId: string): Promise<CitaDoctor[]> {
    return this.citaRepository.find({
      where: {
        doctorUserId: doctorUserId,
        status: Not(AppointmentStatus.CANCELLED), // Excluir canceladas
      },
      relations: ['patient'], // Cargar datos del paciente
      order: { start: 'DESC' }, // Ordenar por fecha (DESC o ASC)
    });
  }

  /**
   * Obtiene las citas del doctor que INICIAN en un día específico.
   * @param doctorUserId ID del doctor (obtenido del token)
   * @param dateString Fecha en formato 'YYYY-MM-DD'
   */
  async getByDay(doctorUserId: string, dateString: string): Promise<CitaDoctor[]> {
    // Validar formato YYYY-MM-DD
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        throw new BadRequestException('Formato de fecha inválido. Usar YYYY-MM-DD');
    }

    // Convertir YYYY-MM-DD a un rango de 24h en UTC
    const [year, month, day] = dateString.split('-').map(Number);
    
    // Inicio del día (00:00:00 UTC)
    const startOfDay = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
    
    // Fin del día (el inicio del siguiente día, 00:00:00 UTC)
    const endOfDay = new Date(startOfDay);
    endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);

    return this.citaRepository.find({
      where: {
        doctorUserId: doctorUserId,
        status: Not(AppointmentStatus.CANCELLED),
        start: MoreThanOrEqual(startOfDay), 
        end: LessThan(endOfDay),        
      },
      relations: ['patient'], 
      order: { start: 'ASC' }, 
    });
  }
}