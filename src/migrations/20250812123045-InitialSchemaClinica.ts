import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchemaClinica20250812123045 implements MigrationInterface {
  name = 'InitialSchemaClinica20250812123045';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Habilitar extensión para UUID
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Enums
    await queryRunner.query(`CREATE TYPE "user_role_enum" AS ENUM ('admin', 'doctor', 'paciente');`);
    await queryRunner.query(`CREATE TYPE "patient_gender_enum" AS ENUM ('femenino', 'masculino');`);
    await queryRunner.query(`
      CREATE TYPE "appointment_status_enum" AS ENUM ('PENDING','CONFIRMED','CANCELLED','COMPLETED');
    `);

    // --- Tablas sin dependencias externas (o solo de ENUMs) ---

    // Crear tabla de users
    await queryRunner.query(`
      CREATE TABLE "user" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "email" VARCHAR NOT NULL UNIQUE,
        "name" VARCHAR NOT NULL,
        "role" "user_role_enum" NOT NULL DEFAULT 'doctor',
        "password" VARCHAR NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now()
      );
    `);

    // Crear tabla de condiciones
    await queryRunner.query(`
      CREATE TABLE "condition" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" VARCHAR NOT NULL UNIQUE
      );
    `);

    // Crear tabla de estados de los tratamientos
    await queryRunner.query(`
      CREATE TABLE "treatment_status" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" VARCHAR NOT NULL UNIQUE,
        "orderPriority" INTEGER NOT NULL DEFAULT 1
      );
    `);

    // Crear tabla de los tipos de tratamientos
    await queryRunner.query(`
      CREATE TABLE "treatment_type" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" VARCHAR NOT NULL UNIQUE
      );
    `);

    // --- Tablas con dependencia circular (Patient <-> MedicalRecord) ---
    // 1. Crear ambas tablas sin las llaves foráneas (FK) que las conectan

    // Crear medical_record primero (sin FK a patient)
    await queryRunner.query(`
      CREATE TABLE "medical_record" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now()
      );
    `);

    // Crear patient (sin FK a medical_record)
    await queryRunner.query(`
      CREATE TABLE "patient" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" VARCHAR NOT NULL,
        "lastName" VARCHAR NOT NULL,
        "phone" VARCHAR,
        "email" VARCHAR,
        "birthDate" DATE NOT NULL,
        "gender" "patient_gender_enum" NOT NULL,
        "address" TEXT,
        "medicalRecordId" uuid UNIQUE,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now()
      );
    `);

    // 2. Alterar las tablas para añadir las columnas y constraints de FK
    
    // Añadir la columna 'patient_id' a 'medical_record'
    await queryRunner.query(`
      ALTER TABLE "medical_record"
      ADD COLUMN "patient_id" uuid NOT NULL;
    `);

    // Añadir la FK de 'medical_record' apuntando a 'patient'
    await queryRunner.query(`
      ALTER TABLE "medical_record"
      ADD CONSTRAINT "FK_medical_record_patient"
      FOREIGN KEY ("patient_id") REFERENCES "patient"("id")
      ON DELETE CASCADE
      ON UPDATE CASCADE;
    `);

    // Añadir la FK de 'patient' apuntando a 'medical_record'
    await queryRunner.query(`
      ALTER TABLE "patient"
      ADD CONSTRAINT "FK_patient_medicalRecord"
      FOREIGN KEY ("medicalRecordId") REFERENCES "medical_record"("id")
      ON DELETE CASCADE;
    `);

    // --- Tablas dependientes ---

    // Crear tabla de relacion entre historial y padecimientos
    await queryRunner.query(`
      CREATE TABLE "medical_record_condition" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "medical_record_id" uuid NOT NULL,
        "condition_id" uuid NOT NULL,
        CONSTRAINT "FK_mrc_medical_record" FOREIGN KEY ("medical_record_id") REFERENCES "medical_record" ("id") ON DELETE CASCADE,
        CONSTRAINT "FK_mrc_condition" FOREIGN KEY ("condition_id") REFERENCES "condition" ("id") ON DELETE CASCADE
      );
    `);

    // Crear tabla de los tratamientos
    await queryRunner.query(`
      CREATE TABLE "treatment" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "medical_record_id" uuid NOT NULL,
        "treatment_type_id" uuid NOT NULL,
        "totalPrice" DECIMAL(10,2) NOT NULL,
        "startDate" DATE NOT NULL,
        "status_id" uuid NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "FK_treatment_medical_record" FOREIGN KEY ("medical_record_id") REFERENCES "medical_record" ("id") ON DELETE CASCADE,
        CONSTRAINT "FK_treatment_type" FOREIGN KEY ("treatment_type_id") REFERENCES "treatment_type" ("id"),
        CONSTRAINT "FK_treatment_status" FOREIGN KEY ("status_id") REFERENCES "treatment_status" ("id")
      );
    `);

    // Crear tabla de los procedimientos
    await queryRunner.query(`
      CREATE TABLE "procedure" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "treatment_id" uuid NOT NULL,
        "date" DATE NOT NULL,
        "description" TEXT NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "FK_procedure_treatment" FOREIGN KEY ("treatment_id") REFERENCES "treatment" ("id") ON DELETE CASCADE
      );
    `);

    // Crear tabla de los pagos
    await queryRunner.query(`
      CREATE TABLE "payment" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "procedure_id" uuid UNIQUE,
        "date" DATE NOT NULL,
        "amount" DECIMAL(10,2) NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "FK_payment_procedure" FOREIGN KEY ("procedure_id") REFERENCES "procedure" ("id") ON DELETE CASCADE
      );
    `);

    // Crear tabla Citas
    await queryRunner.query(`
      CREATE TABLE "citas" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "patient_id" uuid NOT NULL,
        "doctor_user_id" uuid NOT NULL,
        "start" timestamp with time zone NOT NULL,
        "end" timestamp with time zone NOT NULL,
        "reason" VARCHAR NOT NULL,
        "note" VARCHAR,
        "status" "appointment_status_enum" NOT NULL,
        
        CONSTRAINT "FK_citas_patient"
          FOREIGN KEY ("patient_id") REFERENCES "patient"("id")
          ON DELETE NO ACTION ON UPDATE NO ACTION,
          
        CONSTRAINT "FK_citas_doctor_user"
          FOREIGN KEY ("doctor_user_id") REFERENCES "user"("id")
          ON DELETE NO ACTION ON UPDATE NO ACTION
      );
    `);

    // --- Índices (Indexes) ---
    // (Se omite "IDX_user_email" porque la columna 'email' ya es UNIQUE, lo que crea un índice automáticamente)
    await queryRunner.query(`CREATE INDEX "IDX_user_name" ON "user" ("name");`);
    
    await queryRunner.query(`CREATE INDEX "IDX_patient_name" ON "patient" ("name");`);
    await queryRunner.query(`CREATE INDEX "IDX_patient_lastName" ON "patient" ("lastName");`);
    await queryRunner.query(`CREATE INDEX "IDX_patient_email" ON "patient" ("email");`);
    await queryRunner.query(`CREATE INDEX "IDX_patient_createdAt" ON "patient" ("createdAt");`);

    await queryRunner.query(`CREATE INDEX "IDX_treatment_status" ON "treatment" ("status_id");`);
    await queryRunner.query(`CREATE INDEX "IDX_treatment_startDate" ON "treatment" ("startDate");`);
    await queryRunner.query(`CREATE INDEX "IDX_treatment_createdAt" ON "treatment" ("createdAt");`);

    await queryRunner.query(`CREATE INDEX "IDX_procedure_date" ON "procedure" ("date");`);
    await queryRunner.query(`CREATE INDEX "IDX_procedure_createdAt" ON "procedure" ("createdAt");`);

    await queryRunner.query(`CREATE INDEX "IDX_payment_date" ON "payment" ("date");`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // --- 1. Dropear Índices ---
    // (Tu lista de DROP INDEX estaba correcta)
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_payment_date";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_procedure_createdAt";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_procedure_date";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_treatment_createdAt";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_treatment_startDate";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_treatment_status";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_patient_createdAt";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_patient_email";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_patient_lastName";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_patient_name";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_user_name";`);
    // (No es necesario dropear "IDX_user_email" porque no lo creamos)

    // --- 2. Dropear Tablas (en orden inverso de dependencia) ---
    
    // Tablas que dependen de otras
    await queryRunner.query(`DROP TABLE IF EXISTS "citas";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "payment";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "procedure";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "treatment";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "medical_record_condition";`);
    
    // Romper la dependencia circular (patient <-> medical_record)
    // Es posible que los constraints no existan si el 'up' falló a medio camino
    await queryRunner.query(`ALTER TABLE "patient" DROP CONSTRAINT IF EXISTS "FK_patient_medicalRecord";`);
    await queryRunner.query(`ALTER TABLE "medical_record" DROP CONSTRAINT IF EXISTS "FK_medical_record_patient";`);

    // Tablas base
    await queryRunner.query(`DROP TABLE IF EXISTS "patient";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "medical_record";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "treatment_type";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "treatment_status";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "condition";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user";`);

    // --- 3. Dropear ENUMs ---
    await queryRunner.query(`DROP TYPE IF EXISTS "patient_gender_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "user_role_enum";`);
    // (Faltaba este en tu 'down' original)
    await queryRunner.query(`DROP TYPE IF EXISTS "appointment_status_enum";`);
  }
}