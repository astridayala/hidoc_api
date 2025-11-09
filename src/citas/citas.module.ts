import { Module } from '@nestjs/common';
import { CitasService } from './citas.service';
import { CitasController } from './citas.controller';
import { Type } from 'class-transformer';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CitaDoctor } from './citas.entity';
import { Patient } from 'src/users/entities/patient.entity';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CitaDoctor, Patient, User])],
  providers: [CitasService],
  controllers: [CitasController],
  exports: [CitasService],
})
export class CitasModule {}
