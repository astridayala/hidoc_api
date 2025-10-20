import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserIdToPatient1760947649281 implements MigrationInterface {
name = 'AddUserIdToPatient1710000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1) agregar la columna si no existe
    await queryRunner.query(`
      ALTER TABLE "patient"
      ADD COLUMN IF NOT EXISTS "userId" uuid
    `);

    // 2) crear FK (solo si no existe)
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM information_schema.table_constraints
          WHERE constraint_name = 'FK_patient_user'
        ) THEN
          ALTER TABLE "patient"
          ADD CONSTRAINT "FK_patient_user"
          FOREIGN KEY ("userId") REFERENCES "user"("id")
          ON DELETE SET NULL ON UPDATE NO ACTION;
        END IF;
      END
      $$;
    `);

    // (opcional) índice para búsquedas por userId
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_patient_userId" ON "patient" ("userId");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_patient_userId";`);
    await queryRunner.query(`
      ALTER TABLE "patient"
      DROP CONSTRAINT IF EXISTS "FK_patient_user";
    `);
    await queryRunner.query(`
      ALTER TABLE "patient"
      DROP COLUMN IF EXISTS "userId";
    `);
  }
}