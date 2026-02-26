# 🛠️ VIKAS – Technology Stack
**Virtually Intelligent Knowledge Assisted Shopping**  
**Version:** 2.0 | **Last Updated:** February 2026

---

## Table of Contents

1. [Stack Overview](#1-stack-overview)
2. [Frontend – React Native](#2-frontend--react-native)
3. [Primary Backend – Spring Boot](#3-primary-backend--spring-boot)
4. [Fallback Backend – Node.js](#4-fallback-backend--nodejs)
5. [Database & Storage](#5-database--storage)
6. [AI & Machine Learning](#6-ai--machine-learning)
7. [AR Module](#7-ar-module)
8. [DevOps & Infrastructure](#8-devops--infrastructure)
9. [Security](#9-security)
10. [Testing](#10-testing)
11. [Developer Tooling](#11-developer-tooling)
12. [Architecture Decision Records](#12-architecture-decision-records)

---

## 1. Stack Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        VIKAS TECH STACK                         │
├──────────────────────────┬──────────────────────────────────────┤
│  FRONTEND                │  React Native (Expo) + RN Web        │
│  PRIMARY BACKEND         │  Spring Boot 3.2 (Java 21)           │
│  FALLBACK / AI BACKEND   │  Node.js 20 + Express.js             │
│  DATABASE                │  PostgreSQL 16 (Aiven Cloud)         │
│  CACHE                   │  Redis (Upstash)                     │
│  VECTOR STORE            │  pgvector (PostgreSQL extension)     │
│  AI / LLM                │  Groq API (LLaMA 3.1 70B)           │
│  AR ENGINE               │  Mediapipe + Vision Camera           │
│  OBJECT STORAGE          │  Cloudflare R2                       │
│  CDN                     │  Cloudflare                          │
│  CI/CD                   │  GitHub Actions                      │
│  MONITORING              │  Grafana + Prometheus                │
└──────────────────────────┴──────────────────────────────────────┘
```

---

## 2. Frontend – React Native

The entire frontend is built on a **single React Native codebase** that compiles to iOS, Android, and Web simultaneously using `react-native-web` and Expo's web target — eliminating the need for separate Next.js or native projects.

### 2.1 Core Framework

| Technology | Version | Purpose |
|---|---|---|
| **React Native** | 0.74+ | Core cross-platform UI framework |
| **Expo SDK** | 51+ | Managed workflow, native module access |
| **Expo Router** | 3.x | File-based routing (like Next.js App Router, for RN) |
| **react-native-web** | 0.19+ | Renders React Native components to DOM for web |
| **TypeScript** | 5.x | Static typing across all frontend code |

**Why Expo over bare React Native:**
Expo's managed workflow provides OTA (over-the-air) updates, push notifications, EAS Build for CI/CD, and a curated set of native modules — dramatically reducing native configuration overhead while still allowing ejection if needed.

### 2.2 Navigation

| Technology | Version | Purpose |
|---|---|---|
| **Expo Router** | 3.x | Primary navigation (file-based, deep-link ready) |
| **React Navigation** | 6.x | Underlying navigator engine used by Expo Router |

Expo Router uses a file-system convention (`app/` directory) providing automatic deep linking, web URL routing, and shared layout components across mobile and web.

### 2.3 State Management

| Technology | Version | Purpose |
|---|---|---|
| **Zustand** | 4.x | Global client state (auth, cart, UI flags) |
| **TanStack Query (React Query)** | 5.x | Server state, caching, background refetch |
| **React Context** | Built-in | Auth session context, theme context |

**Pattern:** TanStack Query owns all API-fetched data with automatic stale-while-revalidate caching. Zustand manages lightweight UI state that doesn't need server sync (modal open/close, selected filters, etc.).

### 2.4 Styling

| Technology | Version | Purpose |
|---|---|---|
| **NativeWind** | 4.x | Tailwind CSS utility classes for React Native |
| **React Native StyleSheet** | Built-in | Fallback for complex platform-specific styles |
| **Expo Google Fonts** | Latest | Typography (Inter, Poppins) |

NativeWind translates Tailwind class names to React Native `StyleSheet` objects at build time, giving the developer experience of Tailwind on both mobile and web without runtime overhead.

### 2.5 Networking & Real-Time

| Technology | Version | Purpose |
|---|---|---|
| **Axios** | 1.x | HTTP client with interceptors for auth token injection |
| **Socket.IO Client** | 4.x | WebSocket client for live inventory + reservation updates |
| **TanStack Query** | 5.x | Automatic polling, background sync, optimistic updates |

### 2.6 Storage & Offline

| Technology | Version | Purpose |
|---|---|---|
| **Expo SecureStore** | Latest | Encrypted JWT token storage (mobile) |
| **MMKV** | 2.x | High-performance key-value store for offline product cache |
| **AsyncStorage** | Latest | Fallback storage for web |

MMKV (by Marc Rousavy) is 10x faster than AsyncStorage, making it ideal for caching the 28k product catalog for offline browsing scenarios.

### 2.7 Media & Device

| Technology | Version | Purpose |
|---|---|---|
| **Expo Camera / Vision Camera** | Latest | Camera access for AR Try-On |
| **Expo Image** | Latest | Optimized image loading with blurhash placeholders |
| **Expo AV** | Latest | Video playback for product demos |
| **react-native-maps** | Latest | Store locator map view |
| **Expo Location** | Latest | "Stores near me" geolocation |

### 2.8 UI Components & Utilities

| Technology | Version | Purpose |
|---|---|---|
| **react-native-qrcode-svg** | Latest | QR code display for reservations |
| **react-native-reanimated** | 3.x | Smooth 60fps animations (cart, modals, transitions) |
| **react-native-gesture-handler** | Latest | Swipe gestures, bottom sheets |
| **@gorhom/bottom-sheet** | Latest | Product filters, reservation modal on mobile |
| **react-native-svg** | Latest | SVG icons, charts |
| **Victory Native** | Latest | Analytics charts (admin dashboard) |
| **Expo Notifications** | Latest | Push notification handling (reservation reminders) |
| **Expo Haptics** | Latest | Tactile feedback on key actions |

### 2.9 Web-Specific Adaptations

When running on web via `react-native-web`:

| Mobile Pattern | Web Equivalent |
|---|---|
| Bottom Tab Bar | Left Sidebar Navigation |
| Bottom Sheet (filters) | Right Panel / Drawer |
| Stack Navigator | Browser History + URL routing |
| SecureStore | `HttpOnly` cookie (JWT) |
| MMKV | localStorage (via polyfill) |
| Push Notifications | Browser Web Push API |

---

## 3. Primary Backend – Spring Boot

Spring Boot serves as the **production-grade primary backend**, owning all transactional and business-critical services: authentication, product catalog, inventory, orders, reservations, and analytics.

### 3.1 Core Framework

| Technology | Version | Purpose |
|---|---|---|
| **Java** | 21 (LTS) | Language — virtual threads, records, pattern matching |
| **Spring Boot** | 3.2.x | Auto-configuration, embedded server, DI container |
| **Spring MVC** | 6.x | REST controllers, request mapping |
| **Spring Data JPA** | 3.x | ORM layer, repository pattern |
| **Hibernate** | 6.x | JPA implementation, SQL generation |
| **Maven / Gradle** | Latest | Build tool and dependency management |

**Why Java 21:** Virtual threads (Project Loom) allow high-throughput blocking I/O (JDBC, HTTP calls) without the complexity of reactive programming — critical for handling the 10,000+ concurrent users target during peak events.

### 3.2 Security

| Technology | Version | Purpose |
|---|---|---|
| **Spring Security** | 6.x | Security filter chain, method-level authorization |
| **JJWT (io.jsonwebtoken)** | 0.12.x | JWT generation, parsing, and validation |
| **bcrypt (Spring Security Crypto)** | Built-in | Password hashing (cost factor 12) |
| **Spring Session + Redis** | Latest | Server-side session/token storage for revocation |

### 3.3 Database & Caching

| Technology | Version | Purpose |
|---|---|---|
| **PostgreSQL JDBC Driver** | 42.x | Database connectivity |
| **HikariCP** | Built-in | High-performance JDBC connection pool |
| **Spring Data JPA Specifications** | Built-in | Dynamic query building for product filters |
| **Spring Cache** | Built-in | Declarative caching (`@Cacheable`) |
| **Lettuce (Redis Client)** | Built-in | Non-blocking Redis client for Spring |
| **Flyway** | 9.x | Database schema versioning and migrations |

### 3.4 API & Documentation

| Technology | Version | Purpose |
|---|---|---|
| **Springdoc OpenAPI** | 2.x | Auto-generates Swagger UI from code annotations |
| **Jackson** | 2.x | JSON serialization/deserialization |
| **ModelMapper** | 3.x | Entity ↔ DTO mapping |
| **Spring Validation (Hibernate Validator)** | Built-in | Request body validation (`@Valid`, `@NotNull`, etc.) |

### 3.5 Real-Time & Messaging

| Technology | Version | Purpose |
|---|---|---|
| **Spring WebSocket** | Built-in | WebSocket endpoint configuration |
| **STOMP over WebSocket** | Built-in | Messaging protocol for inventory/reservation events |
| **Spring Scheduler** | Built-in | `@Scheduled` tasks (slot expiry, analytics aggregation) |

### 3.6 Utilities

| Technology | Purpose |
|---|---|
| **ZXing (Zebra Crossing)** | QR code image generation for reservations |
| **Lombok** | Boilerplate reduction (`@Getter`, `@Builder`, `@Slf4j`) |
| **Spring Boot Actuator** | Health checks, metrics exposure for monitoring |
| **MapStruct** | Compile-time DTO mapping (alternative to ModelMapper) |

### 3.7 Spring Boot Service Responsibilities

| Service | Owns |
|---|---|
| **Auth Service** | Register, Login, JWT, Roles, Token Revocation |
| **Product Service** | Catalog CRUD, Filtering, Search, Pagination |
| **Inventory Service** | Stock sync, Reservation locking, WebSocket broadcast |
| **Store Service** | Store data, Hours, Geolocation queries |
| **Cart Service** | Cart lifecycle, Quantity management |
| **Order Service** | Order creation, Status management, History |
| **Reservation Service** | Slot management, QR generation, State machine |
| **Analytics Service** | Aggregation queries, Dashboard KPIs, Scheduled reports |
| **Gateway / Routing** | Request routing to Node.js AI service, Fallback logic |

---

## 4. Fallback Backend – Node.js

The Node.js backend is a **purpose-built extension layer**, not a redundant copy of Spring Boot. It owns AI/LLM orchestration, push notifications, AR asset delivery, and serves as an automatic failover backend for core APIs if Spring Boot becomes unavailable.

### 4.1 Core Framework

| Technology | Version | Purpose |
|---|---|---|
| **Node.js** | 20 LTS | JavaScript runtime |
| **Express.js** | 4.x | REST API framework |
| **TypeScript** | 5.x | Static typing |
| **Prisma** | 5.x | Type-safe ORM + database schema management |
| **Zod** | 3.x | Runtime schema validation for env vars and request bodies |

### 4.2 AI & LLM

| Technology | Version | Purpose |
|---|---|---|
| **Groq SDK** | Latest | LLM inference API client (LLaMA 3.1 70B, Mixtral) |
| **LangChain.js** | 0.2.x | RAG pipeline, prompt templates, conversation chains |
| **OpenAI SDK** | 4.x | Embedding generation (`text-embedding-3-small`) |
| **pgvector (via Prisma)** | Latest | Vector similarity queries from Node.js |
| **LangChain Memory** | Built-in | Redis-backed conversation session memory |

### 4.3 Real-Time & Queues

| Technology | Version | Purpose |
|---|---|---|
| **Socket.IO** | 4.x | WebSocket server for real-time events |
| **Bull** | 4.x | Redis-backed job queue for scheduled notifications |
| **ioredis** | 5.x | Redis client for cache, sessions, queue |

### 4.4 Notifications

| Technology | Purpose |
|---|---|
| **Expo Server SDK** | Push notifications to iOS, Android, and Web |
| **Bull Queue** | Scheduled reminder sends (reservation slot -1hr) |
| **Nodemailer** | Email confirmation fallback |

### 4.5 Node.js Service Responsibilities

| Service | Owns |
|---|---|
| **AI Query Service** | Intent detection, RAG retrieval, Groq LLM calls |
| **Embedding Service** | Generate + upsert pgvector embeddings for products |
| **Agent Orchestrator** | Multi-step shopping assistant (search → compare → recommend) |
| **Notification Service** | Push notification delivery + scheduling |
| **AR Asset Service** | Serve signed R2 URLs for 3D model downloads |
| **Analytics AI Service** | AI query trend clustering, topic analysis |
| **Fallback API Service** | Read-only product/inventory endpoints when Spring Boot is down |

### 4.6 Fallback Strategy

```
Every 10 seconds:
  Spring Boot Gateway pings → /actuator/health

  3 consecutive failures?
    → Set Redis flag: springboot:healthy = false
    → Nginx / Gateway reroutes ALL traffic to Node.js
    → Node.js reads from Redis-mirrored critical data
    → Node.js returns read-only responses (no writes for orders/reservations)
    → Alerts sent to DevOps team

  Spring Boot recovers?
    → Set Redis flag: springboot:healthy = true
    → Traffic reroutes back to Spring Boot within 30 seconds
    → Reconciliation job syncs any fallback-period data
```

---

## 5. Database & Storage

### 5.1 Primary Database

| Technology | Version | Purpose |
|---|---|---|
| **PostgreSQL** | 16 | Primary relational database |
| **Aiven Cloud** | Managed | Hosted PostgreSQL with auto-failover, daily backups |
| **pgvector** | 0.7.x | Vector similarity search extension (RAG embeddings) |
| **Full-Text Search** | Built-in | `tsvector` + `tsquery` for product catalog search |

**Why PostgreSQL for everything (including vectors):**
Using pgvector keeps the architecture simple — one database for transactional data, full-text search, and semantic vector search. No additional vector database (Pinecone, Weaviate) to manage. This is sufficient for 28k products and scales to millions with proper indexing.

**Key Indexes:**
```sql
-- Product full-text search
CREATE INDEX idx_product_search ON "vikas-dataset" USING GIN(search_vector);

-- Vector similarity (ANN via IVFFlat)
CREATE INDEX idx_product_embedding ON "vikas-dataset"
  USING ivfflat(embedding vector_cosine_ops) WITH (lists = 100);

-- Inventory queries
CREATE INDEX idx_inventory_store_product ON "vikas-inventory"(store_id, product_id);

-- Reservation slot queries
CREATE INDEX idx_reservation_slot ON "vikas-reservations"(store_id, slot_time, status);
```

### 5.2 Cache Layer

| Technology | Version | Purpose |
|---|---|---|
| **Redis** | 7.x | Cache, sessions, job queues, fallback data mirror |
| **Upstash** | Managed | Serverless Redis (pay-per-request, globally distributed) |

**Cache Strategy:**

| Data | TTL | Reason |
|---|---|---|
| Product detail | 10 minutes | Rarely changes |
| Product list (paginated) | 5 minutes | Moderate churn |
| Inventory count | 30 seconds | Frequently updated |
| Analytics KPIs | 60 seconds | Near-real-time |
| AI chat sessions | 30 minutes | Conversation context |
| JWT blacklist | Until token expiry | Token revocation |
| Spring Boot health flag | N/A (manually set) | Failover trigger |

### 5.3 Object Storage

| Technology | Purpose |
|---|---|
| **Cloudflare R2** | Product images, AR 3D model files (.glb), user avatars |
| **Cloudflare CDN** | Global edge delivery for all static assets |

R2 is S3-compatible with zero egress fees, making it ideal for serving AR model files (which can be 5–50MB each) at high frequency without runaway storage costs.

### 5.4 Schema Migration

| Technology | Used By | Purpose |
|---|---|---|
| **Flyway** | Spring Boot | Versioned SQL migrations (`V1__init.sql`, `V2__add_vector.sql`, etc.) |
| **Prisma Migrate** | Node.js | Schema migrations for Node.js-owned tables (ai_logs, notifications) |

Both tools target the same PostgreSQL database but manage separate, non-overlapping tables.

---

## 6. AI & Machine Learning

### 6.1 LLM Provider

| Technology | Model | Purpose |
|---|---|---|
| **Groq API** | `llama-3.1-70b-versatile` | Primary conversational AI, product Q&A |
| **Groq API** | `mixtral-8x7b-32768` | Fallback model (longer context window) |
| **Groq API** | `llama-3.1-8b-instant` | Fast intent classification (low latency pre-step) |

**Why Groq:** Groq's LPU hardware delivers 300–800 tokens/second inference — the fastest available inference API, enabling the < 2 second AI response SLA even for complex RAG queries.

### 6.2 Embeddings & Vector Search

| Technology | Model | Purpose |
|---|---|---|
| **OpenAI Embeddings** | `text-embedding-3-small` | 1536-dim product embeddings (offline, seed) |
| **pgvector** | IVFFlat index | Approximate nearest neighbor search |
| **LangChain.js** | `PGVectorStore` | Retrieval chain integration |

### 6.3 RAG Pipeline

```
Seed Phase (one-time):
  28k products → text chunks → OpenAI embeddings → pgvector storage

Query Phase (real-time):
  User query → embed (OpenAI) → pgvector cosine search (top-10)
  → LangChain ContextualCompressionRetriever → Groq LLM → Response
```

### 6.4 AI Frameworks

| Technology | Version | Purpose |
|---|---|---|
| **LangChain.js** | 0.2.x | RAG chains, prompt templates, output parsers |
| **LangChain Memory** | Built-in | `BufferWindowMemory` in Redis for conversation history |
| **Zod (output parsing)** | 3.x | Structured JSON output validation from LLM responses |

---

## 7. AR Module

### 7.1 Core AR Stack

| Technology | Purpose |
|---|---|
| **React Native Vision Camera** | High-performance camera frame processor (JSI, runs at 60fps) |
| **Mediapipe Face Mesh (WASM)** | 468-point facial landmark detection for face anchoring |
| **Expo GL / Three.js** | WebGL-based 3D model rendering overlaid on camera feed |
| **react-three-fiber** | React bindings for Three.js (declarative 3D scene management) |
| **@react-three/drei** | Three.js helpers (loaders, controls, environment) |

### 7.2 3D Asset Pipeline

| Format | Usage |
|---|---|
| `.glb` (Binary GLTF) | AR 3D product models (compressed, web/native compatible) |
| **Cloudflare R2** | Asset storage with CDN edge delivery |
| **Draco compression** | Reduces `.glb` file sizes by 60–90% |

### 7.3 AR Supported Categories (MVP)

| Category | Anchor Points |
|---|---|
| Sunglasses / Eyewear | Left eye outer → Right eye outer, nose bridge |
| Hats / Caps | Forehead center, ear tips |

### 7.4 Graceful Degradation

```
Device capability check at launch:
  │
  ├── Vision Camera supported?
  │       YES → Full AR Try-On enabled
  │       NO  → Fallback to 360° product viewer
  │
  ├── AR model available for product?
  │       YES → Show "Try with AR" button
  │       NO  → Hide button silently
  │
  └── Web browser?
          Chrome/Edge → WebRTC camera + WebAssembly Mediapipe
          Safari iOS  → Limited (prompt to use app)
          Other       → Static 2D overlay on uploaded photo
```

---

## 8. DevOps & Infrastructure

### 8.1 Containerization

| Technology | Version | Purpose |
|---|---|---|
| **Docker** | 24+ | Containerize Spring Boot and Node.js services |
| **Docker Compose** | 2.x | Local development multi-service orchestration |

**Local dev stack via Docker Compose:**
- Spring Boot API (port 8080)
- Node.js AI service (port 3001)
- PostgreSQL + pgvector (port 5432)
- Redis (port 6379)
- Adminer (DB UI, port 8081)

### 8.2 Hosting

| Service | Platform | Notes |
|---|---|---|
| React Native (Mobile) | Expo EAS Build → App Store + Play Store | OTA updates via Expo |
| React Native (Web) | Vercel | Automatic deploys from `main` branch |
| Spring Boot | Railway / Render | Docker container, auto-scale on Railway |
| Node.js | Railway / Render | Separate service, auto-scale |
| PostgreSQL | Aiven Cloud | Managed, SSL, auto-failover, daily backups |
| Redis | Upstash | Serverless, pay-per-request |
| AR Assets + Images | Cloudflare R2 + CDN | Zero egress cost |

### 8.3 CI/CD

| Technology | Purpose |
|---|---|
| **GitHub Actions** | Automated test → build → deploy pipeline |
| **Expo EAS Build** | Cloud-based iOS/Android binary compilation |
| **Expo EAS Update** | OTA JS bundle updates (no App Store review required) |
| **GHCR (GitHub Container Registry)** | Docker image storage |

**GitHub Actions Workflow:**

```yaml
Trigger: push to main / pull_request

Jobs:
  1. frontend-checks:
       - TypeScript check (tsc --noEmit)
       - ESLint
       - Jest unit tests

  2. spring-boot-build:
       - mvn clean package
       - JUnit tests (./mvnw test)
       - Docker build + push to GHCR

  3. node-build:
       - npm ci
       - Jest tests
       - Docker build + push to GHCR

  4. deploy-staging:
       - Railway / Render deploy via API
       - Smoke tests

  5. (Manual gate) deploy-production
```

### 8.4 Monitoring & Observability

| Technology | Purpose |
|---|---|
| **Spring Boot Actuator** | Exposes `/health`, `/metrics`, `/info` endpoints |
| **Micrometer** | Metrics collection from Spring Boot |
| **Prometheus** | Metrics scraping and time-series storage |
| **Grafana** | Dashboard visualization for all metrics |
| **Loki** | Log aggregation from all services |
| **Sentry** | Error tracking for React Native (mobile + web) and Node.js |
| **UptimeRobot** | External uptime monitoring + alerting |

**Key Dashboards:**
- API latency (P50, P95, P99) per endpoint
- Reservation throughput and failure rate
- AI query volume and response times
- Database connection pool utilization
- Redis hit/miss ratio
- Active WebSocket connections

---

## 9. Security

| Technology | Purpose |
|---|---|
| **Spring Security** | Route-level and method-level authorization |
| **JJWT** | JWT signing (HS256), parsing, and validation |
| **bcrypt** | Password hashing (Spring Security Crypto, cost 12) |
| **Helmet.js** | HTTP security headers for Node.js/Express |
| **express-rate-limit** | Per-IP and per-user rate limiting (Node.js) |
| **Spring Cloud Gateway** | Rate limiting, CORS, request validation (primary) |
| **Aiven SSL** | TLS 1.3 enforced on all database connections |
| **Cloudflare WAF** | Web Application Firewall, DDoS protection |
| **OWASP Dependency Check** | Automated CVE scanning in CI pipeline |

**JWT Architecture:**
```
Access Token:   HS256, 15-minute TTL, stored in memory (mobile) / memory (web)
Refresh Token:  HS256, 7-day TTL, stored in SecureStore (mobile) / HttpOnly cookie (web)
Token Revocation: Redis blacklist checked on every request
```

---

## 10. Testing

### 10.1 Spring Boot Testing

| Technology | Purpose |
|---|---|
| **JUnit 5** | Unit and integration test framework |
| **Mockito** | Mocking dependencies in unit tests |
| **Spring Boot Test** | Integration test slices (`@WebMvcTest`, `@DataJpaTest`) |
| **Testcontainers** | Spins up real PostgreSQL + Redis for integration tests |
| **RestAssured** | API endpoint integration testing |

**Coverage target:** ≥ 80% line coverage on service layer.

### 10.2 Node.js Testing

| Technology | Purpose |
|---|---|
| **Jest** | Unit test framework |
| **Supertest** | HTTP endpoint integration testing |
| **MSW (Mock Service Worker)** | Mock Groq API responses in AI service tests |
| **Prisma Test Utils** | Isolated test database per test suite |

### 10.3 Frontend Testing

| Technology | Purpose |
|---|---|
| **Jest** | Unit tests for hooks and utility functions |
| **React Native Testing Library** | Component rendering and interaction tests |
| **Detox** | End-to-end automation on iOS/Android simulators |
| **Playwright** | Web (react-native-web) E2E browser testing |

### 10.4 Load Testing

| Technology | Purpose |
|---|---|
| **k6** | Load testing scripts for peak event simulation (10k concurrent users) |
| **Grafana k6 Cloud** | Distributed load test execution and reporting |

---

## 11. Developer Tooling

| Tool | Purpose |
|---|---|
| **ESLint + Prettier** | Code linting and formatting (frontend + Node.js) |
| **Checkstyle + SpotBugs** | Code quality enforcement (Spring Boot) |
| **Husky + lint-staged** | Pre-commit hooks to enforce lint/format |
| **VS Code** | Primary IDE (with ESLint, Prettier, Java, Prisma extensions) |
| **IntelliJ IDEA** | Spring Boot development |
| **Expo Go** | Quick local preview on real devices |
| **Postman / Bruno** | API testing and documentation |
| **TablePlus** | PostgreSQL GUI client |
| **RedisInsight** | Redis data browser |
| **Swagger UI** | Auto-generated Spring Boot API docs (`/swagger-ui.html`) |

---

## 12. Architecture Decision Records

### ADR-001: React Native over Next.js + Native Apps
**Decision:** Use React Native (Expo) with `react-native-web` for all platforms.  
**Reason:** Single codebase for iOS, Android, and Web. Reduced team size requirement. Expo EAS enables OTA updates without App Store review delays. The product's core value (AR, QR, push notifications) requires native device access which React Native provides natively.  
**Trade-off:** Web performance is slightly lower than a dedicated Next.js app; mitigated with Hermes engine and memoization best practices.

### ADR-002: Spring Boot as Primary Backend
**Decision:** Java 21 + Spring Boot 3.2 for the primary backend.  
**Reason:** Transactional integrity (ACID), mature ecosystem for financial/inventory operations, strong typing, Spring Security's battle-tested auth primitives, virtual threads for high concurrency.  
**Trade-off:** Higher memory footprint vs Node.js; justified by 3–5x demand surge requirement and zero-overbooking SLA.

### ADR-003: Node.js as AI/Fallback Layer
**Decision:** Node.js for AI orchestration, not Spring Boot.  
**Reason:** LangChain.js ecosystem is more mature than LangChain4j. Groq SDK and LangChain.js are JavaScript-first. Node.js's async model suits streaming LLM responses. This also provides genuine redundancy — different runtime, different failure modes.  
**Trade-off:** Two backends to maintain; managed via shared PostgreSQL schema and Redis, with clear service boundary documentation.

### ADR-004: PostgreSQL + pgvector over Dedicated Vector DB
**Decision:** pgvector extension in PostgreSQL instead of Pinecone or Weaviate.  
**Reason:** Eliminates an additional managed service. Keeps all data in one system. 28k products at 1536 dimensions is well within pgvector's tested limits (millions of rows). Simplifies backup and migration strategy.  
**Trade-off:** Less feature-rich than dedicated vector DBs (no built-in metadata filtering pre-v0.7). Mitigated by combining SQL `WHERE` clauses with vector search in Prisma queries.

### ADR-005: Groq over OpenAI for Inference
**Decision:** Groq API as primary LLM inference provider.  
**Reason:** 300–800 tokens/second inference enables < 2s AI response SLA. Sub-second latency for intent classification. Significantly lower cost per token than GPT-4.  
**Trade-off:** Smaller model selection vs OpenAI. Mitigated by fallback to Mixtral model and future-proofing via LangChain abstraction layer (easy to swap provider).

---

*Document Owner: VIKAS Engineering Team*  
*Stack Review Cycle: Monthly — technologies pinned at versions above, reviewed for upgrades each sprint*