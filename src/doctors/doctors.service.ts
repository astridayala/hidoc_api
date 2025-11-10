import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { DoctorProfile } from './entities/doctor-profile.entity';
import { DoctorCategory } from './entities/doctor-category.entity';
import { AvailabilitySlot } from './entities/availability-slot.entity';
import { ListDoctorsQuery } from './dtos/list-doctors.dto';

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
    const page = Math.max(Number(query.page || 1), 1);
    const limit = Math.min(Math.max(Number(query.limit || 10), 1), 50);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.q) {
      // búsqueda en nombre/especialidad
      where['$or'] = [
        { fullName: ILike(`%${query.q}%`) },
        { specialty: ILike(`%${query.q}%`) },
      ];
    }

    // filtro por categoría (join en query builder)
    const qb = this.docRepo
      .createQueryBuilder('d')
      .leftJoinAndSelect('d.categories', 'c');

    if (query.category) {
      qb.andWhere('c.code = :code', { code: query.category });
    }

    if (query.q) {
      qb.andWhere('(d.fullName ILIKE :q OR d.specialty ILIKE :q)', { q: `%${query.q}%` });
    }

    if (query.sort === 'rating') qb.orderBy('d.rating', 'DESC');
    else if (query.sort === 'price') qb.orderBy('d.price', 'ASC');
    else qb.orderBy('d.createdAt', 'DESC');

    qb.skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, meta: { page, limit, total } };
  }

  async detail(id: string) {
    return this.docRepo.findOne({ where: { id } });
  }

  async availability(doctorId: string) {
    const now = new Date();
    return this.slotRepo.find({
      where: { doctor: { id: doctorId }, start: now, isBooked: false } as any,
      order: { start: 'ASC' },
      take: 50,
    });
  }
}