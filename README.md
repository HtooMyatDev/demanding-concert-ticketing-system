# Concert Ticketing System
A high-demand concert ticketing backend built with Node.js, TypeScript, Express, TypeORM, and SQLite as a assignment for 4DaysBackendBootcamp. This system must survive thousands of simultaneous clicks for a limited number of seats. Ensure that no two people can buy the same seat, and the system must remain fast even as the database grows.
## Tech Stack
- <b>Runtime</b>: NodeJS + Typescript
- <b>Framework</b>: ExpressJS
- <b>ORM</b>:    TypeORM
- <b>Database</b>: SQLite

## What I Gained From This Project
<b>SQLite and its limitations</b>: I learned that SQLite is a lightweight relational database management system and severless database. As it is a lightweight database, it is not suitable for large projects, since it doesn't support pessimistic locking.

<b>TypeORM and its features</b>: To be honest, I didn't know a single thing about TypeORM before this project. Through this project, I learned that TypeORM is a powerful ORM that can be used with various databases, including SQLite.

<b>Partial Indexing</b>: I used to think that indexing is just a way to speed up database queries, but through this project, I learned that it is a very important concept in database design.

<b>ACID theory in Real World</b>: Before I delve into this project, I actually didn't have any idea of ACID properties. I used to think that they are just theoretical concepts during the bootcamp lecture time, but through this project, I realized that they are very important in real-world applications.

<b>Optimistic Locking</b>: I learned that optimistic locking is a way to prevent race conditions and data corruption in a concurrent environment. It is a way to ensure that the data is consistent and accurate even when multiple processes are accessing it at the same time.


## Resources & References
- [Hotel Reservation System by ByteByteGo](https://bytebytego.com/courses/system-design-interview/hotel-reservation-system) where I learned about Concurrency Issues and how to prevent them.
- [B-Tree Indexing Basics](https://shambhavishandilya.medium.com/b-tree-indexing-basics-explained-%EF%B8%8F-56ae0bda46c4) where I learned how B-Tree Indexing works.
- [Partial Indexing](https://oneuptime.com/blog/post/2026-01-30-partial-index-design/view) where I learned about Partial Indexing and how it works.
- [ACID Properties](https://www.cockroachlabs.com/glossary/distributed-db/acid-database/) a place where I discovered the theory of ACID properties.


### Setup
1. Clone the repository
```bash
git clone <repository-url>
cd concert-ticketing-system
```

2. Install dependencies
```bash
npm install
```

3. Run database migrations
```bash
npm run migration:run
# Seed database with sample data
npm run seed
# For dev server
npm run dev
# For cron job
npm run cron
```
You can change the port in the `.env` file. (Default: 3000)

### API Endpoints
#### POST /reserve — Request Body
```
{
"userId": 1,
"concertId": 1,
"category": "VIP"
}
```
#### POST /purchase — Request Body
```
{
"concertId": 1,
"userId": 1
}
```



## Part A: The Performance Layer (Indexing)
### B-Tree Indexing
- [x] Implement a B-Tree Index on the concertId column.
### Partial Indexing
- [x] Implement a Partial Index on the status column specifically for PENDING records. (Research why we do this)

### Why Partial Index than Standard Index?
A Partial Index is significantly better for the cleanup task because the cron job only searches for tickets where `status = 'reserved'`.

If Standard Index were used, the database would build and maintain a massive B-Tree containing all rows (e.g., 100,000 available tickets, 50,000 sold tickets, and 500 reserved tickets).

By using a Partial Index (`WHERE status = 'reserved'`), the database creates a tiny B-Tree containing *only* those 500 reserved tickets. This provides three major benefits:
1. **Blazing Fast Scans:** The database instantly grabs the small list of reserved tickets without sifting through tens of thousands of irrelevant records.
2. **Smaller Footprint:** It takes up a fraction of the disk space and memory.
3. **Faster Inserts/Updates:** When a ticket is sold or becomes available, the database doesn't need to waste time updating this index. It only updates when a ticket specifically enters or leaves the 'reserved' state!

## Part B: Concurrency Control (ACID)
Used `queryRunner.startTransaction()` for the reservation flow to ensure ACID properties. It initiates a new database transaction, marking the beginning of a atomic block of work. It ensures all database operations executed on that specific `queryRunner` instance are wrapped within a transaction, allowing them to be committed together via `commitTransaction()` or rolled back together if an error occurs.

### EXPLAIN QUERY PLAN Results
To definitively prove the indexes are working as intended, here are the outputs from the SQLite `EXPLAIN QUERY PLAN` command:

**1. Testing the Partial Index**
```sql
sqlite> EXPLAIN QUERY PLAN SELECT * FROM ticket WHERE status = 'reserved';
-- SEARCH ticket USING INDEX IDX_TICKET_STATUS_RESERVED (status=?)
```

**2. Testing the B-Tree Index**
```sql
sqlite> EXPLAIN QUERY PLAN SELECT * FROM ticket WHERE concertId = 1;
-- SEARCH ticket USING INDEX IDX_TICKET_CONCERT (concertId=?)
```

---

## Part B: Architectural Summary

### How the "Double-Selling" Problem was Handled
I implemented **Optimistic Locking** using a `@VersionColumn()` on the `Ticket` entity. Whenever a user attempts to reserve an available ticket, the application fetches it along with its version. If two concurrent requests try to reserve the exact same ticket simultaneously, the second transaction will detect a version mismatch (`OptimisticLockVersionMismatchError`) during the save operation. The database automatically catches this and rolls back the transaction, entirely preventing double-selling without needing restrictive pessimistic database locks (which SQLite doesn't natively support anyway).

### Why I Chose These Specific Columns for Indexing
* **`concertId` (Standard B-Tree Index):** The most common query in a ticketing app is fetching all tickets for a specific concert. A standard B-Tree index heavily optimizes these constant lookups.
* **`status` (Partial Index):** The background cron job repeatedly polls the database for expired reservations (`status = 'reserved'`). A partial index ensures that the database doesn't waste memory or disk space indexing thousands of 'sold' or 'available' tickets, making the background polling blazing fast.

### How "Vibe Coding" (AI) Impacted Architectural Decisions
I used <b>Vibe Coding (AI)</b> to understand the fundamentals of partial indexing and optimistic locking. Initially, I wasn't sure how to design the project structure, so I intended to use built-in agent to create it. However, I later realized that it would be better to create it myself to fully understand the project.

Additionally, I asked AI to create a seeder for me to test the system with a large number of tickets. Instead of following the AI's suggestion blindly, I followed a <b>HCAI (Human Centered Artifical Intelligence)</b> principle by examining and understanding the code it generated before using it. After that, I optimized the code to make it more efficient and maintainable. This is how I "Vibe Code" with AI.
