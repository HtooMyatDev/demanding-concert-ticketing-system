export type TicketStatus = "sold" | "reserved" | "available";
export declare class Ticket {
    id: number;
    concertId: number;
    reservationId: string | null;
    seatNumber: string;
    status: TicketStatus;
    reservedUntil: Date | null;
    userId: number;
    category: string;
    version: number;
}
//# sourceMappingURL=Ticket.d.ts.map