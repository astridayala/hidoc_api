import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';

/**const dbToApiRole = (r: string): 'DOCTOR' | 'PATIENT' | 'ADMIN' => {
  if (r === 'doctor') return 'DOCTOR';
  if (r === 'paciente') return 'PATIENT';
  if (r === 'admin') return 'ADMIN';
  return r.toUpperCase() as any;
};*/

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET', 'dev-access-secret'),
    });
  }

  async validate(payload: any) {
    const user = await this.usersService.findOne(payload.sub);
    if (!user) throw new UnauthorizedException('Usuario no encontrado');
    //return { id: user.id, email: user.email, role: dbToApiRole(user.role), };
    return { id: user.id, email: user.email, role: user.role, };
  }
}