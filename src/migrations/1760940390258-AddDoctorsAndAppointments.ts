import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDoctorsAndAppointments1760940390258 implements MigrationInterface {
  name = 'AddDoctorsAndAppointments1760940390258';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1) Perfiles de Doctor (FK a user.id; usamos users con role='doctor')
    await queryRunner.query(`
      CREATE TABLE "doctor_profile" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" uuid UNIQUE NOT NULL,
        "fullName" VARCHAR NOT NULL,
        "specialty" VARCHAR NOT NULL,
        "price" INTEGER NOT NULL DEFAULT 0,
        "rating" DECIMAL(3,2) NOT NULL DEFAULT 0,
        "about" TEXT,
        "isOnline" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "FK_doctor_profile_user" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE CASCADE
      );
    `);

    // 2) Categorías de doctor (GENERAL, ESPECIALIZADA, PEDIATRIA)
    await queryRunner.query(`
      CREATE TABLE "doctor_category" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "code" VARCHAR NOT NULL UNIQUE,   -- GENERAL | ESPECIALIZADA | PEDIATRIA
        "name" VARCHAR NOT NULL
      );
    `);

    // 3) Relación doctor ↔ categoría
    await queryRunner.query(`
      CREATE TABLE "doctor_category_on_doctor" (
        "doctor_id" uuid NOT NULL,
        "category_id" uuid NOT NULL,
        PRIMARY KEY ("doctor_id", "category_id"),
        CONSTRAINT "FK_dcod_doctor" FOREIGN KEY ("doctor_id") REFERENCES "doctor_profile" ("id") ON DELETE CASCADE,
        CONSTRAINT "FK_dcod_category" FOREIGN KEY ("category_id") REFERENCES "doctor_category" ("id") ON DELETE CASCADE
      );
    `);

    // 4) Slots de disponibilidad
    await queryRunner.query(`
      CREATE TABLE "availability_slot" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "doctor_id" uuid NOT NULL,
        "start" TIMESTAMP NOT NULL,
        "end" TIMESTAMP NOT NULL,
        "isBooked" BOOLEAN NOT NULL DEFAULT false,
        CONSTRAINT "FK_slot_doctor" FOREIGN KEY ("doctor_id") REFERENCES "doctor_profile" ("id") ON DELETE CASCADE
      );
    `);
    await queryRunner.query(`CREATE INDEX "IDX_slot_doctor_start" ON "availability_slot" ("doctor_id","start");`);

    // 5) Citas (appointment)
    await queryRunner.query(`
      CREATE TYPE "appointment_status_enum" AS ENUM ('PENDING','CONFIRMED','CANCELLED','COMPLETED');
    `);
    await queryRunner.query(`
      CREATE TABLE "appointment" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "patient_id" uuid NOT NULL,          -- FK a patient.id
        "doctor_user_id" uuid NOT NULL,      -- doctor (user.id con role='doctor')
        "scheduledAt" TIMESTAMP NOT NULL,
        "status" "appointment_status_enum" NOT NULL DEFAULT 'PENDING',
        "reason" VARCHAR NOT NULL,
        "note" TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "FK_appointment_patient" FOREIGN KEY ("patient_id") REFERENCES "patient" ("id") ON DELETE CASCADE,
        CONSTRAINT "FK_appointment_doctor_user" FOREIGN KEY ("doctor_user_id") REFERENCES "user" ("id") ON DELETE CASCADE
      );
    `);
    await queryRunner.query(`CREATE INDEX "IDX_appointment_patient" ON "appointment" ("patient_id","createdAt");`);
    await queryRunner.query(`CREATE INDEX "IDX_appointment_doctor" ON "appointment" ("doctor_user_id","scheduledAt");`);

    // 6) Seed categorías
    await queryRunner.query(`
      INSERT INTO "doctor_category" ("code","name") VALUES
      ('GENERAL','Medicina General'),
      ('ESPECIALIZADA','Especializada'),
      ('PEDIATRIA','Pediatría')
      ON CONFLICT ("code") DO NOTHING;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_appointment_doctor";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_appointment_patient";`);
    await queryRunner.query(`DROP TABLE "appointment";`);
    await queryRunner.query(`DROP TYPE "appointment_status_enum";`);

    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_slot_doctor_start";`);
    await queryRunner.query(`DROP TABLE "availability_slot";`);

    await queryRunner.query(`DROP TABLE "doctor_category_on_doctor";`);
    await queryRunner.query(`DROP TABLE "doctor_category";`);
    await queryRunner.query(`DROP TABLE "doctor_profile";`);
  }
}
