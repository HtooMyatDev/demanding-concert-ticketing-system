import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddPartialIndex1777545084565 implements MigrationInterface {
    name = 'AddPartialIndex1777545084565'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_89b0129dcb346cd9be42a6bbbf"`);
        await queryRunner.query(`CREATE INDEX "IDX_TICKET_STATUS_RESERVED" ON "ticket" ("status") WHERE status = 'reserved'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_TICKET_STATUS_RESERVED"`);
        await queryRunner.query(`CREATE INDEX "IDX_89b0129dcb346cd9be42a6bbbf" ON "ticket" ("status") `);
    }

}
