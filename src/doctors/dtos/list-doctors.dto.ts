export class ListDoctorsQuery {
  category?: 'GENERAL' | 'ESPECIALIZADA' | 'PEDIATRIA';
  q?: string;           // búsqueda por nombre/especialidad
  page?: number;        // default 1
  limit?: number;       // default 10
  sort?: 'rating' | 'price';
}