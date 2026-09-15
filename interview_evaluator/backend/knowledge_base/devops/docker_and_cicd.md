# DevOps: Containerization, Docker Layer Caching, and Deployment Strategies

## Docker Internals & Layer Caching
- **Layer Immutability**: Each instruction in a `Dockerfile` (`RUN`, `COPY`, `ADD`) creates a read-only intermediate layer.
- **Cache Invalidation**: Docker caches layers sequentially. If an early layer changes (e.g. copying entire source before installing dependencies), all subsequent layers must be rebuilt from scratch.
- **Optimization Best Practices**:
  - Multi-stage builds: Compiling code in a heavyweight build image and copying only the binary/artifacts to a minimal alpine/distroless production runtime.
  - Dependency isolation: Copy `package.json` or `requirements.txt` first, run install, and copy source code last to maximize cache hit rates.
  - Non-root users: Enforce running application processes as dedicated unprivileged users for security defense in depth.

## Modern Zero-Downtime Deployment Strategies
1. **Blue-Green Deployments**:
   - Two identical production environments (Blue is live, Green is idle).
   - New release deployed and smoke-tested on Green. Load balancer router flips traffic to Green instantaneously.
   - Immediate rollback capability: flip back to Blue if errors spike.
2. **Canary Releases**:
   - Incremental traffic routing (e.g., 2% -> 10% -> 50% -> 100%) to a subset of instances running the new version.
   - Monitors error rates, latency (p99), and system metrics before full promotion.
3. **Rolling Updates**:
   - Incrementally replacing old pods/instances with new ones while ensuring a minimum percentage remains available.
