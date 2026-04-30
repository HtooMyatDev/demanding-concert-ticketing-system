import type { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1777542494478 implements MigrationInterface {
    name = 'InitialSchema1777542494478'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "ticket" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "concertId" integer NOT NULL, "seatNumber" varchar NOT NULL, "status" varchar NOT NULL DEFAULT ('available'), "reservedUntil" datetime, "userId" integer, "version" integer NOT NULL)`);
        await queryRunner.query(`CREATE INDEX "IDX_89b0129dcb346cd9be42a6bbbf" ON "ticket" ("status") `);
        await queryRunner.query(`CREATE INDEX "IDX_TICKET_CONCERT" ON "ticket" ("concertId") `);
        await queryRunner.query(`CREATE TABLE "concert" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "venue" varchar NOT NULL, "date" varchar NOT NULL, "availableStock" integer NOT NULL DEFAULT (0))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "concert"`);
        await queryRunner.query(`DROP INDEX "IDX_TICKET_CONCERT"`);
        await queryRunner.query(`DROP INDEX "IDX_89b0129dcb346cd9be42a6bbbf"`);
        await queryRunner.query(`DROP TABLE "ticket"`);
    }

}
