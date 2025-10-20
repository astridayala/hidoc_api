// src/common/enums/role.enum.ts

/**
 * Enum de roles de la app.
 * Debe coincidir con los valores del enum en la base de datos:
 *   "user_role_enum" = ('admin', 'doctor', 'paciente')
 * Aquí solo usamos 'doctor' y 'paciente'.
 */
export enum Role {
  Doctor = 'doctor',
  Paciente = 'paciente',
}

// (Opcional) helper para validar strings entrantes contra el enum
export const isRole = (v: string): v is Role =>
  v === Role.Doctor || v === Role.Paciente;