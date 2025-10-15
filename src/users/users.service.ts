import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './users.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

/**
 * Servicio para gestionar usuarios
 * Proporcionas métodos para creat, buscar y actualizar usuarios
 */
@Injectable()
export class UsersService {
    constructor(
      @InjectRepository(User)
      private usersRepository: Repository<User>,  
    ) {}

    /**
     * Crea un nuevo usuario
     * @param userData - Datos del usuario a crear
     * @returns El usuario creado
     */
    async create(userData: Partial<User>): Promise<User> {
        //Encripta la contraseña antes de guardarla
        const hashedPassword = await bcrypt.hash(userData.password!, 10)

        const newUser = this.usersRepository.create({
            ...userData,
            password: hashedPassword,
        });

        return this.usersRepository.save(newUser)
    }

    /**
     * Busca un usuario por su ID
     * @param id - ID del usuario a buscar
     * @returns El usuario encontrado o null si no existe
     */
    async findOne(id: string): Promise<User> {
        const user = await this.usersRepository.findOne({ where: { id } });
        
        if (!user) {
        throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
        }
        
        return user;
    }

    /**
     * Busca un usuario por su email
     * @param email - Email del usuario a buscar
     * @returns El usuario encontrado o null si no existe
     */
    async findByEmail(email: string): Promise<User | null> {
        return this.usersRepository.findOne({ where: { email } });
    }

    /**
     * Obtiene todos los usuarios
     * @returns Lista de usuarios
     */
    async findAll(): Promise<User[]> {
        return this.usersRepository.find();
    }

}
