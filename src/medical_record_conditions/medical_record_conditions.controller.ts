import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { MedicalRecordConditionsService } from './medical_record_conditions.service';
import { CreateMedicalRecordConditionDto } from './dto/create-medical_record_condition.dto';

@ApiTags('medical_record_conditions')
@ApiBearerAuth()
@Controller('medical-record-conditions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MedicalRecordConditionsController {
    constructor(private readonly medicalRecordConditionService: MedicalRecordConditionsService) {}

    /**
     * Crea una relacion entre historial medico y condicion
     * @param createMedicalRecordConditionDto - Datos de la relacion entre historial y condicion
     * @returns Relacion entre historial y condicion
     */
    @Post()
    @ApiOperation({ summary: 'Crear relacion entre historial medico y condicion' })
    @ApiResponse({ status: 201, description: 'Relacion entre historial medico y condicion' })
    create(@Body() createMedicalRecordConditionDto: CreateMedicalRecordConditionDto) {
        return this.medicalRecordConditionService.create(createMedicalRecordConditionDto)
    }

    /**
     * Obtiene todas las relaciones entre historial y condicion
     * @returns Lista de las relaciones
     */
    @Get()
    @ApiOperation({ summary: 'Obtiene todas las relaciones entre historial y condicion' })
    @ApiResponse({ status: 200, description: 'Lista de las relaciones' })
    findAll() {
        return this.medicalRecordConditionService.findAll()
    }

    /**
     * Obtiene una relacion por su ID
     * @param id - ID de la relacion entre historial y condicion
     * @returns La relacion entre historial y condicion
     */
    @Get(':id')
    @ApiOperation({ summary: 'Obtiene la relacion entre historial y condicion' })
    @ApiResponse({ status: 200, description: 'Relacion entre historial y condicion obtenida' })
    @ApiResponse({ status: 404, description: 'Relacion entre historial y condicion no encontrada' })
    findOne(@Param('id') id: string) {
        return this.medicalRecordConditionService.findOne(id)
    }

    /**
     * Elimina la relacion entre historial y condicion
     * @param id - ID de la relacion entre historial y condicion
     * @returns La relacion entre historial y condicion
     */
    @Delete(':id')
    @ApiOperation({ summary: 'Elimina la relacion entre historial y condicion' })
    @ApiResponse({ status: 200, description: 'Relacion entre historial y condicion eliminada exitosamente' })
    @ApiResponse({ status: 404, description: 'Relacion entre historial y condicion no encontrada' })
    remove(@Param('id') id: string) {
        return this.medicalRecordConditionService.remove(id)
    }
}
