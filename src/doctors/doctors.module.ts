import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DoctorsController } from './doctors.controller';
import { DoctorsService } from './doctors.service';
import { DoctorProfile } from './entities/doctor-profile.entity';
import { DoctorCategory } from './entities/doctor-category.entity';
import { AvailabilitySlot } from './entities/availability-slot.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DoctorProfile, DoctorCategory, AvailabilitySlot])],
  controllers: [DoctorsController],
  providers: [DoctorsService],
  exports: [DoctorsService],
})
export class DoctorsModule {}