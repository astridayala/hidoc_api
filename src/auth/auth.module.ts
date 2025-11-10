import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';

// Si NO tienes UsersModule, deja UsersService aquí como en tu versión actual
import { UsersService } from '../users/users.service';

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => {
        // Usa número (segundos). Si en .env pones "900" se parsea a 900.
        const exp = Number(cfg.get('JWT_EXPIRES_IN') ?? 900); // 900 seg = 15 min
        return {
          secret: cfg.get<string>('JWT_SECRET') ?? 'dev-access-secret',
          signOptions: { expiresIn: exp },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    // Quita esta línea si importas UsersModule y lo exporta:
    UsersService,
  ],
  exports: [
    JwtModule,
    PassportModule,
    AuthService,
  ],
})
export class AuthModule {}