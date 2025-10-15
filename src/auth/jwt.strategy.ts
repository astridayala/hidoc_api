import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';

/**
 * Estrategia JWT para autenticación
 * Verifica y decodifica tokens JWT para autenticar usuarios
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET', 'astri'),
    });
  }

  /**
   * Método de validación ejecutado cuando se verifica un token JWT
   * @param payload - Contenido decodificado del token JWT
   * @returns El usuario autenticado si es válido
   */
  async validate(payload: any) {
    const user = await this.usersService.findOne(payload.sub);
    
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }
    
    return user;
  }
}
