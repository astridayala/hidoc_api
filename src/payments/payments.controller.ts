import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { PaymentsService } from './payments.service';
import { CreatePaymentsDto } from './dto/create-payments.dto';

@ApiTags('payments')
@ApiBearerAuth()
@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) {}

    /**
     * Crea un nuevo pago
     * @param createPaymentsDto - Datos de los pagos
     * @returns El pago creado
     */
    @Post()
    @ApiOperation({ summary: 'Crea un nuevo pago' })
    @ApiResponse({ status: 201, description: 'Pago creado exitosamente' })
    create(@Body() createPaymentsDto: CreatePaymentsDto) {
        return this.paymentsService.create(createPaymentsDto)
    }

    /**
     * Obtiene todos los pagos
     * @returns Lista de los pagos
     */
    @Get()
    @ApiOperation({ summary: 'Obtener todos los pagos' })
    @ApiResponse({ status: 200, description: 'Lista de los pagos' })
    findAll() {
        return this.paymentsService.findAll()
    }

    /**
     * Obtiene el pago por su ID
     * @param id - ID del pago
     * @returns El pago encontrado
     */
    @Get(':id')
    @ApiOperation({ summary: 'Obtiene el pago por su ID' })
    @ApiResponse({ status: 200, description: 'Pago obtenido' })
    @ApiResponse({ status: 404, description: 'Pago no encontrado' })
    findOne(@Param('id') id: string) {
        return this.paymentsService.findOne(id)
    }

    /**
     * Elimina un pago existente
     * @param id - ID del pago
     * @returns true si se elimino correctamente
     */
    @Delete(':id')
    @ApiOperation({ summary: 'Elimina un tratamiento' })
    @ApiResponse({ status: 200, description: 'Pago eliminado exitosamente' })
    @ApiResponse({ status: 404, description: 'Pago no encontrado' })
    remove(@Param('id') id: string) {
        return this.paymentsService.remove(id)
    }
}
