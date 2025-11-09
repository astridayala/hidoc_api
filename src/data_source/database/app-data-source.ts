import 'dotenv/config';
import { DataSource } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Patient } from '../../users/entities/patient.entity';
import { Condition } from '../../conditions/condition.entity';
import { TreatmentType } from '../../treatments_types/treatment_type.entity';
import { TreatmentStatus } from '../../treatment_statuses/treatment_status.entity';
import { Appointment } from '../../appointments/appointments.entity';
import { MedicalRecord } from '../../medical_record/medical_record.entity';
import { MedicalRecordCondition } from 'src/medical_record_conditions/medical_record_condition.entity';
import { Treatment } from '../../treatments/treatment.entity';
import { CitaDoctor } from 'src/citas/citas.entity';
import { Procedure } from 'src/procedures/procedure.entity';
import { Payment } from 'src/payments/payment.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: false,
  migrationsRun: false,
  logging: false,
  entities: [
    User,
    Patient,
    Condition,
    TreatmentType,
    TreatmentStatus,
    Appointment,
    MedicalRecord, 
    MedicalRecordCondition,
    Treatment,
    CitaDoctor,
    Procedure,
    Treatment,
    Payment
  ],
});