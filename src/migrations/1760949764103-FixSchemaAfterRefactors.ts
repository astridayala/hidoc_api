import { MigrationInterface, QueryRunner } from "typeorm";

export class FixSchemaAfterRefactors1760949764103 implements MigrationInterface {
  name = 'FixSchemaAfterRefactors1760949764103';

  public async up(q: QueryRunner): Promise<void> {
    // 1) Columna userId (solo si no existe)
    await q.query(`
      ALTER TABLE "patient"
      ADD COLUMN IF NOT EXISTS "userId" uuid
    `);

    // 2) FK a user(id) (solo si no existe)
    await q.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'FK_patient_user'
        ) THEN
          ALTER TABLE "patient"
          ADD CONSTRAINT "FK_patient_user"
          FOREIGN KEY ("userId") REFERENCES "user"("id")
          ON DELETE SET NULL;
        END IF;
      END$$;
    `);

    // 3) Índice/único (si aplica) – crea solo si no existe
    await q.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_patient_userId"
      ON "patient" ("userId")
    `);

    // 🔁 Repite este patrón para cualquier otra columna/índice/constraint
    // que tu migración esté agregando y que podría existir ya.
  }

  public async down(q: QueryRunner): Promise<void> {
    // Reversiones con IF EXISTS para no fallar si ya no existen
    await q.query(`DROP INDEX IF EXISTS "UQ_patient_userId"`);
    await q.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_patient_user') THEN
          ALTER TABLE "patient" DROP CONSTRAINT "FK_patient_user";
        END IF;
      END$$;
    `);
    await q.query(`ALTER TABLE "patient" DROP COLUMN IF EXISTS "userId"`);
  }
}