import { AppDataSource } from "./data-source.js";
import { Concert } from "./entity/Concert.js";
import { Ticket } from "./entity/Ticket.js";

async function testRollback() {
    await AppDataSource.initialize();

    const concertRepo = AppDataSource.getRepository(Concert);
    const ticketRepo = AppDataSource.getRepository(Ticket);

    console.log("\n--- Setting up Test Data ---");
    const concert = concertRepo.create({
        name: "Rollback Test Concert",
        venue: "Test Venue",
        date: new Date().toISOString(),
        availableStock: 5
    });
    await concertRepo.save(concert);

    const ticket = ticketRepo.create({
        concertId: concert.id,
        seatNumber: "TEST-RB-1",
        status: "available",
        version: 1
    });
    await ticketRepo.save(ticket);

    console.log(`[Initial State] Concert Stock: ${concert.availableStock}`);

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        console.log(`\n--- Starting Transaction ---`);
        console.log(`[Step 1] Decrementing concert stock by 1...`);
        await queryRunner.manager.decrement(Concert, { id: concert.id }, "availableStock", 1);

        const intermediateConcert = await queryRunner.manager.findOneBy(Concert, { id: concert.id });
        console.log(`[Intermediate State] Stock inside transaction is now: ${intermediateConcert?.availableStock} (Uncommitted)`);

        console.log(`[Step 2] Attempting to save Reservation ticket...`);

        // Simulating a database/logic failure exactly when saving the reservation
        throw new Error("CRITICAL FAILURE: Ticket record failed to save!");

        // The ticket save never finishes and we jump to the catch block...

    } catch (error: any) {
        console.error(`\n[Error Caught] ${error.message}`);
        console.log(`[Rollback] Reverting all changes in this transaction...`);
        await queryRunner.rollbackTransaction();
    } finally {
        await queryRunner.release();
    }

    console.log(`\n--- Final Verification ---`);
    const finalConcert = await concertRepo.findOneBy({ id: concert.id });
    console.log(`[Final State] Concert Stock in Database: ${finalConcert?.availableStock}`);

    if (finalConcert?.availableStock === 5) {
        console.log(`\nPROOF SUCCESSFUL: Stock was correctly rolled back to 5 after the reservation failed!`);
    } else {
        console.log(`\nPROOF FAILED: Stock was lost. Current stock: ${finalConcert?.availableStock}`);
    }

    process.exit(0);
}

testRollback().catch(console.error);
