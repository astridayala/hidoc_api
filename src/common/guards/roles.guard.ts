import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * Guard para verificar roles de usuario
 * Verifica si el usuario tiene los roles necesarios para acceder a un recurso
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  /**
   * Método que verifica si el usuario tiene los roles requeridos
   * @param context - Contexto de ejecución
   * @returns true si el usuario tiene acceso, false en caso contrario
   */
  canActivate(context: ExecutionContext): boolean {
    // Obtiene los roles requeridos del decorador @Roles()
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    // Si no hay roles requeridos, permite el acceso
    if (!requiredRoles) {
      return true;
    }
    
    // Obtiene el usuario de la request
    const { user } = context.switchToHttp().getRequest();
    
    // Verifica si el usuario tiene alguno de los roles requeridos
    return requiredRoles.some((role) => user.role === role);
  }
}
