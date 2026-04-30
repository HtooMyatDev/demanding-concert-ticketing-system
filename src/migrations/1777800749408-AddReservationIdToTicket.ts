import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddReservationIdToTicket1777800749408 implements MigrationInterface {
    name = 'AddReservationIdToTicket1777800749408'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_TICKET_STATUS_RESERVED"`);
        await queryRunner.query(`DROP INDEX "IDX_TICKET_CONCERT"`);
        await queryRunner.query(`CREATE TABLE "temporary_ticket" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "concertId" integer NOT NULL, "seatNumber" varchar NOT NULL, "status" varchar NOT NULL DEFAULT ('available'), "reservedUntil" datetime, "userId" integer, "version" integer NOT NULL, "category" varchar, "reservationId" varchar NOT NULL)`);
        await queryRunner.query(`INSERT INTO "temporary_ticket"("id", "concertId", "seatNumber", "status", "reservedUntil", "userId", "version", "category") SELECT "id", "concertId", "seatNumber", "status", "reservedUntil", "userId", "version", "category" FROM "ticket"`);
        await queryRunner.query(`DROP TABLE "ticket"`);
        await queryRunner.query(`ALTER TABLE "temporary_ticket" RENAME TO "ticket"`);
        await queryRunner.query(`CREATE INDEX "IDX_TICKET_STATUS_RESERVED" ON "ticket" ("status") WHERE status = 'reserved'`);
        await queryRunner.query(`CREATE INDEX "IDX_TICKET_CONCERT" ON "ticket" ("concertId") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_TICKET_CONCERT"`);
        await queryRunner.query(`DROP INDEX "IDX_TICKET_STATUS_RESERVED"`);
        await queryRunner.query(`ALTER TABLE "ticket" RENAME TO "temporary_ticket"`);
        await queryRunner.query(`CREATE TABLE "ticket" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "concertId" integer NOT NULL, "seatNumber" varchar NOT NULL, "status" varchar NOT NULL DEFAULT ('available'), "reservedUntil" datetime, "userId" integer, "version" integer NOT NULL, "category" varchar)`);
        await queryRunner.query(`INSERT INTO "ticket"("id", "concertId", "seatNumber", "status", "reservedUntil", "userId", "version", "category") SELECT "id", "concertId", "seatNumber", "status", "reservedUntil", "userId", "version", "category" FROM "temporary_ticket"`);
        await queryRunner.query(`DROP TABLE "temporary_ticket"`);
        await queryRunner.query(`CREATE INDEX "IDX_TICKET_CONCERT" ON "ticket" ("concertId") `);
        await queryRunner.query(`CREATE INDEX "IDX_TICKET_STATUS_RESERVED" ON "ticket" ("status") WHERE status = 'reserved'`);
    }

}
