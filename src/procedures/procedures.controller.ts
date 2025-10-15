import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { ProceduresService } from './procedures.service';
import { CreateProcedureDto } from './dto/create-procedures.dto';

@ApiTags('procedures')
@ApiBearerAuth()
@Controller('procedures')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProceduresController {
    constructor(private readonly proceduresService: ProceduresService) {}

    /**
     * Crea un nuevo procedimiento
     * @param createProceduresDto - Datos del procedimiento
     * @returns El procedimiento creado
     */
    @Post()
    @ApiOperation({ summary: 'Crea un nuevo procedimiento' })
    @ApiResponse({ status: 201, description: 'Procedimiento creado exitosamente' })
    create(@Body() createProceduresDto: CreateProcedureDto) {
        return this.proceduresService.create(createProceduresDto)
    }

    /**
     * Obtiene todos los pagos
     * @returns Lista de los pagos
     */
    @Get()
    @ApiOperation({ summary: 'Obtener todos los procedimientos' })
    @ApiResponse({ status: 200, description: 'Lista de los procedimiento' })
    findAll() {
        return this.proceduresService.findAll()
    }

    /**
     * Obtiene el pago por su ID
     * @param id - ID del pago
     * @returns El pago encontrado
     */
    @Get(':id')
    @ApiOperation({ summary: 'Obtiene el procedimiento por su ID' })
    @ApiResponse({ status: 200, description: 'Procedimiento obtenido' })
    @ApiResponse({ status: 404, description: 'Procedimiento no encontrado' })
    findOne(@Param('id') id: string) {
        return this.proceduresService.findOne(id)
    }

    /**
     * Elimina un pago existente
     * @param id - ID del pago
     * @returns true si se elimino correctamente
     */
    @Delete(':id')
    @ApiOperation({ summary: 'Elimina un procedimiento' })
    @ApiResponse({ status: 200, description: 'Procedimiento eliminado exitosamente' })
    @ApiResponse({ status: 404, description: 'Procedimiento no encontrado' })
    remove(@Param('id') id: string) {
        return this.proceduresService.remove(id)
    }
}
