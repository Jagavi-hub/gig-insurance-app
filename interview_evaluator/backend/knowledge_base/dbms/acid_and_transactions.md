# Relational Database Transactions: ACID Properties and Concurrency Anomalies

## 1. ACID Properties Defined
A database transaction is a logical unit of work encompassing one or more SQL operations executed against a persistent store:
1. **Atomicity (All-or-Nothing)**:
   All operations within a transaction must successfully commit, or the entire transaction is rolled back to its pre-transaction state. Partial execution is strictly prohibited.
2. **Consistency (Integrity Constraints)**:
   Transactions transition the database from one valid state to another, enforcing all schema constraints, foreign keys, unique indexes, check constraints, and triggers.
3. **Isolation (Concurrent Execution Separation)**:
   The execution of concurrent transactions must result in a state equivalent to running them sequentially. Intermediate, uncommitted state from one transaction should not leak into others.
4. **Durability (Persistence Guarantees)**:
   Once a transaction commits, its modifications are permanently recorded on non-volatile storage and will survive subsequent server crashes or power failures, typically achieved via Write-Ahead Logging (WAL).

## 2. Concurrency Phenomena (Anomalies)
When multiple transactions execute concurrently without strict isolation:
- **Dirty Read**: Transaction $T_1$ modifies a row without committing; Transaction $T_2$ reads the uncommitted row. If $T_1$ subsequently rolls back, $T_2$ acted on phantom/invalid data.
- **Non-Repeatable Read (Fuzzy Read)**: Transaction $T_1$ reads a row. Transaction $T_2$ modifies or deletes that row and commits. If $T_1$ re-reads the row, it observes altered data.
- **Phantom Read**: Transaction $T_1$ queries a range of rows matching a predicate (e.g., `WHERE balance > 1000`). Transaction $T_2$ inserts or deletes a row matching that predicate and commits. When $T_1$ re-executes the range query, the set of rows has changed.

## 3. SQL Standard Isolation Levels
| Isolation Level | Dirty Read | Non-Repeatable Read | Phantom Read |
|---|---|---|---|
| **Read Uncommitted** | Allowed | Allowed | Allowed |
| **Read Committed** | Prevented | Allowed | Allowed |
| **Repeatable Read** | Prevented | Prevented | Allowed (standard SQL)* |
| **Serializable** | Prevented | Prevented | Prevented |

*Note: In PostgreSQL and modern MVCC (Multi-Version Concurrency Control) engines, Repeatable Read also prevents phantom reads via snapshot isolation. Serializable is enforced via Serializable Snapshot Isolation (SSI) or Two-Phase Locking (2PL).
