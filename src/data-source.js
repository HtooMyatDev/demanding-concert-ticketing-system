import "reflect-metadata";
import { DataSource } from "typeorm";
export const AppDataSource = new DataSource({
    type: "better-sqlite3",
    database: "ticketing.db",
    synchronize: false,
    logging: true,
    entities: ["src/entity/*.ts"],
    migrations: ["src/migrations/*.ts"],
});
//# sourceMappingURL=data-source.js.map