import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
  import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto, UserRoleApi } from './dto/register.dto';
import { ConfigService } from '@nestjs/config';

type JwtPair = {
  access_token: string;
  refresh_token: string;
};

type PublicUser = {
  id: string;
  email: string;
  name: string; // tu tabla usa "name"
  role: 'DOCTOR' | 'PATIENT' | 'ADMIN';
  professionalId?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  specialty?: string | null;
};

// ====== MAPEO ROLES API ⇄ BD ======
type DbRole = 'doctor' | 'paciente' | 'admin';

const apiToDbRole = (r: UserRoleApi | string): DbRole => {
  const up = String(r).toUpperCase();
  if (up === 'DOCTOR') return 'doctor';
  if (up === 'ADMIN') return 'admin';
  return 'paciente'; // default
};

const dbToApiRole = (r: string): 'DOCTOR' | 'PATIENT' | 'ADMIN' => {
  if (r === 'doctor') return 'DOCTOR';
  if (r === 'paciente') return 'PATIENT';
  if (r === 'admin') return 'ADMIN';
  return r.toUpperCase() as any;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  /** Registro de usuario */
  async register(registerDto: RegisterDto): Promise<{ user: PublicUser } & JwtPair> {
    const existing = await this.usersService.findByEmail(registerDto.email);
    if (existing) throw new ConflictException('El email ya está registrado');

    const hash = await bcrypt.hash(registerDto.password, 12);

    // 🔒 Mapeo API → BD AQUÍ
    const dbRole = apiToDbRole(registerDto.role);

    const created = await this.usersService.create({
        name: registerDto.fullName,
        email: registerDto.email,
        password: hash,
        role: dbRole,
        ...(dbRole === 'doctor'
            ? { professionalId: registerDto.professionalId ?? null }
            : {}),
        });



    const safeUser = this.toPublicUser(created);
    const tokens = this.issueTokens(safeUser);
    return { user: safeUser, ...tokens };
  }

  /** Login */
  async login(email: string, password: string): Promise<{ user: PublicUser } & JwtPair> {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Credenciales inválidas');

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) throw new UnauthorizedException('Credenciales inválidas');

    const safeUser = this.toPublicUser(user);
    const tokens = this.issueTokens(safeUser);
    return { user: safeUser, ...tokens };
  }

  /** Perfil */
  async me(userId: string): Promise<PublicUser> {
    const user = await this.usersService.findOne(userId);
    return this.toPublicUser(user);
  }

  /** Refresh stateless */
  async refresh(refreshToken: string): Promise<JwtPair> {
    try {
      const secret = this.config.get<string>('JWT_SECRET', 'dev-access-secret');
      const payload = this.jwt.verify(refreshToken, { secret }); 
      const user = await this.usersService.findOne(payload.sub);
      const safeUser = this.toPublicUser(user);
      return this.issueTokens(safeUser);
    } catch (e) {
      // Deja claro el error como 401
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }
  }


  /** Logout: placeholder */
  async logout(_userId: string): Promise<{ success: true }> {
    return { success: true };
  }

  // ==========================
  // Helpers
  // ==========================

  private toPublicUser(u: any): PublicUser {
    return {
      id: u.id,
      email: u.email,
      name: u.name,
      role: dbToApiRole(u.role), // 👈 BD→API
      professionalId: u.professionalId ?? null,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    };
  }

  private issueTokens(user: PublicUser): JwtPair {
    const accessExpSec  = Number(this.config.get('JWT_EXPIRES_IN') ?? 900);       // 15 min
    const refreshExpSec = Number(this.config.get('JWT_REFRESH_EXPIRES_IN') ?? 604800); // 7 días

    const access_token = this.jwt.sign(
      { sub: user.id, role: user.role, email: user.email },
      { expiresIn: accessExpSec },
    );

    const refresh_token = this.jwt.sign(
      { sub: user.id },
      { expiresIn: refreshExpSec },
    );

    return { access_token, refresh_token };
  }
}