import "reflect-metadata";
import { DataSource } from "typeorm";
import { Concert } from "./entity/Concert.js";
import { Ticket } from "./entity/Ticket.js";

export const AppDataSource = new DataSource({
    type: "better-sqlite3",
    database: "ticketing.db",
    synchronize: false,
    logging: false, // Reduced logging for stress testing
    entities: [Concert, Ticket],
    migrations: ["src/migrations/*.ts"],
    prepareDatabase: (db: any) => {
        db.pragma('journal_mode = WAL');
        db.pragma('synchronous = NORMAL');
        db.pragma('busy_timeout = 5000'); // Wait up to 5 seconds for locks
    }
});
