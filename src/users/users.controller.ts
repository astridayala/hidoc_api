import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { UsersService } from './users.service';

class UpdateMeDto {
  name?: string;
  email?: string; // si permites cambiar email
}

class CreateHistoryDto {
  // Para simplificar: de momento sólo agregamos "condition"
  // Puedes extender con 'treatment' | 'procedure' si quieres.
  type: 'condition';
  name: string;
}

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('v1/users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Datos de perfil del usuario autenticado' })
  async me(@CurrentUser() user: any) {
    return this.users.getMe(user.id);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Actualizar perfil (name/email)' })
  async updateMe(@CurrentUser() user: any, @Body() dto: UpdateMeDto) {
    return this.users.updateMe(user.id, dto);
  }

  @Get('me/history')
  @ApiOperation({ summary: 'Listar historial médico (conditions, treatments, procedures, payments)' })
  async myHistory(@CurrentUser() user: any) {
    return this.users.getMyHistory(user);
  }

  @Post('me/history')
  @HttpCode(201)
  @ApiOperation({ summary: 'Crear entrada de historial (ahora: condition)' })
  async createHistory(@CurrentUser() user: any, @Body() dto: CreateHistoryDto) {
    return this.users.createHistoryEntry(user, dto);
  }

  @Delete('me/history/:id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Eliminar entrada (ahora: medical_record_condition.id)' })
  async deleteHistory(@CurrentUser() user: any, @Param('id') id: string) {
    await this.users.deleteHistoryEntry(user, id);
  }
}