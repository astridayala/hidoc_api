import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { DoctorProfile } from './entities/doctor-profile.entity';
import { DoctorCategory } from './entities/doctor-category.entity';
import { AvailabilitySlot } from './entities/availability-slot.entity';
import { ListDoctorsQuery } from './dtos/list-doctors.dto';
import { MoreThanOrEqual } from 'typeorm';

@Injectable()
export class DoctorsService {
  constructor(
    @InjectRepository(DoctorProfile) private readonly docRepo: Repository<DoctorProfile>,
    @InjectRepository(DoctorCategory) private readonly catRepo: Repository<DoctorCategory>,
    @InjectRepository(AvailabilitySlot) private readonly slotRepo: Repository<AvailabilitySlot>,
  ) {}

  async categories() {
    return this.catRepo.find({ order: { name: 'ASC' } });
  }

  async list(query: ListDoctorsQuery) {
    try {
      const page = Math.max(Number(query.page || 1), 1);
      const limit = Math.min(Math.max(Number(query.limit || 10), 1), 50);
      const skip = (page - 1) * limit;

      // Construimos desde DoctorProfile y unimos a la tabla puente y categoría
      const qb = this.docRepo
        .createQueryBuilder('d')
        // join a la tabla puente (nombre real en tu DB)
        .leftJoin('doctor_category_on_doctor', 'dc', 'dc.doctor_id = d.id')
        .leftJoin('doctor_category', 'c', 'c.id = dc.category_id');

      if (query.category) {
        qb.andWhere('c.code = :code', { code: query.category });
      }

      if (query.q) {
        qb.andWhere('(d.fullName ILIKE :q OR d.specialty ILIKE :q)', { q: `%${query.q}%` });
      }

      // orden
      switch (query.sort) {
        case 'rating': qb.orderBy('d.rating', 'ASC'); break;
        case '-rating': qb.orderBy('d.rating', 'DESC'); break;
        case 'price': qb.orderBy('d.price', 'ASC'); break;
        case '-price': qb.orderBy('d.price', 'DESC'); break;
        default:          qb.orderBy('d.fullName','ASC'); 
      }

      qb.skip(skip).take(limit);

      const [data, total] = await qb.getManyAndCount();
      return { data, meta: { page, limit, total } };
    } catch (err) {
      // Log para ver el error real en consola
      // eslint-disable-next-line no-console
      console.error('[DoctorsService.list] ERROR', err);
      throw new InternalServerErrorException();
    }
  }

  async detail(id: string) {
    return this.docRepo.findOne({ where: { id } });
  }

  async availability(doctorId: string) {
    const now = new Date();
    return this.slotRepo.find({
      where: {
        doctor: { id: doctorId },
        start: MoreThanOrEqual(now),
        isBooked: false,
      } as any,
      order: { start: 'ASC' },
      take: 50,
    });
  }
}