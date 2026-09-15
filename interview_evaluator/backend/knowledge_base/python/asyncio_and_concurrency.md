# Python Concurrency: AsyncIO, Multithreading, and Multiprocessing

## Concurrency Paradigms in Python
CPython provides three distinct models for concurrent and parallel execution:
1. **AsyncIO (Asynchronous Cooperative Multitasking)**:
   - Built on a single-threaded event loop.
   - Tasks voluntarily yield control back to the loop using `await` expressions during I/O operations (network, disk, database sockets).
   - High concurrency with minimal memory footprint (thousands of open connections without thread context-switch overhead).
   - Ideal for I/O-bound workloads, websockets, and modern microservices (e.g., FastAPI, aiohttp).

2. **Multithreading (Preemptive Multitasking with GIL)**:
   - Uses OS-level threads managed by the kernel scheduler.
   - Constrained by the **Global Interpreter Lock (GIL)**: only one native thread executes Python bytecode at any given moment.
   - Useful for blocking I/O calls where native C extensions (like socket reads or file I/O) release the GIL.
   - Ineffective for CPU-bound computation due to thread contention and GIL thrashing.

3. **Multiprocessing (True Parallelism)**:
   - Spawns separate OS processes, each with its own independent Python interpreter and private memory space (bypassing the GIL).
   - Achieves true parallel execution across multiple CPU cores for CPU-heavy tasks (image processing, data transformation, model inference).
   - Trade-off: Higher memory consumption and inter-process communication (IPC) serialization overhead (Pickling).

## The AsyncIO Event Loop Mechanics
The event loop maintains queues of pending callbacks and scheduled tasks (`asyncio.Task`).
- When a coroutine awaits a `Future`, the event loop registers the underlying socket with OS selectors (e.g., `epoll` on Linux, `kqueue` on macOS) and switches execution to other ready coroutines.
- Blocking synchronous functions must never be executed directly on the event loop; they must be offloaded to a threadpool via `asyncio.to_thread` or `loop.run_in_executor`.
