import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
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
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { IsISO8601, IsOptional, IsString, IsUUID } from 'class-validator';
import { Req } from '@nestjs/common';

/* ===================== DTOs ===================== */

export class CreateAppointmentDto {
  @IsUUID()
  doctorUserId: string;

  @IsISO8601()
  scheduledAt: string; // ISO string

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  note?: string;
}

export class CancelAppointmentDto {
  @IsOptional()
  @IsString()
  reason?: string;
}

/* Para Swagger de respuesta (shape simplificado y alineado a tu tabla) */
class AppointmentResponseDto {
  @ApiProperty({ example: 'b1a9c6d7-0a4b-4c0f-bef3-9e2b4e2f8a9a' })
  id: string;

  @ApiProperty({ example: 'a5f4d4c6-1c0a-4c36-8f2b-7d2f0a0be3d1' })
  patientId: string;

  @ApiProperty({ example: 'b3e8e9cb-9d02-4e3b-9d1a-6f3a0b5c1d21' })
  doctorUserId: string;

  @ApiProperty({
    example: '2025-10-23T14:00:00.000Z',
    description: 'Fecha/hora programada',
  })
  scheduledAt: string;

  @ApiProperty({
    example: 'CONFIRMED',
    enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'],
  })
  status: string;

  @ApiProperty({ example: 'Consulta general' })
  reason: string;

  @ApiProperty({ example: 'Notas internas / observaciones' })
  note: string;

  @ApiProperty({
    example: '2025-10-10T15:20:11.000Z',
    description: 'Fecha de creación',
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
      'El paciente autenticado agenda una cita con un doctor. El patientId se infiere del usuario (no viene en el body).',
  })
  @ApiBody({
    type: CreateAppointmentDto,
    examples: {
      default: {
        summary: 'Ejemplo de creación',
        value: {
          doctorUserId: 'b3e8e9cb-9d02-4e3b-9d1a-6f3a0b5c1d21',
          scheduledAt: '2025-10-23T14:00:00.000Z',
          reason: 'Chequeo',
          note: 'Traer exámenes',
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Cita creada',
    type: AppointmentResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Datos inválidos o conflicto' })
  @ApiUnauthorizedResponse({ description: 'No autenticado' })
  @ApiForbiddenResponse({ description: 'No es paciente' })
  create(@Body() dto: CreateAppointmentDto, @Req() req) {
    // req.user viene de JwtStrategy.validate()
    return this.appointmentsService.createForAuthenticatedPatient(req.user.id, dto);
  }

  /* ------------ GET /v1/appointments ------------ */
  @Get()
  @Roles(Role.Doctor)
  @ApiOperation({
    summary: 'Obtener todas las citas (doctor/auditoría)',
    description: 'Devuelve todas las citas registradas.',
  })
  @ApiOkResponse({
    description: 'Listado de citas',
    schema: { type: 'array', items: { $ref: getSchemaPath(AppointmentResponseDto) } },
  })
  findAll() {
    return this.appointmentsService.findAll();
  }

  /* ------------ GET /v1/appointments/me ------------ */
  @Get('me')
  @Roles(Role.Paciente)
  @ApiOperation({
    summary: 'Citas del paciente autenticado',
    description: 'Devuelve las citas del paciente autenticado (para Actividad Reciente).',
  })
  @ApiOkResponse({
    description: 'Listado de mis citas',
    schema: { type: 'array', items: { $ref: getSchemaPath(AppointmentResponseDto) } },
  })
  findMine(@Req() req) {
    return this.appointmentsService.findByPatientUserId(req.user.id);
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
  @ApiOkResponse({ description: 'Cita encontrada', type: AppointmentResponseDto })
  @ApiNotFoundResponse({ description: 'Cita no encontrada' })
  findOne(@Param('id') id: string) {
    return this.appointmentsService.findOne(id);
  }

  /* ------------ PATCH /v1/appointments/:id/cancel ------------ */
  @Patch(':id/cancel')
  @Roles(Role.Paciente)
  @HttpCode(200)
  @ApiOperation({
    summary: 'Cancelar una cita',
    description:
      'Cambia el estado a CANCELLED. Guarda el motivo en la nota concatenada.',
  })
  @ApiParam({ name: 'id', example: 'b1a9c6d7-0a4b-4c0f-bef3-9e2b4e2f8a9a' })
  @ApiBody({
    type: CancelAppointmentDto,
    examples: { default: { value: { reason: 'No podré asistir' } } },
  })
  @ApiOkResponse({ description: 'Cita cancelada', type: AppointmentResponseDto })
  cancel(@Param('id') id: string, @Body() body: CancelAppointmentDto, @Req() req) {
    return this.appointmentsService.cancel(id, body.reason, req.user);
  }

  /* ------------ DELETE /v1/appointments/:id ------------ */
  @Delete(':id')
  @Roles(Role.Doctor)
  @ApiOperation({
    summary: 'Elimina una cita',
    description: 'Uso reservado a doctores o administradores.',
  })
  @ApiParam({ name: 'id', example: 'b1a9c6d7-0a4b-4c0f-bef3-9e2b4e2f8a9a' })
  @ApiNoContentResponse({ description: 'Cita eliminada' })
  remove(@Param('id') id: string) {
    return this.appointmentsService.remove(id);
  }
}
