import { Controller, Get, UseGuards, Request, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UsersService } from './users.service';
import { Roles } from 'src/common/decorators/roles.decorator';

/**
 * Controlador de usuarios
 * Maneja endpoints para obtener información de usuarios
 */
@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
    constructor(private usersService: UsersService) {}

    /**
     * Obtiene el perfil del usuario autenticado
     * @param req - Request con información del usuario autenticado
     * @returns Datos del usuario autenticado
     */
    @Get('profile')
    @ApiOperation({ summary: 'Obtener perfil del usuario autenticado' })
    @ApiResponse({status: 200, description: 'Perfil obtenido exitosamente' })
    getProfile(@Request() req) {
        return req.user;
    }

    /**
     * Obtiene todos los usuarios (solo para administradores)
     * @returns Lista de todos los usuarios
     */
    @Get()
    @Roles('admin')
    @ApiOperation({ summary: 'Obtener todos los usuario (solo admin)' })
    @ApiResponse({ status: 200, description: 'Lista de usuarios obtenida exitosamente' })
    @ApiResponse({ status: 403, description: 'Acceso denegado' })
    findAll() {
        return this.usersService.findAll();
    }

    /**
     * Obtiene un usuario por su ID (solo para administradores)
     * @param id - ID del usuario a buscar
     * @returns Datos del usuario encontradp
     */
    @Get(':id')
    @Roles('admin')
    @ApiOperation({ summary: 'Obtener un usuario por ID (solo admin)' })
    @ApiResponse({ status: 200, description: 'Usuario obtenido exitosamente' })
    @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
    @ApiResponse({ status: 403, description: 'Acceso denegado' })
    findOne(@Param('id') id: string) {
        return this.usersService.findOne(id);
    }
}
