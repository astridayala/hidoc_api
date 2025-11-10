import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMessageTable1762786687200 implements MigrationInterface {
  name = "AddMessageTable1762786687200";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "messages" (
        "id" SERIAL PRIMARY KEY,
        "senderId" INTEGER NOT NULL,
        "receiverId" INTEGER NOT NULL,
        "content" TEXT NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now()
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS "messages"');
  }
}