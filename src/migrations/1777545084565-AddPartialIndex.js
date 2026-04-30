export class AddPartialIndex1777545084565 {
    name = 'AddPartialIndex1777545084565';
    async up(queryRunner) {
        await queryRunner.query(`DROP INDEX "IDX_89b0129dcb346cd9be42a6bbbf"`);
        await queryRunner.query(`CREATE INDEX "IDX_TICKET_STATUS_RESERVED" ON "ticket" ("status") WHERE status = 'reserved'`);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX "IDX_TICKET_STATUS_RESERVED"`);
        await queryRunner.query(`CREATE INDEX "IDX_89b0129dcb346cd9be42a6bbbf" ON "ticket" ("status") `);
    }
}
//# sourceMappingURL=1777545084565-AddPartialIndex.js.map