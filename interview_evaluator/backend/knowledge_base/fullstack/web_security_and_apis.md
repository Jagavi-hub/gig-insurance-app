# Web Security, Authentication, and Modern API Architectures

## Modern Web Authentication & Security
1. **JSON Web Tokens (JWT) & Stateless Auth**:
   - Structure: Header (algorithm), Payload (claims like user ID, expiration `exp`, roles), and Signature (`HMAC-SHA256` or `RSA`).
   - Stateless: The server verifies the token signature cryptographically without querying session databases on every request.
   - Storage Best Practice: Stored in `HttpOnly`, `Secure`, `SameSite=Strict` cookies to mitigate Cross-Site Scripting (XSS) extraction.
   - Revocation Strategy: Short-lived access tokens (e.g. 15 minutes) paired with rotating refresh tokens stored in a secure Redis cache.

2. **Mitigating Common Vulnerabilities**:
   - **Cross-Site Scripting (XSS)**: Injection of malicious scripts executed in user browsers. Defenses: Context-aware HTML escaping, Content Security Policy (CSP), avoiding `dangerouslySetInnerHTML`.
   - **Cross-Site Request Forgery (CSRF)**: Forcing an authenticated browser to execute unwanted actions. Defenses: Anti-CSRF tokens, SameSite cookie attributes, custom request headers (`X-Requested-With`).
   - **SQL Injection**: Defenses: Parameterized queries, prepared statements, and ORMs (SQLAlchemy, Prisma).

## REST vs GraphQL vs RPC
- **REST**: Resource-oriented, standard HTTP verbs (`GET`, `POST`, `PUT`, `DELETE`), status codes, and HTTP caching. May suffer from over-fetching or under-fetching (N+1 queries).
- **GraphQL**: Schema-driven, single endpoint where clients request exact fields needed, resolving over-fetching. Complex query complexity limits and caching strategies required.
- **gRPC**: Protocol Buffers over HTTP/2, binary serialization, low latency, bidirectional streaming; optimal for internal service-to-service microservice backbones.
