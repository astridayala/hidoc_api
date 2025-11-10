import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class FullSchemaSync1762746015079 implements MigrationInterface {
  name = 'FullSchemaSync1762746015079'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Helpers para crear constraints si no existen
    const addConstraintIfMissing = async (conname: string, addSql: string) => {
      await queryRunner.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = '${conname}'
          ) THEN
            ${addSql};
          END IF;
        END$$;
      `);
    };

    // -----------------------------
    // DROPS SEGUROS
    // -----------------------------
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

    await queryRunner.query(`DROP INDEX IF EXISTS "public"."UQ_patient_userId"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_patient_name"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_patient_lastName"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_patient_email"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_patient_createdAt"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."idx_patient_userid"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_patient_userId"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_appointment_patient"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_appointment_doctor"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."idx_user_email"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_payment_date"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_procedure_date"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_procedure_createdAt"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_treatment_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_treatment_startDate"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_treatment_createdAt"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_slot_doctor_start"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."idx_doctor_profile_userid"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."idx_doctor_userid"`);

    // -----------------------------
    // RENAME COLUMN SOLO SI EXISTE
    // -----------------------------
    const hasDoctorIdSnake = await queryRunner.hasColumn('availability_slot', 'doctor_id');
    const hasDoctorIdCamel = await queryRunner.hasColumn('availability_slot', 'doctorId');
    if (hasDoctorIdSnake && !hasDoctorIdCamel) {
      await queryRunner.query(`ALTER TABLE "availability_slot" RENAME COLUMN "doctor_id" TO "doctorId"`);
    }

    // -----------------------------
    // NUEVOS TIPOS / TABLAS (sin cambiar tu intención)
    // -----------------------------
    await queryRunner.query(`DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'citas_status_enum') THEN
          CREATE TYPE "public"."citas_status_enum" AS ENUM('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED');
        END IF;
      END$$;
    `);

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

    // -----------------------------
    // CAMBIOS EN patient / user / otras (DROPs con IF EXISTS y ADDs seguros)
    // -----------------------------
    await queryRunner.query(`ALTER TABLE "patient" DROP CONSTRAINT IF EXISTS "patient_medicalRecordId_key"`);
    await queryRunner.query(`ALTER TABLE "patient" DROP COLUMN IF EXISTS "medicalRecordId"`);
    await queryRunner.query(`ALTER TABLE "patient" DROP COLUMN IF EXISTS "createdAt"`);
    await queryRunner.query(`ALTER TABLE "patient" DROP CONSTRAINT IF EXISTS "patient_userid_uniq"`);
    await queryRunner.query(`ALTER TABLE "patient" DROP COLUMN IF EXISTS "userId"`);

    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN IF EXISTS "accept_terms"`);
    await queryRunner.query(`ALTER TABLE "procedure" DROP COLUMN IF EXISTS "createdAt"`);
    await queryRunner.query(`ALTER TABLE "treatment" DROP COLUMN IF EXISTS "medical_record_id"`);
    await queryRunner.query(`ALTER TABLE "treatment" DROP COLUMN IF EXISTS "treatment_type_id"`);
    await queryRunner.query(`ALTER TABLE "treatment" DROP COLUMN IF EXISTS "startDate"`);
    await queryRunner.query(`ALTER TABLE "treatment" DROP COLUMN IF EXISTS "status_id"`);
    await queryRunner.query(`ALTER TABLE "treatment" DROP COLUMN IF EXISTS "createdAt"`);
    await queryRunner.query(`ALTER TABLE "doctor_profile" DROP COLUMN IF EXISTS "about"`);
    await queryRunner.query(`ALTER TABLE "doctor_profile" DROP COLUMN IF EXISTS "createdAt"`);
    await queryRunner.query(`ALTER TABLE "doctor_profile" DROP CONSTRAINT IF EXISTS "doctor_profile_profid_uniq"`);
    await queryRunner.query(`ALTER TABLE "doctor_profile" DROP COLUMN IF EXISTS "professionalId"`);

    await queryRunner.query(`ALTER TABLE "appointment" ADD COLUMN IF NOT EXISTS "patientId" uuid`);
    await queryRunner.query(`ALTER TABLE "patient" ADD COLUMN IF NOT EXISTS "userId" uuid`);
    await addConstraintIfMissing(
      "UQ_6636aefca0bdad8933c7cc3e394",
      `ALTER TABLE "patient" ADD CONSTRAINT "UQ_6636aefca0bdad8933c7cc3e394" UNIQUE ("userId")`
    );
    await queryRunner.query(`ALTER TABLE "patient" ADD COLUMN IF NOT EXISTS "medicalRecordId" uuid`);
    await addConstraintIfMissing(
      "UQ_99e09706beaedaa5842116a302c",
      `ALTER TABLE "patient" ADD CONSTRAINT "UQ_99e09706beaedaa5842116a302c" UNIQUE ("medicalRecordId")`
    );
    await queryRunner.query(`ALTER TABLE "patient" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);

    await queryRunner.query(`ALTER TABLE "medical_record" ADD COLUMN IF NOT EXISTS "patient_id" uuid`);
    await addConstraintIfMissing(
      "UQ_dddd1dc79ff4c20ae61b62f9add",
      `ALTER TABLE "medical_record" ADD CONSTRAINT "UQ_dddd1dc79ff4c20ae61b62f9add" UNIQUE ("patient_id")`
    );

    await queryRunner.query(`ALTER TABLE "procedure" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
    await queryRunner.query(`ALTER TABLE "treatment" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
    await queryRunner.query(`ALTER TABLE "treatment" ADD COLUMN IF NOT EXISTS "medicalRecordId" uuid`);
    await queryRunner.query(`ALTER TABLE "treatment" ADD COLUMN IF NOT EXISTS "treatmentTypeId" uuid`);
    await queryRunner.query(`ALTER TABLE "treatment" ADD COLUMN IF NOT EXISTS "statusId" uuid`);

    // Reglas de NOT NULL / defaults (igual que tu intención original)
    await queryRunner.query(`ALTER TABLE "patient" ALTER COLUMN "lastName" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "patient" ALTER COLUMN "birthDate" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "patient" ALTER COLUMN "gender" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "appointment" ALTER COLUMN "status" SET DEFAULT 'CONFIRMED'`);
    await queryRunner.query(`ALTER TABLE "appointment" ALTER COLUMN "reason" DROP NOT NULL`);

    // Cambios de ENUM role
    await queryRunner.query(`ALTER TYPE "public"."user_role_enum" RENAME TO "user_role_enum_old"`);
    await queryRunner.query(`CREATE TYPE "public"."user_role_enum" AS ENUM('doctor', 'paciente')`);
    await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "role" DROP DEFAULT`);
    await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "role" TYPE "public"."user_role_enum" USING "role"::"text"::"public"."user_role_enum"`);
    await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'doctor'`);
    await queryRunner.query(`DROP TYPE "public"."user_role_enum_old"`);

    // Cambios de ENUM gender
    await queryRunner.query(`ALTER TYPE "public"."patient_gender_enum" RENAME TO "patient_gender_enum_old"`);
    await queryRunner.query(`CREATE TYPE "public"."patient_gender_enum" AS ENUM('femenino', 'masculino')`);
    await queryRunner.query(`ALTER TABLE "patient" ALTER COLUMN "gender" TYPE "public"."patient_gender_enum" USING "gender"::"text"::"public"."patient_gender_enum"`);
    await queryRunner.query(`DROP TYPE "public"."patient_gender_enum_old"`);
    await queryRunner.query(`ALTER TABLE "patient" ALTER COLUMN "gender" SET NOT NULL`);

    // Nulabilidad varias
    await queryRunner.query(`ALTER TABLE "medical_record_condition" ALTER COLUMN "medical_record_id" DROP NOT NULL`);
    await queryRunner.query(`ALTER TABLE "medical_record_condition" ALTER COLUMN "condition_id" DROP NOT NULL`);
    await queryRunner.query(`ALTER TABLE "procedure" ALTER COLUMN "treatment_id" DROP NOT NULL`);
    await queryRunner.query(`ALTER TABLE "doctor_category" DROP CONSTRAINT IF EXISTS "doctor_category_code_key"`);
    await queryRunner.query(`ALTER TABLE "availability_slot" ALTER COLUMN "doctorId" DROP NOT NULL`);
    await queryRunner.query(`ALTER TABLE "doctor_profile" DROP CONSTRAINT IF EXISTS "doctor_profile_user_id_key"`);
    await queryRunner.query(`ALTER TABLE "doctor_profile" ALTER COLUMN "specialty" DROP DEFAULT`);

    // Índices seguros
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_patient_createdAt" ON "patient" ("createdAt")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_patient_email" ON "patient" ("email")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_patient_lastName" ON "patient" ("lastName")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_patient_name" ON "patient" ("name")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_slot_doctor_start" ON "availability_slot" ("doctorId", "start")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_26b7934e253a7b5a97f2ed3a75" ON "doctor_category_on_doctor" ("doctor_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_9835c87570e2026ec2428176db" ON "doctor_category_on_doctor" ("category_id")`);

    // FKs / UNIQUE finales (con protección)
    await addConstraintIfMissing(
      "FK_5ce4c3130796367c93cd817948e",
      `ALTER TABLE "appointment" ADD CONSTRAINT "FK_5ce4c3130796367c93cd817948e" FOREIGN KEY ("patientId") REFERENCES "patient"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );

    await addConstraintIfMissing(
      "FK_ad61b0bfc0a1c99e5bfc34501c4",
      `ALTER TABLE "citas" ADD CONSTRAINT "FK_ad61b0bfc0a1c99e5bfc34501c4" FOREIGN KEY ("patient_id") REFERENCES "patient"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );

    await addConstraintIfMissing(
      "FK_113874e0ed22dbd3791fa9976c8",
      `ALTER TABLE "citas" ADD CONSTRAINT "FK_113874e0ed22dbd3791fa9976c8" FOREIGN KEY ("doctor_user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );

    await addConstraintIfMissing(
      "FK_6636aefca0bdad8933c7cc3e394",
      `ALTER TABLE "patient" ADD CONSTRAINT "FK_6636aefca0bdad8933c7cc3e394" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );

    await addConstraintIfMissing(
      "FK_bd84c6bcb0c7f1cc8bbc9dd9a53",
      `ALTER TABLE "medical_record_condition" ADD CONSTRAINT "FK_bd84c6bcb0c7f1cc8bbc9dd9a53" FOREIGN KEY ("medical_record_id") REFERENCES "medical_record"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );

    await addConstraintIfMissing(
      "FK_99db72caeae8ad5e7cdff36b014",
      `ALTER TABLE "medical_record_condition" ADD CONSTRAINT "FK_99db72caeae8ad5e7cdff36b014" FOREIGN KEY ("condition_id") REFERENCES "condition"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );

    await addConstraintIfMissing(
      "FK_dddd1dc79ff4c20ae61b62f9add",
      `ALTER TABLE "medical_record" ADD CONSTRAINT "FK_dddd1dc79ff4c20ae61b62f9add" FOREIGN KEY ("patient_id") REFERENCES "patient"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );

    await addConstraintIfMissing(
      "FK_62f13243dd3e00156d0e3464103",
      `ALTER TABLE "payment" ADD CONSTRAINT "FK_62f13243dd3e00156d0e3464103" FOREIGN KEY ("procedure_id") REFERENCES "procedure"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );

    await addConstraintIfMissing(
      "FK_be8b4f6f3caaba6c7a6c3505534",
      `ALTER TABLE "procedure" ADD CONSTRAINT "FK_be8b4f6f3caaba6c7a6c3505534" FOREIGN KEY ("treatment_id") REFERENCES "treatment"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );

    await addConstraintIfMissing(
      "FK_a59b6bdda44e6da6f0fc8fe8d7a",
      `ALTER TABLE "treatment" ADD CONSTRAINT "FK_a59b6bdda44e6da6f0fc8fe8d7a" FOREIGN KEY ("medicalRecordId") REFERENCES "medical_record"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );

    await addConstraintIfMissing(
      "FK_de9517a8a23e56e492666445142",
      `ALTER TABLE "treatment" ADD CONSTRAINT "FK_de9517a8a23e56e492666445142" FOREIGN KEY ("treatmentTypeId") REFERENCES "treatment_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );

    await addConstraintIfMissing(
      "FK_ed56e04d73b1ad1773d74b49b40",
      `ALTER TABLE "treatment" ADD CONSTRAINT "FK_ed56e04d73b1ad1773d74b49b40" FOREIGN KEY ("statusId") REFERENCES "treatment_status"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );

    await addConstraintIfMissing(
      "FK_c755c86a717b01a8fdcf455fd92",
      `ALTER TABLE "availability_slot" ADD CONSTRAINT "FK_c755c86a717b01a8fdcf455fd92" FOREIGN KEY ("doctorId") REFERENCES "doctor_profile"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );

    await addConstraintIfMissing(
      "FK_26b7934e253a7b5a97f2ed3a759",
      `ALTER TABLE "doctor_category_on_doctor" ADD CONSTRAINT "FK_26b7934e253a7b5a97f2ed3a759" FOREIGN KEY ("doctor_id") REFERENCES "doctor_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    );

    await addConstraintIfMissing(
      "FK_9835c87570e2026ec2428176db9",
      `ALTER TABLE "doctor_category_on_doctor" ADD CONSTRAINT "FK_9835c87570e2026ec2428176db9" FOREIGN KEY ("category_id") REFERENCES "doctor_category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // down también con IF EXISTS para no romper rollbacks parciales
    await queryRunner.query(`ALTER TABLE "doctor_category_on_doctor" DROP CONSTRAINT IF EXISTS "FK_9835c87570e2026ec2428176db9"`);
    await queryRunner.query(`ALTER TABLE "doctor_category_on_doctor" DROP CONSTRAINT IF EXISTS "FK_26b7934e253a7b5a97f2ed3a759"`);
    await queryRunner.query(`ALTER TABLE "availability_slot" DROP CONSTRAINT IF EXISTS "FK_c755c86a717b01a8fdcf455fd92"`);
    await queryRunner.query(`ALTER TABLE "treatment" DROP CONSTRAINT IF EXISTS "FK_ed56e04d73b1ad1773d74b49b40"`);
    await queryRunner.query(`ALTER TABLE "treatment" DROP CONSTRAINT IF EXISTS "FK_de9517a8a23e56e492666445142"`);
    await queryRunner.query(`ALTER TABLE "treatment" DROP CONSTRAINT IF EXISTS "FK_a59b6bdda44e6da6f0fc8fe8d7a"`);
    await queryRunner.query(`ALTER TABLE "procedure" DROP CONSTRAINT IF EXISTS "FK_be8b4f6f3caaba6c7a6c3505534"`);
    await queryRunner.query(`ALTER TABLE "payment" DROP CONSTRAINT IF EXISTS "FK_62f13243dd3e00156d0e3464103"`);
    await queryRunner.query(`ALTER TABLE "medical_record" DROP CONSTRAINT IF EXISTS "FK_dddd1dc79ff4c20ae61b62f9add"`);
    await queryRunner.query(`ALTER TABLE "medical_record_condition" DROP CONSTRAINT IF EXISTS "FK_99db72caeae8ad5e7cdff36b014"`);
    await queryRunner.query(`ALTER TABLE "medical_record_condition" DROP CONSTRAINT IF EXISTS "FK_bd84c6bcb0c7f1cc8bbc9dd9a53"`);
    await queryRunner.query(`ALTER TABLE "patient" DROP CONSTRAINT IF EXISTS "FK_6636aefca0bdad8933c7cc3e394"`);
    await queryRunner.query(`ALTER TABLE "citas" DROP CONSTRAINT IF EXISTS "FK_113874e0ed22dbd3791fa9976c8"`);
    await queryRunner.query(`ALTER TABLE "citas" DROP CONSTRAINT IF EXISTS "FK_ad61b0bfc0a1c99e5bfc34501c4"`);
    await queryRunner.query(`ALTER TABLE "appointment" DROP CONSTRAINT IF EXISTS "FK_5ce4c3130796367c93cd817948e"`);

    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_9835c87570e2026ec2428176db"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_26b7934e253a7b5a97f2ed3a75"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_slot_doctor_start"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_patient_name"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_patient_lastName"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_patient_email"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_patient_createdAt"`);

    await queryRunner.query(`ALTER TABLE "doctor_profile" ALTER COLUMN "specialty" SET DEFAULT 'General'`);
    await queryRunner.query(`ALTER TABLE "doctor_profile" ADD CONSTRAINT "doctor_profile_user_id_key" UNIQUE ("user_id")`);
    await queryRunner.query(`ALTER TABLE "availability_slot" ALTER COLUMN "doctorId" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "doctor_category" ADD CONSTRAINT "doctor_category_code_key" UNIQUE ("code")`);
    await queryRunner.query(`ALTER TABLE "procedure" ALTER COLUMN "treatment_id" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "medical_record_condition" ALTER COLUMN "condition_id" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "medical_record_condition" ALTER COLUMN "medical_record_id" SET NOT NULL`);

    await queryRunner.query(`ALTER TABLE "patient" ALTER COLUMN "gender" DROP NOT NULL`);
    await queryRunner.query(`CREATE TYPE "public"."patient_gender_enum_old" AS ENUM('femenino', 'masculino')`);
    await queryRunner.query(`ALTER TABLE "patient" ALTER COLUMN "gender" TYPE "public"."patient_gender_enum_old" USING "gender"::"text"::"public"."patient_gender_enum_old"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."patient_gender_enum"`);
    await queryRunner.query(`ALTER TYPE "public"."patient_gender_enum_old" RENAME TO "patient_gender_enum"`);
    await queryRunner.query(`ALTER TABLE "patient" ALTER COLUMN "birthDate" DROP NOT NULL`);
    await queryRunner.query(`ALTER TABLE "patient" ALTER COLUMN "lastName" DROP NOT NULL`);

    await queryRunner.query(`CREATE TYPE "public"."user_role_enum_old" AS ENUM('admin', 'doctor', 'paciente')`);
    await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "role" DROP DEFAULT`);
    await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "role" TYPE "public"."user_role_enum_old" USING "role"::"text"::"public"."user_role_enum_old"`);
    await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'doctor'`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."user_role_enum"`);
    await queryRunner.query(`ALTER TYPE "public"."user_role_enum_old" RENAME TO "user_role_enum"`);

    await queryRunner.query(`ALTER TABLE "appointment" ALTER COLUMN "reason" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "appointment" ALTER COLUMN "status" SET DEFAULT 'PENDING'`);

    await queryRunner.query(`ALTER TABLE "patient" ALTER COLUMN "gender" DROP NOT NULL`);
    await queryRunner.query(`ALTER TABLE "patient" ALTER COLUMN "birthDate" DROP NOT NULL`);
    await queryRunner.query(`ALTER TABLE "patient" ALTER COLUMN "lastName" DROP NOT NULL`);

    await queryRunner.query(`ALTER TABLE "treatment" DROP COLUMN IF EXISTS "statusId"`);
    await queryRunner.query(`ALTER TABLE "treatment" DROP COLUMN IF EXISTS "treatmentTypeId"`);
    await queryRunner.query(`ALTER TABLE "treatment" DROP COLUMN IF EXISTS "medicalRecordId"`);
    await queryRunner.query(`ALTER TABLE "treatment" DROP COLUMN IF EXISTS "created_at"`);
    await queryRunner.query(`ALTER TABLE "procedure" DROP COLUMN IF EXISTS "created_at"`);

    await queryRunner.query(`ALTER TABLE "medical_record" DROP CONSTRAINT IF EXISTS "UQ_dddd1dc79ff4c20ae61b62f9add"`);
    await queryRunner.query(`ALTER TABLE "medical_record" DROP COLUMN IF EXISTS "patient_id"`);

    await queryRunner.query(`ALTER TABLE "patient" DROP COLUMN IF EXISTS "createdAt"`);
    await queryRunner.query(`ALTER TABLE "patient" DROP CONSTRAINT IF EXISTS "UQ_99e09706beaedaa5842116a302c"`);
    await queryRunner.query(`ALTER TABLE "patient" DROP COLUMN IF EXISTS "medicalRecordId"`);
    await queryRunner.query(`ALTER TABLE "patient" DROP CONSTRAINT IF EXISTS "UQ_6636aefca0bdad8933c7cc3e394"`);
    await queryRunner.query(`ALTER TABLE "patient" DROP COLUMN IF EXISTS "userId"`);
    await queryRunner.query(`ALTER TABLE "appointment" DROP COLUMN IF EXISTS "patientId"`);

    await queryRunner.query(`ALTER TABLE "doctor_profile" ADD COLUMN IF NOT EXISTS "professionalId" character varying`);
    await queryRunner.query(`ALTER TABLE "doctor_profile" ADD CONSTRAINT "doctor_profile_profid_uniq" UNIQUE ("professionalId")`);
    await queryRunner.query(`ALTER TABLE "doctor_profile" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
    await queryRunner.query(`ALTER TABLE "doctor_profile" ADD COLUMN IF NOT EXISTS "about" text`);

    await queryRunner.query(`ALTER TABLE "treatment" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
    await queryRunner.query(`ALTER TABLE "treatment" ADD COLUMN IF NOT EXISTS "status_id" uuid NOT NULL`);
    await queryRunner.query(`ALTER TABLE "treatment" ADD COLUMN IF NOT EXISTS "startDate" date NOT NULL`);
    await queryRunner.query(`ALTER TABLE "treatment" ADD COLUMN IF NOT EXISTS "treatment_type_id" uuid NOT NULL`);
    await queryRunner.query(`ALTER TABLE "treatment" ADD COLUMN IF NOT EXISTS "medical_record_id" uuid NOT NULL`);
    await queryRunner.query(`ALTER TABLE "procedure" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
    await queryRunner.query(`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "accept_terms" boolean NOT NULL DEFAULT false`);

    await queryRunner.query(`ALTER TABLE "patient" ADD COLUMN IF NOT EXISTS "userId" uuid`);
    await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS "UQ_patient_userId" ON "patient" ("userId")`);
    await queryRunner.query(`ALTER TABLE "patient" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
    await queryRunner.query(`ALTER TABLE "patient" ADD COLUMN IF NOT EXISTS "medicalRecordId" uuid`);
    await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS "patient_medicalRecordId_key" ON "patient" ("medicalRecordId")`);

    await queryRunner.query(`DROP TABLE IF EXISTS "citas"`);
    await queryRunner.query(`DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'citas_status_enum') THEN
          DROP TYPE "public"."citas_status_enum";
        END IF;
      END$$;
    `);

    const hasDoctorIdCamel = await queryRunner.hasColumn('availability_slot', 'doctorId');
    const hasDoctorIdSnake = await queryRunner.hasColumn('availability_slot', 'doctor_id');
    if (hasDoctorIdCamel && !hasDoctorIdSnake) {
      await queryRunner.query(`ALTER TABLE "availability_slot" RENAME COLUMN "doctorId" TO "doctor_id"`);
    }

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_doctor_userid" ON "doctor_profile" ("user_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_doctor_profile_userid" ON "doctor_profile" ("user_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_slot_doctor_start" ON "availability_slot" ("doctor_id", "start")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_treatment_createdAt" ON "treatment" ("createdAt")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_treatment_startDate" ON "treatment" ("startDate")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_treatment_status" ON "treatment" ("status_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_procedure_createdAt" ON "procedure" ("createdAt")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_procedure_date" ON "procedure" ("date")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_payment_date" ON "payment" ("date")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_user_email" ON "user" ("email")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_appointment_doctor" ON "appointment" ("doctor_user_id", "scheduledAt")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_appointment_patient" ON "appointment" ("createdAt", "patient_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_patient_userId" ON "patient" ("userId")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_patient_userid" ON "patient" ("userId")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_patient_createdAt" ON "patient" ("createdAt")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_patient_email" ON "patient" ("email")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_patient_lastName" ON "patient" ("lastName")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_patient_name" ON "patient" ("name")`);

    // Re-ADD FKs (down) también podría protegerse, pero en general no se ejecuta en producción
    await queryRunner.query(`ALTER TABLE "doctor_category_on_doctor" ADD CONSTRAINT "FK_dcod_category" FOREIGN KEY ("category_id") REFERENCES "doctor_category"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "doctor_category_on_doctor" ADD CONSTRAINT "FK_dcod_doctor" FOREIGN KEY ("doctor_id") REFERENCES "doctor_profile"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "doctor_profile" ADD CONSTRAINT "doctor_profile_user_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "doctor_profile" ADD CONSTRAINT "doctor_profile_userid_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "doctor_profile" ADD CONSTRAINT "FK_doctor_profile_user" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "availability_slot" ADD CONSTRAINT "FK_slot_doctor" FOREIGN KEY ("doctor_id") REFERENCES "doctor_profile"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "treatment" ADD CONSTRAINT "FK_treatment_status" FOREIGN KEY ("status_id") REFERENCES "treatment_status"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "treatment" ADD CONSTRAINT "FK_treatment_type" FOREIGN KEY ("treatment_type_id") REFERENCES "treatment_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "treatment" ADD CONSTRAINT "FK_treatment_medical_record" FOREIGN KEY ("medical_record_id") REFERENCES "medical_record"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "procedure" ADD CONSTRAINT "FK_procedure_treatment" FOREIGN KEY ("treatment_id") REFERENCES "treatment"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "payment" ADD CONSTRAINT "FK_payment_procedure" FOREIGN KEY ("procedure_id") REFERENCES "procedure"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "medical_record_condition" ADD CONSTRAINT "FK_mrc_condition" FOREIGN KEY ("condition_id") REFERENCES "condition"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "medical_record_condition" ADD CONSTRAINT "FK_mrc_medical_record" FOREIGN KEY ("medical_record_id") REFERENCES "medical_record"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "appointment" ADD CONSTRAINT "FK_appointment_doctor_user" FOREIGN KEY ("doctor_user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "appointment" ADD CONSTRAINT "FK_appointment_patient" FOREIGN KEY ("patient_id") REFERENCES "patient"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "patient" ADD CONSTRAINT "patient_user_fk" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "patient" ADD CONSTRAINT "patient_userid_fk" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "patient" ADD CONSTRAINT "FK_patient_user" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "patient" ADD CONSTRAINT "FK_patient_medicalRecord" FOREIGN KEY ("medicalRecordId") REFERENCES "medical_record"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
  }
}