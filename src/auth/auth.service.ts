import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
/**
 * Servicio de autenticación
 * Maneja el registro, login y generación de tokens JWT
 */
@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService, 
    ) {}

    /**
     * Valida las credenciales de un usuario
     * @param email - Email del usuario
     * @param password - Contraseña del usuario
     * @returns El usuario si las credenciales son válidas
     */
    async validateUser(email: string, password: string): Promise<any> {
        const user = await this.usersService.findByEmail(email);

        if (user && await bcrypt.compare(password, user.password)) {
            const { password, ...result } = user;
            return result;
        }

        return null;
    }

    /**
     * Registra un nuevo usuario en el sistema
     * @param userData - Datos del usuario a registrar
     * @returns El usuario creado y un token JWT
     */
    async register(userData: Partial<User>) {
        // Verifica si ya existe un usuario con el mismo email
        const existingUser = await this.usersService.findByEmail(userData.email!);

        if (existingUser) {
            throw new ConflictException('El email ya está registrado');
        }

        try {
            //Crea el nuevo usuario
            const newUser = await this.usersService.create(userData);

            //Genera un token JWT
            const token = this.generateToken(newUser);

            //Excluye la contraseña de la respuesta
            const { password, ...result } = newUser;

            return {
                user: result,
                access_token: token,
            };
        } catch (error) {
            console.log('Error al registrar usuario:', error);
            throw error;
        }
    }

    /**
     * Inicia sesión con un usuario existente
     * @param email - Email del usuario
     * @param password - Contraseña del usuario
     * @returns El usuario y un token JWT
     */
    async login(email: string, password: string) {
        const user = await this.validateUser(email, password);
    
        if (!user) {
            throw new UnauthorizedException('Credenciales inválidas');
        }
        
        const token = this.generateToken(user);
        
        return {
            user,
            access_token: token,
        };
    };

    /**
     * Genera un token para un usuario
     * @param user - Usuario para el que se genera el token
     * @returns Token JWT generado
     */
    private generateToken(user: any): string {
        const payload = {
            email: user.email,
            sub: user.id,
            role: user.role
        };

        return this.jwtService.sign(payload)
    }

}
