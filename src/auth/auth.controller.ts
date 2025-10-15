import { Body, Controller, HttpCode, Post, ValidationPipe } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/logindto';

/**
 * Controllador de autenticación
 * Maneja endpoints para registro y login de usuarios
 */
@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    /**
     * Endpoint para registrar un nuevo usuario
     * @param registerDto - Datos de registro del usuario
     * @returns Usuario creado y token JWT
     */
    @Post('register')
    @ApiOperation({ summary: 'Registrar un nuevo usuario' })
    @ApiResponse({ status: 201, description: 'Usuario registrado exitosamente' })
    @ApiResponse({ status: 409, description: 'El email ya está registrado' })
    async register(@Body(ValidationPipe) registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    /**
     * Endpoint para iniciar sesión
     * @param loginDto - Credenciales de login
     * @returns Usuario y token JWT
     */
    @Post('login')
    @HttpCode(200)
    @ApiOperation({ summary: 'Iniciar sesión' })
    @ApiResponse({ status:200, description: 'Loginexitoso' })
    @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
    async login (@Body(ValidationPipe) loginDto: LoginDto) {
        return this.authService.login(loginDto.email, loginDto.password)
    }
}
