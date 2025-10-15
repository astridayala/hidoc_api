import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchemaClinica20250812123045 implements MigrationInterface {
  name = 'InitialSchemaClinica20250812123045';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Habilitar extensión para UUID
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Enums
    await queryRunner.query(`CREATE TYPE "user_role_enum" AS ENUM ('admin', 'doctor');`);
    await queryRunner.query(`CREATE TYPE "patient_gender_enum" AS ENUM ('femenino', 'masculino');`);

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

    // Crear tabla de historial medico
    await queryRunner.query(`
      CREATE TABLE "medical_record" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now()
      );
    `);

    // Crear tabla de los pacientes
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
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "FK_patient_medicalRecord" FOREIGN KEY ("medicalRecordId") REFERENCES "medical_record" ("id") ON DELETE CASCADE
      );
    `);

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

    // Índices
    await queryRunner.query(`CREATE INDEX "IDX_user_email" ON "user" ("email");`);
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
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_user_email";`);

    await queryRunner.query(`DROP TABLE "payment";`);
    await queryRunner.query(`DROP TABLE "procedure";`);
    await queryRunner.query(`DROP TABLE "treatment";`);
    await queryRunner.query(`DROP TABLE "medical_record_condition";`);
    await queryRunner.query(`DROP TABLE "patient";`);
    await queryRunner.query(`DROP TABLE "medical_record";`);
    await queryRunner.query(`DROP TABLE "treatment_type";`);
    await queryRunner.query(`DROP TABLE "treatment_status";`);
    await queryRunner.query(`DROP TABLE "condition";`);
    await queryRunner.query(`DROP TABLE "user";`);
    await queryRunner.query(`DROP TYPE "patient_gender_enum";`);
    await queryRunner.query(`DROP TYPE "user_role_enum";`);
  }
}
