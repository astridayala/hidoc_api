import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
  ApiParam,
  ApiBody,
  ApiExtraModels,
  ApiProperty,
  getSchemaPath,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentsDto, CancelAppointmentDto } from './dto/appointments.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

/* ===================== DTOs para Swagger ===================== */

class AppointmentResponseDto {
  @ApiProperty({ example: 'b1a9c6d7-0a4b-4c0f-bef3-9e2b4e2f8a9a' })
  id: string;

  @ApiProperty({ example: 'b3e8e9cb-9d02-4e3b-9d1a-6f3a0b5c1d21' })
  doctorId: string;

  @ApiProperty({ example: 'a5f4d4c6-1c0a-4c36-8f2b-7d2f0a0be3d1' })
  patientId: string;

  @ApiProperty({
    example: '2025-10-23T14:00:00.000Z',
    description: 'Fecha y hora de inicio de la cita',
  })
  start: string;

  @ApiProperty({
    example: '2025-10-23T14:30:00.000Z',
    description: 'Fecha y hora de finalización de la cita',
  })
  end: string;

  @ApiProperty({ example: 'PENDING', enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'] })
  status: string;

  @ApiProperty({ example: 'Chequeo rutinario' })
  reason: string;

  @ApiProperty({
    example: '2025-10-10T15:20:11.000Z',
    description: 'Fecha de creación de la cita',
  })
  createdAt: string;
}

/* ===================== Controlador ===================== */

@ApiTags('appointments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiExtraModels(AppointmentResponseDto)
@Controller('v1/appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  /* ------------ POST /v1/appointments ------------ */
  @Post()
  @Roles(Role.Paciente)
  @ApiOperation({
    summary: 'Crea una cita',
    description:
      'Permite a un paciente agendar una cita médica con un doctor. Requiere autenticación y rol de paciente.',
  })
  @ApiBody({
    type: CreateAppointmentsDto,
    examples: {
      default: {
        summary: 'Ejemplo de creación de cita',
        value: {
          doctorId: 'b3e8e9cb-9d02-4e3b-9d1a-6f3a0b5c1d21',
          start: '2025-10-23T14:00:00.000Z',
          end: '2025-10-23T14:30:00.000Z',
          reason: 'Consulta de seguimiento',
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Cita creada exitosamente',
    type: AppointmentResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Datos inválidos o conflicto de horario' })
  @ApiUnauthorizedResponse({ description: 'Token inválido o ausente' })
  @ApiForbiddenResponse({ description: 'El usuario no tiene rol de paciente' })
  create(@Body() dto: CreateAppointmentsDto) {
    return this.appointmentsService.create(dto);
  }

  /* ------------ GET /v1/appointments ------------ */
  @Get()
  @Roles(Role.Doctor)
  @ApiOperation({
    summary: 'Obtener todas las citas (doctor/auditoría)',
    description:
      'Devuelve todas las citas registradas. Acceso restringido a doctores o roles de auditoría.',
  })
  @ApiOkResponse({
    description: 'Listado de citas',
    schema: {
      type: 'array',
      items: { $ref: getSchemaPath(AppointmentResponseDto) },
    },
  })
  @ApiForbiddenResponse({ description: 'Acceso denegado para este rol' })
  findAll() {
    return this.appointmentsService.findAll();
  }

  /* ------------ GET /v1/appointments/:id ------------ */
  @Get(':id')
  @ApiOperation({
    summary: 'Obtiene la cita por su ID',
    description: 'Devuelve la información detallada de una cita específica.',
  })
  @ApiParam({
    name: 'id',
    example: 'b1a9c6d7-0a4b-4c0f-bef3-9e2b4e2f8a9a',
    description: 'UUID de la cita',
  })
  @ApiOkResponse({
    description: 'Cita encontrada',
    type: AppointmentResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Cita no encontrada' })
  findOne(@Param('id') id: string) {
    return this.appointmentsService.findOne(id);
  }

  /* ------------ GET /v1/appointments/patient/:patientId ------------ */
  @Get('patient/:patientId')
  @Roles(Role.Paciente)
  @ApiOperation({
    summary: 'Obtiene las citas de un paciente',
    description:
      'Devuelve el historial de citas de un paciente autenticado o con permisos. Acceso restringido a rol de paciente.',
  })
  @ApiParam({
    name: 'patientId',
    example: 'a5f4d4c6-1c0a-4c36-8f2b-7d2f0a0be3d1',
    description: 'ID del paciente',
  })
  @ApiOkResponse({
    description: 'Listado de citas del paciente',
    schema: {
      type: 'array',
      items: { $ref: getSchemaPath(AppointmentResponseDto) },
    },
  })
  @ApiForbiddenResponse({ description: 'No autorizado a consultar citas de otro paciente' })
  appointmentsByPatient(@Param('patientId') patientId: string) {
    return this.appointmentsService.findByPatient(patientId);
  }

  /* ------------ PATCH /v1/appointments/:id/cancel ------------ */
  @Patch(':id/cancel')
  @Roles(Role.Paciente)
  @HttpCode(200)
  @ApiOperation({
    summary: 'Cancelar una cita',
    description:
      'Permite que un paciente cancele una cita activa indicando la razón. No elimina el registro, solo cambia su estado.',
  })
  @ApiParam({
    name: 'id',
    example: 'b1a9c6d7-0a4b-4c0f-bef3-9e2b4e2f8a9a',
    description: 'UUID de la cita',
  })
  @ApiBody({
    type: CancelAppointmentDto,
    examples: {
      default: {
        summary: 'Ejemplo de cancelación',
        value: { reason: 'Ya no puedo asistir a la hora indicada' },
      },
    },
  })
  @ApiOkResponse({
    description: 'Cita cancelada correctamente',
    type: AppointmentResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Cita ya cancelada o completada' })
  @ApiForbiddenResponse({ description: 'El usuario no tiene permiso para cancelar esta cita' })
  cancel(@Param('id') id: string, @Body() body: CancelAppointmentDto) {
    return this.appointmentsService.cancel(id, body.reason);
  }

  /* ------------ DELETE /v1/appointments/:id ------------ */
  @Delete(':id')
  @Roles(Role.Doctor)
  @ApiOperation({
    summary: 'Elimina una cita',
    description:
      'Permite eliminar una cita del sistema (uso reservado a doctores o administradores).',
  })
  @ApiParam({
    name: 'id',
    example: 'b1a9c6d7-0a4b-4c0f-bef3-9e2b4e2f8a9a',
    description: 'UUID de la cita',
  })
  @ApiNoContentResponse({ description: 'Cita eliminada correctamente' })
  @ApiForbiddenResponse({ description: 'Solo doctores o administradores pueden eliminar citas' })
  remove(@Param('id') id: string) {
    return this.appointmentsService.remove(id);
  }
} 