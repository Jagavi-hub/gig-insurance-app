# Database Indexing: B-Trees, Clustered vs. Non-Clustered Indexes, and Optimization

## 1. Why Indexes Matter
Without an index, any query filtering by column predicates (e.g. `WHERE user_id = 42`) forces a **Full Table Scan** ($O(N)$), reading every data page from storage disk into memory buffer pools. An index creates an auxiliary data structure that reduces lookup complexity to $O(\log N)$.

## 2. B-Tree and B+Tree Data Structures
Most relational database management systems (PostgreSQL, MySQL InnoDB, Oracle, SQL Server) utilize **B+Trees** for standard balanced indexes:
- **Multi-way balanced search tree**: High branching factor (fanout often 100 to 500+ pointers per internal node), meaning a tree of depth 3 or 4 can easily index hundreds of millions of rows.
- **Leaf nodes hold data pointers**: Unlike standard B-trees where keys and records are stored across internal nodes, B+Trees store all table keys and record pointers strictly in the leaf level.
- **Sequential leaf linking**: All leaf nodes form a doubly linked list, enabling lightning-fast range queries (`BETWEEN '2026-01-01' AND '2026-01-31'`) without re-traversing the tree from the root.

## 3. Clustered vs. Non-Clustered (Secondary) Indexes
1. **Clustered Index**:
   - Dictates the physical storage order of the actual table rows on disk.
   - Because physical storage can only be sorted in one arrangement, each table can have only **one** clustered index (usually the Primary Key).
   - In MySQL InnoDB, leaf pages of the clustered index contain the complete row data.

2. **Non-Clustered (Secondary) Index**:
   - Resides in a separate structure containing indexed columns plus a row locator (in InnoDB, this is the primary key; in heap tables, it is a physical row ID / tuple pointer).
   - Lookups on a secondary index that need columns not included in the index must perform an extra step called a **Bookmark Lookup / Key Lookup** back to the clustered index.
   - **Covering Index**: An index that contains all columns requested by a query (`SELECT col1, col2 WHERE col1 = 5`), allowing the query planner to satisfy the query directly from the index tree without table lookups (Index-Only Scan).
