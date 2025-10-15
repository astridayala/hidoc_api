import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';

/**
 * Controlador de pacientes
 * Maneja endpoints para crear, obtener y actualizar pacientes
 */
@ApiTags('patients')
@ApiBearerAuth()
@Controller('patients')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PatientsController {
    constructor(private readonly patientsService: PatientsService) {}

    /**
     * Crea un nuevo paciente
     * @param createPatientDto - Datos del paciente a crear
     * @returns El paciente creado
     */
    @Post()
    @ApiOperation({ summary: 'Crear un nuevo paciente' })
    @ApiResponse({ status: 201, description: 'Paciente creado existosamente' })
    create(@Body() createPatientDto: CreatePatientDto) {
        return this.patientsService.create(createPatientDto);
    }

    /**
     * Obtiene todos los pacientes
     * @returns Lista de todos los pacientes
     */
    @Get()
    @ApiOperation({ summary: 'Obtener todos los pacientes' })
    @ApiResponse({ status: 200, description: 'Lista de pacientes obtenida exitosamente' })
    findAll() {
        return this.patientsService.findAll();
    }

    /**
     * Obtiene un paciente por su ID
     * @param id - ID del paciente a buscar
     * @returns Datos del paciente encontrado
     */
    @Get(':id')
    @ApiOperation({ summary: 'Obtener un paciente por ID' })
    @ApiResponse({ status: 200, description: 'Paciente obtenido exitosamente' })
    @ApiResponse({ status: 404, description: 'Paciente no encontrado' })
    findOne(@Param('id') id: string) {
        return this.patientsService.findOne(id)
    }
}
