# Python Advanced Constructs: Generators, Iterators, and Decorators

## 1. Generators and the `yield` Keyword
A generator function in Python contains one or more `yield` expressions rather than a terminal `return`. 

### How Generators Work:
- Calling a generator function does not immediately execute its body. Instead, it returns a generator iterator object that conforms to the Python Iterator Protocol (`__iter__()` and `__next__()`).
- When `next(gen)` is invoked, the function executes from the beginning (or from where it last paused) until it encounters a `yield` statement.
- The `yield` expression produces the current value back to the caller and **suspends** the generator's execution frame, freezing all local variable states and instruction pointers in memory.
- Subsequent calls to `next()` resume execution immediately after the `yield` expression until the function exits, raising `StopIteration`.

### Memory Efficiency vs. Eager Lists:
- **Eager List Evaluation**: Constructing a list of 10,000,000 items allocates memory for all elements simultaneously, consuming gigabytes of RAM ($O(N)$ space complexity).
- **Generator Streaming**: A generator generates values lazily on demand, keeping only one item in memory at a time ($O(1)$ auxiliary space complexity). This makes generators indispensable for processing large log files, database cursor streaming, and unbounded data pipelines.

## 2. Decorators and Metaprogramming
In Python, functions are first-class citizens: they can be assigned to variables, passed as arguments, and returned from other functions.
A **decorator** is a callable that takes another function as an argument, extends or alters its behavior, and returns the modified callable:
```python
import functools
import time

def timing_decorator(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        duration = time.perf_counter() - start
        print(f"{func.__name__} executed in {duration:.4f}s")
        return result
    return wrapper
```
- `@functools.wraps`: Essential to preserve the decorated function's metadata (`__name__`, `__doc__`, `__annotations__`), preventing debugging opacity.
- Common uses: Authentication checks, rate limiting, distributed tracing, memoization / caching (`@functools.lru_cache`), and input validation.
