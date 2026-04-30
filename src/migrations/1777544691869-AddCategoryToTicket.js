export class AddCategoryToTicket1777544691869 {
    name = 'AddCategoryToTicket1777544691869';
    async up(queryRunner) {
        await queryRunner.query(`DROP INDEX "IDX_TICKET_CONCERT"`);
        await queryRunner.query(`DROP INDEX "IDX_89b0129dcb346cd9be42a6bbbf"`);
        await queryRunner.query(`CREATE TABLE "temporary_ticket" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "concertId" integer NOT NULL, "seatNumber" varchar NOT NULL, "status" varchar NOT NULL DEFAULT ('available'), "reservedUntil" datetime, "userId" integer, "version" integer NOT NULL, "category" varchar)`);
        await queryRunner.query(`INSERT INTO "temporary_ticket"("id", "concertId", "seatNumber", "status", "reservedUntil", "userId", "version") SELECT "id", "concertId", "seatNumber", "status", "reservedUntil", "userId", "version" FROM "ticket"`);
        await queryRunner.query(`DROP TABLE "ticket"`);
        await queryRunner.query(`ALTER TABLE "temporary_ticket" RENAME TO "ticket"`);
        await queryRunner.query(`CREATE INDEX "IDX_TICKET_CONCERT" ON "ticket" ("concertId") `);
        await queryRunner.query(`CREATE INDEX "IDX_89b0129dcb346cd9be42a6bbbf" ON "ticket" ("status") `);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX "IDX_89b0129dcb346cd9be42a6bbbf"`);
        await queryRunner.query(`DROP INDEX "IDX_TICKET_CONCERT"`);
        await queryRunner.query(`ALTER TABLE "ticket" RENAME TO "temporary_ticket"`);
        await queryRunner.query(`CREATE TABLE "ticket" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "concertId" integer NOT NULL, "seatNumber" varchar NOT NULL, "status" varchar NOT NULL DEFAULT ('available'), "reservedUntil" datetime, "userId" integer, "version" integer NOT NULL)`);
        await queryRunner.query(`INSERT INTO "ticket"("id", "concertId", "seatNumber", "status", "reservedUntil", "userId", "version") SELECT "id", "concertId", "seatNumber", "status", "reservedUntil", "userId", "version" FROM "temporary_ticket"`);
        await queryRunner.query(`DROP TABLE "temporary_ticket"`);
        await queryRunner.query(`CREATE INDEX "IDX_89b0129dcb346cd9be42a6bbbf" ON "ticket" ("status") `);
        await queryRunner.query(`CREATE INDEX "IDX_TICKET_CONCERT" ON "ticket" ("concertId") `);
    }
}
//# sourceMappingURL=1777544691869-AddCategoryToTicket.js.map