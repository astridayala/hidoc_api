import { Body, Controller, HttpCode, Post, ValidationPipe, UseGuards, Req } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/logindto';
import { JwtAuthGuard } from './jwt-auth.guard';

/**
 * Controlador de autenticación
 * Maneja endpoints para registro, login y logout de usuarios
 */
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * Endpoint para registrar un nuevo usuario
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
   */
  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiResponse({ status: 200, description: 'Login exitoso' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  async login(@Body(ValidationPipe) loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  /**
   * Endpoint para cerrar sesión
   * Invalida el token JWT activo (por ejemplo, agregándolo a una lista negra o expirándolo del lado del cliente)
   */
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiOperation({ summary: 'Cerrar sesión del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Sesión cerrada exitosamente' })
  @ApiResponse({ status: 401, description: 'Token inválido o no provisto' })
  async logout(@Req() req) {
    const userId = req.user?.id;
    await this.authService.logout(userId);
    return { message: 'Sesión cerrada exitosamente' };
  }
}