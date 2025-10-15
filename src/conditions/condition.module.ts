import { Module } from '@nestjs/common';
import { ConditionsService } from './conditions.service';
import { ConditionsController } from './conditions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Condition } from './condition.entity';

/**
 * Modulo de padecimientos
 * Configura el repositorio y servicios relacionados con los padecimientos
 */
@Module({
  imports: [TypeOrmModule.forFeature([Condition])],
  providers: [ConditionsService],
  controllers: [ConditionsController],
  exports: [ConditionsService]
})
export class ConditionsModule {}
