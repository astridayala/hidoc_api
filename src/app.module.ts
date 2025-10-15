import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PatientModule } from './patients/patients.module';
import { MedicalRecordModule } from './medical_record/medical_record.module';
import { ConditionsModule } from './conditions/condition.module';
import { MedicalRecordConditionsModule } from './medical_record_conditions/medical_record_conditions.module';
import { TreatmentsTypesModule } from './treatments_types/treatments_types.module';
import { TreatmentsModule } from './treatments/treatments.module';
import { ProceduresModule } from './procedures/procedures.module';
import { PaymentsModule } from './payments/payments.module';
import { TreatmentStatusesModule } from './treatment_statuses/treatment_statuses.module';
import { AppointmentsModule } from './appointments/appointments.module';

/**
 * Módulo principal de la aplicación
 * Configura módulos globales y dependencias
 */
@Module({
  imports: [
    // Configuración de variables de entorno
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    
    // Configuración de la base de datos
    DatabaseModule,
    
    // Módulos de la aplicación
    UsersModule,
    AuthModule,
    PatientModule,
    MedicalRecordModule,
    ConditionsModule,
    MedicalRecordConditionsModule,
    TreatmentsTypesModule,
    TreatmentsModule,
    ProceduresModule,
    PaymentsModule,
    TreatmentStatusesModule,
    AppointmentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
