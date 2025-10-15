import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { TreatmentsService } from './treatments.service';
import { CreateTreatmentDto } from './dto/create-treatment.dto';

@ApiTags('treatments')
@ApiBearerAuth()
@Controller('treatments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TreatmentsController {
    constructor(private readonly treatmentsService: TreatmentsService) {}

    /**
     * Crea un nuevo tratamiento
     * @param createTreatmentDto - Datos de los tratamientos
     * @returns El tratamiento creado
     */
    @Post()
    @ApiOperation({ summary: 'Crea un tratamiento' })
    @ApiResponse({ status: 201, description: 'Tratamiento creado exitosamente' })
    create(@Body() createTreatmentDto: CreateTreatmentDto) {
        return this.treatmentsService.create(createTreatmentDto)
    }

    /**
     * Obtiene todos los tratamiento
     * @returns Lista de tratamientos
     */
    @Get()
    @ApiOperation({ summary: 'Obtener todos los tratamientos' })
    @ApiResponse({ status: 200, description: 'Lista de tratamientos' })
    findAll() {
        return this.treatmentsService.findAll()
    }

    /**
     * Obtiene el tratamiento por su ID
     * @param id - ID del tratamiento
     * @returns El tratamiento encontrado
     */
    @Get(':id')
    @ApiOperation({ summary: 'Obtiene los tratamientos por su ID' })
    @ApiResponse({ status: 200, description: 'Tratamiento obtenido' })
    @ApiResponse({ status: 404, description: 'Tratamiento no encontrado' })
    findOne(@Param('id') id: string) {
        return this.treatmentsService.findOne(id)
    }

    /**
     * Elimina un tratamiento existente
     * @param id - ID del tratamiento
     * @returns true si se elimino correctamente
     */
    @Delete(':id')
    @ApiOperation({ summary: 'Elimina un tratamiento' })
    @ApiResponse({ status: 200, description: 'Tratamiento eliminado exitosamente' })
    @ApiResponse({ status: 404, description: 'Tratamiento no encontrado' })
    remove(@Param('id') id: string) {
        return this.treatmentsService.remove(id)
    }
}
