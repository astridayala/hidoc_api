import { Module } from '@nestjs/common';
import { ProceduresService } from './procedures.service';
import { ProceduresController } from './procedures.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Procedure } from './procedure.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Procedure])],
  providers: [ProceduresService],
  controllers: [ProceduresController],
  exports: [ProceduresService]
})
export class ProceduresModule {}
