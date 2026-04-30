var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Ticket } from "./Ticket.js";
let Concert = class Concert {
    id;
    name;
    venue;
    date;
    availableStock;
    tickets;
};
__decorate([
    PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Concert.prototype, "id", void 0);
__decorate([
    Column({ type: "varchar" }),
    __metadata("design:type", String)
], Concert.prototype, "name", void 0);
__decorate([
    Column({ type: "varchar" }),
    __metadata("design:type", String)
], Concert.prototype, "venue", void 0);
__decorate([
    Column({ type: "varchar" }),
    __metadata("design:type", String)
], Concert.prototype, "date", void 0);
__decorate([
    Column({ type: "int", default: 0 }),
    __metadata("design:type", Number)
], Concert.prototype, "availableStock", void 0);
__decorate([
    OneToMany(() => Ticket, (ticket) => ticket.concertId),
    __metadata("design:type", Array)
], Concert.prototype, "tickets", void 0);
Concert = __decorate([
    Entity()
], Concert);
export { Concert };
//# sourceMappingURL=Concert.js.map