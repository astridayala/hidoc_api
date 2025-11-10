import {
  Controller,
  Get,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiQuery,
  ApiParam,
  ApiExtraModels,
  ApiProperty,
  ApiPropertyOptional,
  getSchemaPath,
} from '@nestjs/swagger';
import { DoctorsService } from './doctors.service';
import { ListDoctorsQuery } from './dtos/list-doctors.dto';

/* ============ DTOs para Swagger (ajusta a tu dominio) ============ */

class CategoryDto {
  @ApiProperty({ example: 'cardiology' })
  slug: string;

  @ApiProperty({ example: 'Cardiología' })
  name: string;

  @ApiProperty({ example: 42, description: 'Cantidad de doctores en la categoría' })
  totalDoctors: number;
}

class DoctorSummaryDto {
  @ApiProperty({ example: 'b3e8e9cb-9d02-4e3b-9d1a-6f3a0b5c1d21' })
  id: string;

  @ApiProperty({ example: 'Dra. Ana Gómez' })
  fullName: string;

  @ApiProperty({ example: 'Cardióloga' })
  specialty: string;

  @ApiProperty({ example: ['cardiology', 'internal-medicine'] })
  categories: string[];

  @ApiProperty({ example: 4.8 })
  rating: number;

  @ApiProperty({ example: 125 })
  reviewsCount: number;

  @ApiProperty({ example: 'San Salvador' })
  city: string;

  @ApiProperty({ example: 45, description: 'Precio mínimo de consulta' })
  priceFrom: number;

  @ApiProperty({ example: 'USD' })
  priceCurrency: string;

  @ApiProperty({ example: 'https://cdn.example.com/photos/ana-gomez.jpg' })
  photoUrl: string;
}

class EducationDto {
  @ApiProperty({ example: 'Universidad de El Salvador' })
  institution: string;
  @ApiProperty({ example: 'Cardiología' })
  degree: string;
  @ApiProperty({ example: 2018 })
  year: number;
}

class DoctorDetailDto extends DoctorSummaryDto {
  @ApiProperty({ example: 'Especialista en cardiología preventiva y rehabilitación.' })
  bio: string;

  @ApiProperty({ example: ['es', 'en'] })
  languages: string[];

  @ApiProperty({ example: 7, description: 'Años de experiencia' })
  experienceYears: number;

  @ApiProperty({ type: [EducationDto] })
  education: EducationDto[];
}

class AvailabilitySlotDto {
  @ApiProperty({ example: '2025-10-22T14:00:00.000Z' })
  startISO: string;

  @ApiProperty({ example: '2025-10-22T14:30:00.000Z' })
  endISO: string;

  @ApiProperty({ example: false })
  isBooked: boolean;
}

class AvailabilityDayDto {
  @ApiProperty({ example: '2025-10-22' })
  date: string;

  @ApiProperty({ type: [AvailabilitySlotDto] })
  slots: AvailabilitySlotDto[];
}

class PaginationMetaDto {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 128 })
  total: number;

  @ApiProperty({ example: 13 })
  totalPages: number;

  @ApiProperty({ example: '-rating' })
  sort: string;
}

class PaginatedDoctorsResponseDto {
  @ApiProperty({ type: [DoctorSummaryDto] })
  data: DoctorSummaryDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}

/* ===================== Controlador ===================== */

@ApiTags('doctors')
@ApiExtraModels(
  CategoryDto,
  DoctorSummaryDto,
  DoctorDetailDto,
  AvailabilitySlotDto,
  AvailabilityDayDto,
  PaginatedDoctorsResponseDto,
)
@Controller('doctors')
export class DoctorsController {
  constructor(private readonly doctors: DoctorsService) {}

  /* ------------ GET /v1/doctors/categories ------------ */
  @Get('categories')
  @ApiOperation({
    summary: 'Listar categorías de doctores',
    description: 'Devuelve las categorías disponibles para filtrar doctores.',
  })
  @ApiOkResponse({
    description: 'Listado de categorías',
    schema: {
      type: 'array',
      items: { $ref: getSchemaPath(CategoryDto) },
    },
    examples: {
      default: {
        summary: 'Ejemplo',
        value: [
          { slug: 'cardiology', name: 'Cardiología', totalDoctors: 42 },
          { slug: 'dermatology', name: 'Dermatología', totalDoctors: 31 },
        ],
      },
    },
  })
  categories() {
    return this.doctors.categories();
  }

  /* ------------ GET /v1/doctors ------------ */
  @Get()
  @ApiOperation({
    summary: 'Listar doctores (filtros: category, q, sort, page, limit)',
    description:
      'Permite filtrar por categoría (`category`), texto libre (`q`), ordenar (`sort`), y paginar (`page`, `limit`). ' +
      'Sugerencia de `sort`: `"rating"`, `"-rating"`, `"priceFrom"`, `"-priceFrom"`, `"reviewsCount"`, etc.',
  })
  @ApiQuery({
    name: 'category',
    required: false,
    description: 'Slug de categoría (p. ej. "cardiology")',
    example: 'cardiology',
  })
  @ApiQuery({
    name: 'q',
    required: false,
    description: 'Búsqueda por nombre/especialidad/ciudad',
    example: 'gómez cardiología',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    description:
      'Campo de ordenamiento. Prefijo "-" para descendente (ej. "-rating").',
    example: '-rating',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Página (1-based).',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Tamaño de página (máx. recomendado 50).',
    example: 10,
  })
  @ApiOkResponse({
    description: 'Listado paginado de doctores',
    type: PaginatedDoctorsResponseDto,
    examples: {
      default: {
        summary: 'Ejemplo',
        value: {
          data: [
            {
              id: 'b3e8e9cb-9d02-4e3b-9d1a-6f3a0b5c1d21',
              fullName: 'Dra. Ana Gómez',
              specialty: 'Cardióloga',
              categories: ['cardiology'],
              rating: 4.8,
              reviewsCount: 125,
              city: 'San Salvador',
              priceFrom: 45,
              priceCurrency: 'USD',
              photoUrl: 'https://cdn.example.com/photos/ana-gomez.jpg',
            },
          ],
          meta: { page: 1, limit: 10, total: 128, totalPages: 13, sort: '-rating' },
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description:
      'Parámetros inválidos (ej. `page`/`limit` no numéricos, `sort` desconocido).',
  })
  list(@Query() query: ListDoctorsQuery) {
    return this.doctors.list(query);
  }

  /* ------------ GET /v1/doctors/:id ------------ */
  @Get(':id')
  @ApiOperation({
    summary: 'Detalle de doctor',
    description: 'Devuelve el perfil detallado del doctor por su ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del doctor (UUID u otro identificador según tu modelo)',
    example: 'b3e8e9cb-9d02-4e3b-9d1a-6f3a0b5c1d21',
  })
  @ApiOkResponse({
    description: 'Detalle del doctor',
    type: DoctorDetailDto,
    examples: {
      default: {
        summary: 'Ejemplo',
        value: {
          id: 'b3e8e9cb-9d02-4e3b-9d1a-6f3a0b5c1d21',
          fullName: 'Dra. Ana Gómez',
          specialty: 'Cardióloga',
          categories: ['cardiology', 'internal-medicine'],
          rating: 4.8,
          reviewsCount: 125,
          city: 'San Salvador',
          priceFrom: 45,
          priceCurrency: 'USD',
          photoUrl: 'https://cdn.example.com/photos/ana-gomez.jpg',
          bio: 'Especialista en cardiología preventiva y rehabilitación.',
          languages: ['es', 'en'],
          experienceYears: 7,
          education: [
            { institution: 'Universidad de El Salvador', degree: 'Cardiología', year: 2018 },
          ],
        },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Doctor no encontrado' })
  detail(
    // Si tus IDs son UUID, descomenta la pipe:
    // @Param('id', new ParseUUIDPipe()) id: string
    @Param('id') id: string,
  ) {
    return this.doctors.detail(id);
  }

  /* ------------ GET /v1/doctors/:id/availability ------------ */
  @Get(':id/availability')
  @ApiOperation({
    summary: 'Disponibilidad de doctor',
    description:
      'Devuelve disponibilidad del doctor. Puedes pasar `date` (YYYY-MM-DD) y `days` para rango.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del doctor',
    example: 'b3e8e9cb-9d02-4e3b-9d1a-6f3a0b5c1d21',
  })
  @ApiQuery({
    name: 'date',
    required: false,
    description: 'Fecha inicial (formato YYYY-MM-DD).',
    example: '2025-10-22',
  })
  @ApiQuery({
    name: 'days',
    required: false,
    description: 'Cantidad de días a consultar desde `date` (por defecto 7).',
    example: 7,
  })
  @ApiOkResponse({
    description: 'Calendario de disponibilidad por día',
    schema: {
      type: 'array',
      items: { $ref: getSchemaPath(AvailabilityDayDto) },
    },
    examples: {
      default: {
        summary: 'Ejemplo',
        value: [
          {
            date: '2025-10-22',
            slots: [
              {
                startISO: '2025-10-22T14:00:00.000Z',
                endISO: '2025-10-22T14:30:00.000Z',
                isBooked: false,
              },
              {
                startISO: '2025-10-22T15:00:00.000Z',
                endISO: '2025-10-22T15:30:00.000Z',
                isBooked: true,
              },
            ],
          },
        ],
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Parámetros inválidos (fecha mal formada, `days` fuera de rango).',
  })
  availability(
    // Si tus IDs son UUID, descomenta la pipe:
    // @Param('id', new ParseUUIDPipe()) id: string,
    @Param('id') id: string,
    @Query('date') date?: string,
    @Query('days') days?: string,
  ) {
    // Si tu servicio ya acepta el query original, adapta el pass-through:
    return this.doctors.availability(id /*, { date, days } */);
  }
}