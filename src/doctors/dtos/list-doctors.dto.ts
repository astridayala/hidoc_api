import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min, IsIn } from 'class-validator';

export class ListDoctorsQuery {
  @IsOptional()
  @IsString()
  // GENERAL | ESPECIALIZADA | PEDIATRIA
  category?: string;

  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsIn(['rating', '-rating', 'price', '-price'])
  sort?: 'rating' | '-rating' | 'price' | '-price';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit: number = 10;
}