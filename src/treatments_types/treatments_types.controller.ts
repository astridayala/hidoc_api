import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { TreatmentsTypesService } from './treatments_types.service';
import { CreateTreatmentTypesDto } from './dto/create-treatments_types.dto';

/**
 * Controlador de los tipos de tratamientos
 * Maneja endpoints para crear, obtener y eliminar tipos de tratamientos
 */
@ApiTags('treatment_types')
@ApiBearerAuth()
@Controller('treatments-types')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TreatmentsTypesController {
    constructor(private readonly treatmentsTypesService: TreatmentsTypesService) {}

    /**
     * Crea un nuevo tipo de tratamiento
     * @param createTreatmentTypesDto - Datos del tipo de tratamiento a crear
     * @returns El tipo de tratamiento creado
     */
    @Post()
    @ApiOperation({ summary: 'Crear un tipo de tratamiento' })
    @ApiResponse({ status: 201, description: 'Tipo de tratamiento creado exitosamente' })
    create(@Body() createTreatmentTypesDto: CreateTreatmentTypesDto) {
        return this.treatmentsTypesService.create(createTreatmentTypesDto)
    }

    /**
     * Obtiene todos los tipos de tratamiento
     * @returns Lista de los tipos de tratamiento
     */
    @Get()
    @ApiOperation({ summary: 'Obtener todos los tipos de tratamientos' })
    @ApiResponse({ status: 200, description: 'Lista de tipos de tratamientos' })
    findAll(){
        return this.treatmentsTypesService.findAll()
    }

    /**
     * Obtiene un tipo de tratamiento por su ID
     * @param id - ID del tipo de tratamiento a buscar
     * @returns El tipo de tratamiento encontrado
     */
    @Get(':id')
    @ApiOperation({ summary: 'Obtener el tipo de tratamiento por su ID' })
    @ApiResponse({ status: 200, description: 'Tipo de tratamiento obtenido exitosamente' })
    @ApiResponse({ status: 404, description: 'Tipo de tratamiento no encontrado' })
    findOne(@Param('id') id: string) {
        return this.treatmentsTypesService.findOne(id);
    }

    /**
     * Elimina un tipo de tratamiento existente
     * @param id - ID del tipo de tratamiento
     * @returns true si se elimino correctamente
     */
    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar un tipo de tratamiento existente' })
    @ApiResponse({ status: 200, description: 'Tipo de tratamiento eliminado exitosamente' })
    @ApiResponse({ status: 404, description: 'Tipo de tratamiento no encontrado' })
    remove(@Param('id') id: string) {
        return this.treatmentsTypesService.remove(id)
    }
}
