import { MigrationInterface, QueryRunner } from "typeorm";

export class FullSchemaSync1762746015079 implements MigrationInterface {
  name = "FullSchemaSync1762746015079";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // --- Limpieza de constraints e índices (seguros con IF EXISTS)
    await queryRunner.query(`ALTER TABLE "patient" DROP CONSTRAINT IF EXISTS "FK_patient_medicalRecord"`);
    await queryRunner.query(`ALTER TABLE "patient" DROP CONSTRAINT IF EXISTS "FK_patient_user"`);
    await queryRunner.query(`ALTER TABLE "patient" DROP CONSTRAINT IF EXISTS "patient_userid_fk"`);
    await queryRunner.query(`ALTER TABLE "patient" DROP CONSTRAINT IF EXISTS "patient_user_fk"`);
    await queryRunner.query(`ALTER TABLE "appointment" DROP CONSTRAINT IF EXISTS "FK_appointment_patient"`);
    await queryRunner.query(`ALTER TABLE "appointment" DROP CONSTRAINT IF EXISTS "FK_appointment_doctor_user"`);
    await queryRunner.query(`ALTER TABLE "medical_record_condition" DROP CONSTRAINT IF EXISTS "FK_mrc_medical_record"`);
    await queryRunner.query(`ALTER TABLE "medical_record_condition" DROP CONSTRAINT IF EXISTS "FK_mrc_condition"`);
    await queryRunner.query(`ALTER TABLE "payment" DROP CONSTRAINT IF EXISTS "FK_payment_procedure"`);
    await queryRunner.query(`ALTER TABLE "procedure" DROP CONSTRAINT IF EXISTS "FK_procedure_treatment"`);
    await queryRunner.query(`ALTER TABLE "treatment" DROP CONSTRAINT IF EXISTS "FK_treatment_medical_record"`);
    await queryRunner.query(`ALTER TABLE "treatment" DROP CONSTRAINT IF EXISTS "FK_treatment_type"`);
    await queryRunner.query(`ALTER TABLE "treatment" DROP CONSTRAINT IF EXISTS "FK_treatment_status"`);
    await queryRunner.query(`ALTER TABLE "availability_slot" DROP CONSTRAINT IF EXISTS "FK_slot_doctor"`);
    await queryRunner.query(`ALTER TABLE "doctor_profile" DROP CONSTRAINT IF EXISTS "FK_doctor_profile_user"`);
    await queryRunner.query(`ALTER TABLE "doctor_profile" DROP CONSTRAINT IF EXISTS "doctor_profile_userid_fk"`);
    await queryRunner.query(`ALTER TABLE "doctor_profile" DROP CONSTRAINT IF EXISTS "doctor_profile_user_fk"`);
    await queryRunner.query(`ALTER TABLE "doctor_category_on_doctor" DROP CONSTRAINT IF EXISTS "FK_dcod_doctor"`);
    await queryRunner.query(`ALTER TABLE "doctor_category_on_doctor" DROP CONSTRAINT IF EXISTS "FK_dcod_category"`);

    // --- Eliminación de índices viejos
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."UQ_patient_userId"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_patient_name"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_patient_lastName"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_patient_email"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_patient_createdAt"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."idx_patient_userid"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_patient_userId"`);

    // --- Corrección de columnas de availability_slot
    const hasDoctorId = await queryRunner.query(`
      SELECT * FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'availability_slot' AND column_name = 'doctor_id'
    `);
    if (hasDoctorId.length > 0) {
      await queryRunner.query(`ALTER TABLE "availability_slot" RENAME COLUMN "doctor_id" TO "doctorId"`);
    }

    // --- Creación segura de tipo citas_status_enum
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'citas_status_enum') THEN
          CREATE TYPE "public"."citas_status_enum" AS ENUM('PENDING','CONFIRMED','CANCELLED','COMPLETED');
        END IF;
      END$$;
    `);

    // --- Crear tabla citas si no existe
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "citas" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "patient_id" uuid NOT NULL,
        "doctor_user_id" uuid NOT NULL,
        "start" TIMESTAMP WITH TIME ZONE NOT NULL,
        "end" TIMESTAMP WITH TIME ZONE NOT NULL,
        "reason" character varying NOT NULL,
        "note" character varying,
        "status" "public"."citas_status_enum" NOT NULL,
        CONSTRAINT "PK_43851fd780e10030fbe5bb1b912" PRIMARY KEY ("id")
      )
    `);

    // --- Asegurar columnas de patient
    await queryRunner.query(`ALTER TABLE "patient" ADD COLUMN IF NOT EXISTS "userId" uuid`);
    await queryRunner.query(`ALTER TABLE "patient" ADD COLUMN IF NOT EXISTS "medicalRecordId" uuid`);
    await queryRunner.query(`ALTER TABLE "patient" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP DEFAULT now()`);

    // --- Asegurar que birthDate y lastName puedan ser NULL (no NOT NULL)
    await queryRunner.query(`ALTER TABLE "patient" ALTER COLUMN "lastName" DROP NOT NULL`);
    await queryRunner.query(`ALTER TABLE "patient" ALTER COLUMN "birthDate" DROP NOT NULL`);

    // --- Crear índices nuevos
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_patient_email" ON "patient" ("email")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_patient_createdAt" ON "patient" ("createdAt")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
  // Si algún día se hace rollback, volver a dejar las columnas NOT NULL
  await queryRunner.query(`ALTER TABLE "patient" ALTER COLUMN "lastName" SET NOT NULL`);
  await queryRunner.query(`ALTER TABLE "patient" ALTER COLUMN "birthDate" SET NOT NULL`);

  // Eliminar los índices creados en el up()
  await queryRunner.query(`DROP INDEX IF EXISTS "IDX_patient_email"`);
  await queryRunner.query(`DROP INDEX IF EXISTS "IDX_patient_createdAt"`);

  // Opcional: revertir los cambios de columnas añadidas si se quiere un rollback total
  await queryRunner.query(`ALTER TABLE "patient" DROP COLUMN IF EXISTS "createdAt"`);
  await queryRunner.query(`ALTER TABLE "patient" DROP COLUMN IF EXISTS "medicalRecordId"`);
  await queryRunner.query(`ALTER TABLE "patient" DROP COLUMN IF EXISTS "userId"`);

  // Eliminar tabla citas si se creó en up()
  await queryRunner.query(`DROP TABLE IF EXISTS "citas"`);

  // Eliminar tipo de estado de citas si se creó
  await queryRunner.query(`DROP TYPE IF EXISTS "public"."citas_status_enum"`);
}
}