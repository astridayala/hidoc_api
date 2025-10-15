import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { ConditionsService } from './conditions.service';
import { CreateConditionDto } from './dto/create-condition.dto';

/**
 * Controlador de los padecimientos
 * Maneja endpoints para crear, obtener y eliminar padecimientos
 */
@ApiTags('conditions')
@ApiBearerAuth()
@Controller('conditions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ConditionsController {
    constructor(private readonly conditionsService: ConditionsService) {}

    /**
     * Crea un nuevo padecimiento
     * @param createConditionDto - Datos del padecimiento a crear
     * @returns El padecimiento creado
     */
    @Post()
    @ApiOperation({ summary: 'Crear un padecimiento' })
    @ApiResponse({ status: 201, description: 'Padecimiento creado exitosamente' })
    create(@Body() createConditionDto: CreateConditionDto) {
        return this.conditionsService.create(createConditionDto)
    }

    /**
     * Obtiene todos los padecimiento
     * @returns Lista de padecimientos
     */
    @Get()
    @ApiOperation({ summary: 'Obtener todos los padecimientos' })
    @ApiResponse({ status: 200, description: 'Lista de padecimientos obtenida exitosamente' })
    findAll(){
        return this.conditionsService.findAll();
    }

    /**
     * Obtiene un padecimiento por su ID
     * @param id - ID del padecimiento a buscar
     * @returns El padecimiento encontrado
     */
    @Get(':id')
    @ApiOperation({ summary: 'Obtener el padecimiento por ID' })
    @ApiResponse({ status: 200, description: 'Padecimiento obtenido exitosamente' })
    @ApiResponse({ status: 404, description: 'Padecimiento no encontrado' })
    findOne(@Param('id') id: string) {
        return this.conditionsService.finOne(id);
    }

    /**
     * Elimina un padecimiento existente
     * @param id - ID del padecimiento a eliminar
     * @returns true si se elimino correctamente
     */
    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar un padecimiento existente' })
    @ApiResponse({ status: 200, description: 'Padecimiento eliminado exitosamente' })
    @ApiResponse({ status: 404, description: 'Padecimiento no encontrado' })
    remove(@Param('id') id: string) {
        return this.conditionsService.remove(id)
    }
}
