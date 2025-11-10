import { Body, Controller, Post, UseGuards, Request, Get, Query } from '@nestjs/common';
import { 
  ApiBearerAuth, 
  ApiBody, 
  ApiCreatedResponse, 
  ApiForbiddenResponse, 
  ApiOperation, 
  ApiTags,
  ApiOkResponse, 
  ApiQuery 
} from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { CreateCitaDoctorDto, GetCitasByDayDto } from './dto/create-cita.dto';
import { CitasService } from './citas.service';
import { CitaDoctor } from './citas.entity';

@ApiTags('cita-doctor')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard) 
@Controller('cita-doctor')
export class CitasController {
  constructor(private readonly citaService: CitasService) {}
    
    @Post('doctor')
    @Roles(Role.Doctor) 
    @ApiOperation({
        summary: 'Permite al doctor crear una cita',
        description: 'El doctor crea una cita para un paciente. El doctor se toma del token JWT.',
    })
    @ApiBody({ type: CreateCitaDoctorDto })
    @ApiCreatedResponse({ description: 'Cita creada exitosamente por el doctor', type: CitaDoctor })
    @ApiForbiddenResponse({ description: 'Solo doctores pueden usar este endpoint' })
    createByDoctor(
        @Body() dto: CreateCitaDoctorDto, 
        @Request() req, // Para obtener el usuario del token
    ) {
        // Esta línea es la que toma el ID del doctor de la sesión (token)
        const doctorUserId = req.user.id; 
        return this.citaService.createByDoctor(dto, doctorUserId);
    }

    
    @Get('doctor/all')
    @Roles(Role.Doctor)
    @ApiOperation({ summary: 'Obtiene todas las citas (no canceladas) del doctor logueado' })
    @ApiOkResponse({ 
      description: 'Lista de todas las citas del doctor.',
      type: [CitaDoctor] // Indica que devuelve un array de CitaDoctor
    })
    @ApiForbiddenResponse({ description: 'Solo doctores pueden usar este endpoint' })
    getAllByDoctor(
      @Request() req,
    ) {
      const doctorUserId = req.user.id;
      return this.citaService.getAllByDoctor(doctorUserId);
    }

    /**
     * Endpoint para obtener las citas de UN DÍA específico
     */
    @Get('doctor/by-day')
    @Roles(Role.Doctor)
    @ApiOperation({ summary: 'Obtiene las citas del doctor logueado para un día específico' })
    @ApiQuery({ name: 'date', description: 'Fecha en formato YYYY-MM-DD', type: String, example: '2025-11-10' })
    @ApiOkResponse({ 
      description: 'Lista de citas del doctor para el día especificado.',
      type: [CitaDoctor] 
    })
    @ApiForbiddenResponse({ description: 'Solo doctores pueden usar este endpoint' })
    getByDay(
      @Request() req,
      @Query() query: GetCitasByDayDto, // Usamos el DTO para validar el query
    ) {
      const doctorUserId = req.user.id;
      return this.citaService.getByDay(doctorUserId, query.date);
    }
}