# Part A: The Performance Layer (Indexing)
## B-Tree Indexing
- [x] Implement a B-Tree Index on the concertId column.
## Partial Indexing
- [x] Implement a Partial Index on the status column specifically for PENDING records. (Research why we do this)

In your README, explain why a Partial Index is better than a standard index for the "cleanup" task.
### Why Partial Index than Standard Index?
A Partial Index is significantly better for the cleanup task because our cron job only searches for tickets where `status = 'reserved'`. 

If we used a Standard Index, the database would build and maintain a massive B-Tree containing all rows (e.g., 100,000 available tickets, 50,000 sold tickets, and 500 reserved tickets). 

By using a Partial Index (`WHERE status = 'reserved'`), the database creates a tiny B-Tree containing *only* those 500 reserved tickets. This provides three major benefits:
1. **Blazing Fast Scans:** The database instantly grabs the small list of reserved tickets without sifting through tens of thousands of irrelevant records.
2. **Smaller Footprint:** It takes up a fraction of the disk space and memory.
3. **Faster Inserts/Updates:** When a ticket is sold or becomes available, the database doesn't need to waste time updating this index. It only updates when a ticket specifically enters or leaves the 'reserved' state!
# concert-ticketing-system
