import { AppDataSource } from "./data-source.js";
import { Concert } from "./entity/Concert.js";
import { Ticket } from "./entity/Ticket.js";

async function seed() {
    await AppDataSource.initialize();

    const concertRepo = AppDataSource.getRepository(Concert);
    const ticketRepo = AppDataSource.getRepository(Ticket);

    // Check if we already have data
    const existingConcerts = await concertRepo.count();
    if (existingConcerts > 0) {
        console.log("Mock data already exists. Exiting.");
        process.exit(0);
    }

    console.log("Inserting mock data...");

    const concert1 = concertRepo.create({
        name: "Symphony Orchestra",
        venue: "Grand Hall",
        date: "2026-06-15T20:00:00Z",
        availableStock: 20
    });

    const concert2 = concertRepo.create({
        name: "Rock Festival",
        venue: "Outdoor Arena",
        date: "2026-07-20T18:00:00Z",
        availableStock: 5
    });

    await concertRepo.save([concert1, concert2]);

    const tickets: Ticket[] = [];

    // Create tickets for concert 1
    for (let i = 1; i <= concert1.availableStock; i++) {
        tickets.push(ticketRepo.create({
            concertId: concert1.id,
            seatNumber: `A${i}`,
            status: "available"
        }));
    }

    // Create tickets for concert 2
    for (let i = 1; i <= concert2.availableStock; i++) {
        tickets.push(ticketRepo.create({
            concertId: concert2.id,
            seatNumber: `B${i}`,
            status: "available"
        }));
    }

    await ticketRepo.save(tickets);

    console.log("Mock data inserted successfully!");
    process.exit(0);
}

seed().catch(err => {
    console.error("Error during seeding:", err);
    process.exit(1);
});
