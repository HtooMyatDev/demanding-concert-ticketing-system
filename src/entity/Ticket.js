var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, PrimaryGeneratedColumn, Column, Index, VersionColumn, } from "typeorm";
let Ticket = class Ticket {
    id;
    concertId;
    reservationId;
    seatNumber;
    status;
    reservedUntil;
    userId;
    category;
    version;
};
__decorate([
    PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Ticket.prototype, "id", void 0);
__decorate([
    Column({ type: "int" }),
    __metadata("design:type", Number)
], Ticket.prototype, "concertId", void 0);
__decorate([
    Column({ type: "varchar", nullable: true }),
    __metadata("design:type", Object)
], Ticket.prototype, "reservationId", void 0);
__decorate([
    Column({ type: "varchar" }),
    __metadata("design:type", String)
], Ticket.prototype, "seatNumber", void 0);
__decorate([
    Column({ type: "varchar", default: "available" }),
    Index("IDX_TICKET_STATUS_RESERVED", { where: "status = 'reserved'" }),
    __metadata("design:type", String)
], Ticket.prototype, "status", void 0);
__decorate([
    Column({ type: "datetime", nullable: true }),
    __metadata("design:type", Object)
], Ticket.prototype, "reservedUntil", void 0);
__decorate([
    Column({ type: "int", nullable: true }),
    __metadata("design:type", Number)
], Ticket.prototype, "userId", void 0);
__decorate([
    Column({ type: "varchar", nullable: true }),
    __metadata("design:type", String)
], Ticket.prototype, "category", void 0);
__decorate([
    VersionColumn(),
    __metadata("design:type", Number)
], Ticket.prototype, "version", void 0);
Ticket = __decorate([
    Entity(),
    Index("IDX_TICKET_CONCERT", ["concertId"])
], Ticket);
export { Ticket };
//# sourceMappingURL=Ticket.js.map