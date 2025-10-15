import { SetMetadata } from '@nestjs/common';

/**
 * Decorador para especificar roles requeridos para un endpoint
 * Ejemplo de uso: @Roles('admin', 'analyst')
 */
export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
