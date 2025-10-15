import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { TreatmentStatusesService } from './treatment_statuses.service';
import { CreateTreatmentStatusDto } from './dto/create-treatment_statuses.dto';

@ApiTags('treatment_statuses')
@ApiBearerAuth()
@Controller('treatment-statuses')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class TreatmentStatusesController {
    constructor(private readonly treatmentStatusesService: TreatmentStatusesService) {}

    /**
     * Crea un nuevo estado del tratamiento
     * @param createTreatmentStatusDto - Datos de los estados del tratamiento a crear
     * @returns El estado de tratamiento creado
     */
    @Post()
    @ApiOperation({ summary: 'Crear un estado de tratamiento' })
    @ApiResponse({ status: 201, description: 'Estado de tratamiento creado exitosamente' })
    create(@Body() createTreatmentStatusDto: CreateTreatmentStatusDto) {
        return this.treatmentStatusesService.create(createTreatmentStatusDto)
    }

    /**
     * Obtiene todos los tipos de tratamiento
     * @returns Lista de los estados de tratamiento
     */
    @Get()
    @ApiOperation({ summary: 'Obtener todos los estados de tratamiento' })
    @ApiResponse({ status: 200, description: 'Lista de los estados de tratamiento' })
    findAll() {
        return this.treatmentStatusesService.findAll()
    }

    /**
     * Obtiene un estado de tratamiento por su ID
     * @param id - ID del estado de tratamiento a buscar
     * @returns El estado de tratamiento encontrado
     */
    @Get(':id')
    @ApiOperation({ summary: 'Obtener los estados de tratamiento por su ID' })
    @ApiResponse({ status: 200, description: 'Estado de tratamiento obtenido' })
    @ApiResponse({ status: 404, description: 'Estado de tratamiento no encontrado' })
    findOne(@Param('id') id: string) {
        return this.treatmentStatusesService.findOne(id)
    }

    /**
     * Elimina un estado de tratamiento existente
     * @param id - ID del estado de tratamiento
     * @returns true si se elimino correctamente
     */
    @Delete(':id')
    @ApiOperation({ summary: 'Elimina un estado de tratamiento' })
    @ApiResponse({ status: 200, description: 'Estado de tratamiento eliminado exitosamente' })
    @ApiResponse({ status: 404, description: 'Estado de tratamiento no encontrado' })
    remove(@Param('id') id: string) {
        return this.treatmentStatusesService.remove(id)
    }
}
