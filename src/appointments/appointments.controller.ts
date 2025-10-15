import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentsDto } from './dto/appointments.dto';

@ApiTags('appointments')
@ApiBearerAuth()
@Controller('appointments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AppointmentsController {
    constructor(private readonly appointmentsService: AppointmentsService) {}

    /**
     * Crea una nueva cita
     * @param createAppointmentsDto - Datos de las citas
     * @returns La cita creada
     */
    @Post()
    @ApiOperation({ summary: 'Crea una cita' })
    @ApiResponse({ status: 201, description: 'Cita creada exitosamente' })
    create(@Body() createAppointmentsDto: CreateAppointmentsDto) {
        return this.appointmentsService.create(createAppointmentsDto)
    }

    /**
     * Obtiene todas las citas
     * @returns Lista de citas
     */
    @Get()
    @ApiOperation({ summary: 'Obtener todas las citas' })
    @ApiResponse({ status: 200, description: 'Lista de citas' })
    findAll() {
        return this.appointmentsService.findAll()
    }

    /**
     * Obtiene la cita por su ID
     * @param id - ID de la cita
     * @returns La cita encontrada
     */
    @Get(':id')
    @ApiOperation({ summary: 'Obtiene las citas por su ID' })
    @ApiResponse({ status: 200, description: 'Cita obtenida' })
    @ApiResponse({ status: 404, description: 'Cita no encontrada' })
    findOne(@Param('id') id: string) {
        return this.appointmentsService.findOne(id)
    }

    @Get('patient/:patientId')
    @ApiOperation({ summary: 'Obtiene las citas de un paciente' })
    @ApiResponse({ status: 200, description: 'Cita obtenida' })
    @ApiResponse({ status: 404, description: 'Cita no encontrada' })
    appointmentsByPatient(@Param('patientId') patientId: string) {
        return this.appointmentsService.findByPatient(patientId);
    }

    /**
     * Elimina una cita existente
     * @param id - ID de la cita
     * @returns true si se elimino correctamente
     */
    @Delete(':id')
    @ApiOperation({ summary: 'Elimina una cita' })
    @ApiResponse({ status: 200, description: 'Cita eliminada' })
    @ApiResponse({ status: 404, description: 'Cita no encontrada' })
    remove(@Param('id') id: string) {
        return this.appointmentsService.remove(id)
    }
}
