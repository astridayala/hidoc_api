import { MigrationInterface, QueryRunner } from "typeorm";

export class InitUserDoctorPatient1762656458054 implements MigrationInterface {
  name = 'InitUserDoctorPatient1762656458054';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 0) Extensión para UUID (si la usan)
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pgcrypto') THEN
          CREATE EXTENSION pgcrypto;
        END IF;
      END$$;
    `);

    // 1) ENUMS
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role_enum') THEN
          CREATE TYPE user_role_enum AS ENUM ('doctor','paciente','admin');
        END IF;
      END$$;
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'patient_gender_enum') THEN
          CREATE TYPE patient_gender_enum AS ENUM ('masculino','femenino','otro');
        END IF;
      END$$;
    `);

    // 2) TABLAS
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "user" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(150) UNIQUE NOT NULL,
        name  VARCHAR(150) NOT NULL,
        role  user_role_enum NOT NULL DEFAULT 'paciente',
        password VARCHAR(200) NOT NULL,
        "createdAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "doctor_profile" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id  UUID NOT NULL,
        "fullName" VARCHAR(150) NOT NULL,
        specialty  VARCHAR(100) DEFAULT 'General',
        price      INTEGER      DEFAULT 0,
        rating     NUMERIC(3,2) DEFAULT 0,
        about      TEXT,
        "isOnline" BOOLEAN      DEFAULT FALSE,
        "professionalId" VARCHAR(50)
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "patient" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId"   UUID NOT NULL,
        "firstName" VARCHAR(100) NOT NULL,
        "lastName"  VARCHAR(100) NOT NULL,
        phone    VARCHAR(25),
        email    VARCHAR(150) UNIQUE NOT NULL,
        birthDate DATE,
        gender    patient_gender_enum DEFAULT 'otro',
        address   TEXT,
        "createdAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
      );
    `);

    // 3) FKs y UNIQUE 1–1 (doctor_profile.user_id y patient.userId)
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'doctor_profile_user_fk'
        ) THEN
          ALTER TABLE "doctor_profile"
            ADD CONSTRAINT doctor_profile_user_fk
            FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE;
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'doctor_profile_user_unique'
        ) THEN
          ALTER TABLE "doctor_profile"
            ADD CONSTRAINT doctor_profile_user_unique UNIQUE (user_id);
        END IF;
      END$$;
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'patient_user_fk'
        ) THEN
          ALTER TABLE "patient"
            ADD CONSTRAINT patient_user_fk
            FOREIGN KEY ("userId") REFERENCES "user"(id) ON DELETE CASCADE;
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'patient_user_unique'
        ) THEN
          ALTER TABLE "patient"
            ADD CONSTRAINT patient_user_unique UNIQUE ("userId");
        END IF;
      END$$;
    `);

    // 4) Índices útiles
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_user_email      ON "user"(email);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_doctor_userid   ON "doctor_profile"(user_id);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_patient_userid  ON "patient"("userId");`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Borrado en orden inverso
    await queryRunner.query(`DROP INDEX IF EXISTS idx_patient_userid;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_doctor_userid;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_user_email;`);

    // Eliminar constraints explícitamente (por si no cae con DROP TABLE CASCADE)
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'patient_user_fk') THEN
          ALTER TABLE "patient" DROP CONSTRAINT patient_user_fk;
        END IF;
        IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'patient_user_unique') THEN
          ALTER TABLE "patient" DROP CONSTRAINT patient_user_unique;
        END IF;
      END$$;
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'doctor_profile_user_fk') THEN
          ALTER TABLE "doctor_profile" DROP CONSTRAINT doctor_profile_user_fk;
        END IF;
        IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'doctor_profile_user_unique') THEN
          ALTER TABLE "doctor_profile" DROP CONSTRAINT doctor_profile_user_unique;
        END IF;
      END$$;
    `);

    await queryRunner.query(`DROP TABLE IF EXISTS "patient" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "doctor_profile" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user" CASCADE;`);

    // Tipos ENUM (solo si nadie más los usa)
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'patient_gender_enum') THEN
          DROP TYPE patient_gender_enum;
        END IF;
        IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role_enum') THEN
          DROP TYPE user_role_enum;
        END IF;
      END$$;
    `);
  }
}
