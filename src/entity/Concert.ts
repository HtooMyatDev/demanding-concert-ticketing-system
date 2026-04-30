import { Entity, PrimaryGeneratedColumn, Column, OneToMany, type Relation } from "typeorm";
import { Ticket } from "./Ticket.js";

@Entity()
export class Concert {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "varchar" })
    name!: string;

    @Column({ type: "varchar" })
    venue!: string;

    @Column({ type: "varchar" })
    date!: string;

    @Column({ type: "int", default: 0 })
    availableStock!: number;

    @OneToMany(() => Ticket, (ticket) => ticket.concertId)
    tickets!: Relation<Ticket>[];
}
