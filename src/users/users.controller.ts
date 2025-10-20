import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiBody,
  ApiParam,
  ApiExtraModels,
  ApiProperty,
  ApiPropertyOptional,
  getSchemaPath,
} from '@nestjs/swagger';
import { IsEmail, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { UsersService } from './users.service';

/* ===================== DTOs para Swagger ===================== */

class UserMeResponseDto {
  @ApiProperty({ example: 'a5f4d4c6-1c0a-4c36-8f2b-7d2f0a0be3d1' })
  id: string;

  @ApiProperty({ example: 'Valeria Castro' })
  name: string;

  @ApiProperty({ example: 'valeria@example.com' })
  email: string;

  @ApiProperty({
    example: '2025-09-18T03:57:31.000Z',
    description: 'Fecha de creación del usuario',
  })
  createdAt: string;

  @ApiProperty({
    example: '2025-10-10T15:20:11.000Z',
    description: 'Fecha de última actualización del usuario',
  })
  updatedAt: string;
}

class UpdateMeDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  @ApiPropertyOptional({ example: 'Valeria C.', maxLength: 120 })
  name?: string;

  @IsOptional()
  @IsEmail()
  @ApiPropertyOptional({ example: 'valeria.c@example.com' })
  email?: string;
}

export class CreateHistoryDto {
  @IsIn(['condition'])
  @ApiProperty({ enum: ['condition'], example: 'condition' })
  type: 'condition';

  @IsString()
  @MaxLength(100)
  @ApiProperty({
    example: 'Hipertensión',
    maxLength: 100,
    description: 'Nombre de la condición médica',
  })
  name: string;
}

class HistoryEntryDto {
  @ApiProperty({ example: '9d9a5b56-0c62-4ef2-bd9a-0d6b6e0f6d3f' })
  id: string;

  @ApiProperty({ enum: ['condition'], example: 'condition' })
  type: 'condition';

  @ApiProperty({ example: 'Hipertensión' })
  name: string;

  @ApiProperty({ example: '2025-10-01T12:34:56.000Z' })
  createdAt: string;
}

/* ===================== Controlador ===================== */

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@ApiExtraModels(UserMeResponseDto, HistoryEntryDto)
@Controller('v1/users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  /* ------------ GET /v1/users/me ------------ */
  @Get('me')
  @ApiOperation({
    summary: 'Datos de perfil del usuario autenticado',
    description:
      'Devuelve el perfil del usuario asociado al token Bearer actual.',
  })
  @ApiOkResponse({
    description: 'Perfil obtenido correctamente',
    type: UserMeResponseDto,
    examples: {
      default: {
        summary: 'Ejemplo exitoso',
        value: {
          id: 'a5f4d4c6-1c0a-4c36-8f2b-7d2f0a0be3d1',
          name: 'Valeria Castro',
          email: 'valeria@example.com',
          createdAt: '2025-09-18T03:57:31.000Z',
          updatedAt: '2025-10-10T15:20:11.000Z',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Token inválido o ausente' })
  async me(@CurrentUser() user: any) {
    return this.users.getMe(user.id);
  }

  /* ------------ PATCH /v1/users/me ------------ */
  @Patch('me')
  @ApiOperation({
    summary: 'Actualizar perfil (name/email)',
    description:
      'Permite actualizar el nombre y/o correo del usuario autenticado.',
  })
  @ApiBody({
    type: UpdateMeDto,
    examples: {
      cambiarNombre: {
        summary: 'Cambiar nombre',
        value: { name: 'Valeria C.' },
      },
      cambiarEmail: {
        summary: 'Cambiar email',
        value: { email: 'valeria.c@example.com' },
      },
      ambos: {
        summary: 'Cambiar nombre y email',
        value: { name: 'Valeria C.', email: 'valeria.c@example.com' },
      },
    },
  })
  @ApiOkResponse({
    description: 'Perfil actualizado',
    type: UserMeResponseDto,
  })
  @ApiBadRequestResponse({
    description:
      'Datos inválidos (formato de email incorrecto, longitudes, etc.)',
  })
  @ApiUnauthorizedResponse({ description: 'Token inválido o ausente' })
  async updateMe(@CurrentUser() user: any, @Body() dto: UpdateMeDto) {
    return this.users.updateMe(user.id, dto);
  }

  /* ------------ GET /v1/users/me/history ------------ */
  @Get('me/history')
  @ApiOperation({
    summary: 'Listar historial médico',
    description:
      'Lista las entradas del historial (por ahora solo tipo "condition").',
  })
  @ApiOkResponse({
    description: 'Listado de historial',
    schema: {
      type: 'array',
      items: { $ref: getSchemaPath(HistoryEntryDto) },
    },
    examples: {
      default: {
        summary: 'Ejemplo de lista',
        value: [
          {
            id: '9d9a5b56-0c62-4ef2-bd9a-0d6b6e0f6d3f',
            type: 'condition',
            name: 'Hipertensión',
            createdAt: '2025-10-01T12:34:56.000Z',
          },
          {
            id: 'a1a2a3a4-5b6c-7d8e-9f00-112233445566',
            type: 'condition',
            name: 'Diabetes tipo 2',
            createdAt: '2025-10-05T08:15:30.000Z',
          },
        ],
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Token inválido o ausente' })
  async myHistory(@CurrentUser() user: any) {
    return this.users.getMyHistory(user);
  }

  /* ------------ POST /v1/users/me/history ------------ */
  @Post('me/history')
  @HttpCode(201)
  @ApiOperation({
    summary: 'Crear entrada de historial (ahora: condition)',
    description:
      'Crea una nueva entrada en el historial del usuario. Actualmente solo se admite el tipo "condition".',
  })
  @ApiBody({
    type: CreateHistoryDto,
    examples: {
      condition: {
        summary: 'Crear condición',
        value: { type: 'condition', name: 'Hipertensión' },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Entrada creada',
    type: HistoryEntryDto,
    examples: {
      default: {
        summary: 'Ejemplo creado',
        value: {
          id: 'e2f6a1cc-0c8d-4580-8a0a-1a2b3c4d5e6f',
          type: 'condition',
          name: 'Hipertensión',
          createdAt: '2025-10-12T10:00:00.000Z',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Datos inválidos (ej. type no permitido, name muy largo)',
  })
  @ApiUnauthorizedResponse({ description: 'Token inválido o ausente' })
  async createHistory(@CurrentUser() user: any, @Body() dto: CreateHistoryDto) {
    return this.users.createHistoryEntry(user, dto);
  }

  /* ------------ DELETE /v1/users/me/history/:id ------------ */
  @Delete('me/history/:id')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Eliminar entrada (medical_record_condition.id)',
    description:
      'Elimina una entrada del historial del usuario por su ID (UUID).',
  })
  @ApiParam({
    name: 'id',
    description: 'ID (UUID) de la entrada del historial',
    example: '9d9a5b56-0c62-4ef2-bd9a-0d6b6e0f6d3f',
  })
  @ApiNoContentResponse({ description: 'Eliminado correctamente' })
  @ApiUnauthorizedResponse({ description: 'Token inválido o ausente' })
  @ApiNotFoundResponse({
    description: 'No se encontró la entrada para el usuario autenticado',
  })
  async deleteHistory(
    @CurrentUser() user: any,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    await this.users.deleteHistoryEntry(user, id);
  }
}