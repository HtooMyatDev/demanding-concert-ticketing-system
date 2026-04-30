import { type Relation } from "typeorm";
import { Ticket } from "./Ticket.js";
export declare class Concert {
    id: number;
    name: string;
    venue: string;
    date: string;
    availableStock: number;
    tickets: Relation<Ticket>[];
}
//# sourceMappingURL=Concert.d.ts.map