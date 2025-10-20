import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DoctorsService } from './doctors.service';
import { ListDoctorsQuery } from './dtos/list-doctors.dto';

@ApiTags('doctors')
@Controller('v1/doctors')
export class DoctorsController {
  constructor(private readonly doctors: DoctorsService) {}

  @Get('categories')
  @ApiOperation({ summary: 'Listar categorías de doctores' })
  categories() {
    return this.doctors.categories();
  }

  @Get()
  @ApiOperation({ summary: 'Listar doctores (filtros: category, q, sort, page, limit)' })
  list(@Query() query: ListDoctorsQuery) {
    return this.doctors.list(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalle de doctor' })
  detail(@Param('id') id: string) {
    return this.doctors.detail(id);
  }

  @Get(':id/availability')
  @ApiOperation({ summary: 'Disponibilidad de doctor' })
  availability(@Param('id') id: string) {
    return this.doctors.availability(id);
  }
}