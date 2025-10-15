import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard para autenticación JWT
 * Verifica que las peticiones incluyan un token JWT válido
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
