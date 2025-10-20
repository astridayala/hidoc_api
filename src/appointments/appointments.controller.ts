import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentsDto, CancelAppointmentDto } from './dto/appointments.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('appointments')
@ApiBearerAuth()
@Controller('v1/appointments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  /** Paciente agenda cita */
  @Post()
  @Roles(Role.Paciente) // si manejas roles en guards
  @ApiOperation({ summary: 'Crea una cita' })
  @ApiResponse({ status: 201, description: 'Cita creada exitosamente' })
  create(@Body() dto: CreateAppointmentsDto) {
    return this.appointmentsService.create(dto);
  }

  /** ADMIN/Doctor podrían listar todo; si no tienes admin, déjalo abierto a doctor para auditoría */
  @Get()
  @Roles(Role.Doctor)
  @ApiOperation({ summary: 'Obtener todas las citas (doctor/auditoría)' })
  findAll() {
    return this.appointmentsService.findAll();
  }

  /** Consulta puntual (ambos roles) */
  @Get(':id')
  @ApiOperation({ summary: 'Obtiene la cita por su ID' })
  findOne(@Param('id') id: string) {
    return this.appointmentsService.findOne(id);
  }

  /** Citas por paciente (rol paciente o doctor con permiso) */
  @Get('patient/:patientId')
  @Roles(Role.Paciente)
  @ApiOperation({ summary: 'Obtiene las citas de un paciente' })
  appointmentsByPatient(@Param('patientId') patientId: string) {
    return this.appointmentsService.findByPatient(patientId);
  }

  /** Cancelar cita (paciente) */
  @Patch(':id/cancel')
  @Roles(Role.Paciente)
  @HttpCode(200)
  @ApiOperation({ summary: 'Cancelar una cita' })
  cancel(@Param('id') id: string, @Body() body: CancelAppointmentDto) {
    return this.appointmentsService.cancel(id, body.reason);
  }

  /** Eliminar (opcional: solo admin/doctor) */
  @Delete(':id')
  @Roles(Role.Doctor)
  @ApiOperation({ summary: 'Elimina una cita' })
  remove(@Param('id') id: string) {
    return this.appointmentsService.remove(id);
  }
}