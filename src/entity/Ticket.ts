import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    Index,
    VersionColumn,
} from "typeorm";

export type TicketStatus = "sold" | "reserved" | "available";

@Entity()
// B-Tree index on concertId for fast concert-based lookups
@Index("IDX_TICKET_CONCERT", ["concertId"])
export class Ticket {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "int" })
    concertId!: number;

    @Column({ type: "varchar" })
    seatNumber!: string;

    @Column({ type: "varchar", default: "available" })
    @Index("IDX_TICKET_STATUS_RESERVED", { where: "status = 'reserved'" })
    status!: TicketStatus;

    @Column({ type: "datetime", nullable: true })
    reservedUntil!: Date | null;

    @Column({ type: "int", nullable: true })
    userId!: number; // The user trying to buy it

    @Column({ type: "varchar", nullable: true })
    category!: string;
    // OPTIMISTIC LOCKING:
    // This is a special column that TypeORM uses to prevent "Lost Updates".
    // Every time the row is saved, this number increases. If two processes
    // try to save the same row, the second one will fail.
    @VersionColumn()
    version!: number;
}
