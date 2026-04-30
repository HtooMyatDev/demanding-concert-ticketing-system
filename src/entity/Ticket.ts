import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    Index,
    VersionColumn,
} from "typeorm";

export type TicketStatus = "sold" | "reserved" | "available";

@Entity()

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
    userId!: number;

    @Column({ type: "varchar", nullable: true })
    category!: string;

    @VersionColumn()
    version!: number;
}
