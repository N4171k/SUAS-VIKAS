# 📄 PRODUCT REQUIREMENTS DOCUMENT (PRD)
# VIKAS – Virtually Intelligent Knowledge Assisted Shopping
**Version:** 2.0  
**Category:** Development → EventFlex Marketplace Platform  
**Theme:** AI for Society  
**Stack:** React Native (Mobile + Web) · Spring Boot (Primary Backend) · Node.js (Fallback Backend) · PostgreSQL  
**Last Updated:** February 2026

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Goals & Objectives](#3-goals--objectives)
4. [Scope](#4-scope)
5. [Stakeholders](#5-stakeholders)
6. [System Architecture](#6-system-architecture)
7. [Technology Stack](#7-technology-stack)
8. [Frontend – React Native (Mobile + Web)](#8-frontend--react-native-mobile--web)
9. [Primary Backend – Spring Boot](#9-primary-backend--spring-boot)
10. [Fallback Backend – Node.js](#10-fallback-backend--nodejs)
11. [Database Schema (PostgreSQL)](#11-database-schema-postgresql)
12. [API Endpoints Reference](#12-api-endpoints-reference)
13. [AI & RAG Subsystem](#13-ai--rag-subsystem)
14. [AR Try-On Module](#14-ar-try-on-module)
15. [Reservation & Click-Collect Engine](#15-reservation--click-collect-engine)
16. [Real-Time Analytics Dashboard](#16-real-time-analytics-dashboard)
17. [Non-Functional Requirements](#17-non-functional-requirements)
18. [Security Architecture](#18-security-architecture)
19. [Deployment Strategy](#19-deployment-strategy)
20. [Risks & Mitigation](#20-risks--mitigation)
21. [Feature Roadmap](#21-feature-roadmap)
22. [Definition of Done](#22-definition-of-done)
23. [Conclusion](#23-conclusion)

---

## 1. Executive Summary

VIKAS (Virtually Intelligent Knowledge Assisted Shopping) is a scalable, AI-powered omnichannel marketplace platform purpose-built to manage high-demand retail events — festivals, flash sales, and seasonal surges. It intelligently reduces physical queue congestion, provides real-time inventory visibility across all channels, and enables seamless online-to-offline (O2O) shopping experiences using AI-driven recommendations, slot-based reservation systems, and Augmented Reality (AR) try-on.

The system is built on a **React Native** frontend that delivers a unified codebase for both iOS, Android, and Web. The **Spring Boot** backend serves as the primary microservices engine, with a **Node.js** fallback backend handling AI/LLM routing, webhook processing, and lightweight edge services.

**Core value pillars:**

- **Queue Reduction:** Slot-based reservations eliminate physical queues, targeting a 50% reduction in in-store wait times.
- **Inventory Intelligence:** Real-time stock sync across physical stores and online catalog prevents wasted customer trips.
- **AI Shopping Assistant:** A RAG-powered chatbot assists customers in product discovery, comparison, and purchase decisions.
- **Omnichannel Continuity:** Customers browse online, reserve in-store, and collect via QR code — a frictionless hybrid experience.
- **AR Commerce:** Mediapipe-powered AR allows virtual product try-on before purchase commitment.

---

## 2. Problem Statement

### 2.1 Current Pain Points

During festive seasons and high-demand retail events, the Indian retail ecosystem faces critical operational breakdowns:

| Problem | Impact |
|---|---|
| 3–5x demand surge during festivals | Store infrastructure overwhelmed |
| Long billing queues (30–90 min avg) | Customer abandonment, revenue loss |
| Inventory mismatch between online/offline | Wasted trips, poor NPS |
| No predictive analytics for store managers | Reactive, not proactive management |
| Overcrowding | Safety risks, regulatory non-compliance |
| No AI-assisted discovery | Low conversion rates on large catalogs |

### 2.2 Technology Gap

Traditional e-commerce platforms fail to bridge:

- **Real-time, store-level inventory synchronization** — most systems show warehouse stock, not shelf stock.
- **Intelligent demand orchestration** — no pre-event slot booking or capacity management.
- **AI-based personalized discovery** — static filters on 28k+ product catalogs are inadequate.
- **AR-assisted buying decisions** — zero virtual try-on capabilities in existing platforms.
- **Cross-channel event handling** — systems aren't built for event-driven commerce spikes.

### 2.3 Market Opportunity

India's festive retail market exceeds ₹1.5 lakh crore annually. Poor omnichannel UX is the #1 reason for cart abandonment during sales events. VIKAS directly addresses this structural gap.

---

## 3. Goals & Objectives

### 3.1 Primary Goals

| Goal | Success Metric | Target |
|---|---|---|
| Reduce in-store queue time | Average customer wait time | -50% |
| Omnichannel inventory visibility | Inventory sync accuracy | 99%+ |
| AI-powered decision assistance | AI query resolution rate | 85%+ |
| Event-driven scalability | Concurrent users supported | 10,000+ |

### 3.2 Secondary Goals

- Improve conversion rate by 20% via AI recommendations
- Achieve NPS score > 70 through seamless UX
- Provide store managers with actionable, real-time analytics dashboards
- Enable zero-overbooking via transactional reservation locking

---

## 4. Scope

### 4.1 In Scope (MVP)

- **Authentication:** JWT-based login/register, role management (Customer, Store Admin, Super Admin)
- **Product Catalog:** 28,000+ product dataset with rich filtering, search, pagination
- **Cart & Checkout:** Full cart lifecycle, buy-now flow, order creation
- **AI Chatbot:** RAG-based assistant with product Q&A, comparison, recommendations
- **Store Inventory:** Real-time stock per store, availability checker
- **Click & Collect:** Slot selection, reservation locking, QR code generation & validation
- **AR Try-On:** Face-tracked 3D overlay for wearable product categories
- **Admin Analytics:** Reservation metrics, sales heatmap, peak hour detection, AI query trends
- **Push Notifications:** Reservation reminders, slot expiry alerts, order status updates
- **Offline Support:** Basic offline browsing via cached product data (React Native)

### 4.2 Out of Scope (Future Phases)

- Live CCTV crowd detection and footfall analytics
- Payment gateway integration (Stripe / Razorpay / UPI)
- Multi-tenant white-label retailer support
- Dynamic pricing engine (demand-based pricing AI)
- Voice commerce interface
- Loyalty points and gamification

---

## 5. Stakeholders

| Role | Responsibility |
|---|---|
| Customer | Browses, reserves, collects, uses AR and AI assistant |
| Store Admin | Manages inventory, views store-level analytics, validates QR codes |
| Super Admin | Platform-wide analytics, user management, system health |
| Developer Team | Builds and maintains all services |
| AI/ML Team | Maintains RAG pipeline, LLM integration, embedding models |
| DevOps | Infrastructure, CI/CD, monitoring, scaling |

---

## 6. System Architecture

### 6.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│               React Native App (Expo)                    │
│         iOS · Android · Web (react-native-web)          │
└────────────────────────┬────────────────────────────────┘
                         │ HTTPS / WebSocket
                         ▼
┌─────────────────────────────────────────────────────────┐
│                    API Gateway                           │
│            (Spring Boot Gateway / Kong)                  │
│         Routing · Rate Limiting · Auth Middleware        │
└──────┬──────────────────────────────────────┬───────────┘
       │                                      │
       ▼                                      ▼
┌──────────────────┐                ┌─────────────────────┐
│  Spring Boot     │                │  Node.js Fallback   │
│  Primary Backend │                │  Backend            │
│                  │                │                     │
│ • Auth Service   │                │ • AI/LLM Router     │
│ • Product Svc    │                │ • Groq Integration  │
│ • Inventory Svc  │                │ • RAG Pipeline      │
│ • Order Svc      │                │ • Webhook Handler   │
│ • Reservation Svc│                │ • AR Asset Delivery │
│ • Analytics Svc  │                │ • Notification Svc  │
└──────┬───────────┘                └──────────┬──────────┘
       │                                       │
       └──────────────────┬────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────┐
│              PostgreSQL (Aiven Cloud)                    │
│       VIKAS-users · VIKAS-dataset · VIKAS-inventory     │
│       VIKAS-orders · VIKAS-reservations · VIKAS-stores  │
└─────────────────────────────────────────────────────────┘
       │                          │
       ▼                          ▼
┌─────────────┐          ┌─────────────────┐
│  Redis Cache│          │ pgvector (RAG   │
│  (Sessions, │          │  Embeddings)    │
│  Inventory) │          └─────────────────┘
└─────────────┘
```

### 6.2 Service Communication

- **Spring Boot ↔ Node.js:** REST/gRPC for fallback routing decisions
- **Frontend ↔ Backend:** REST over HTTPS + WebSocket (real-time inventory updates)
- **AI Queries:** Frontend → Node.js AI Service → Groq LLM API → RAG pipeline → Response
- **Cache Layer:** Redis for session management, hot inventory data, and API response caching

---

## 7. Technology Stack

### 7.1 Frontend

| Component | Technology | Version |
|---|---|---|
| Framework | React Native (Expo) | SDK 51+ |
| Web Support | react-native-web | Latest |
| Navigation | React Navigation v6 | 6.x |
| State Management | Zustand + React Query | Latest |
| Styling | NativeWind (Tailwind for RN) | 4.x |
| AR Module | VisionCamera + Mediapipe | Latest |
| HTTP Client | Axios | Latest |
| WebSocket | Socket.IO Client | Latest |
| Auth Storage | Expo SecureStore | Latest |
| Push Notifications | Expo Notifications | Latest |
| Offline Support | React Query + MMKV | Latest |
| QR Code | react-native-qrcode-svg | Latest |
| Maps (Store Locator) | react-native-maps | Latest |

### 7.2 Primary Backend (Spring Boot)

| Component | Technology | Version |
|---|---|---|
| Framework | Spring Boot | 3.2.x |
| ORM | Spring Data JPA (Hibernate) | Latest |
| Security | Spring Security + JWT | Latest |
| API Docs | Springdoc OpenAPI (Swagger) | Latest |
| Database | PostgreSQL via HikariCP | 16.x |
| Cache | Spring Cache + Redis (Lettuce) | Latest |
| Build Tool | Maven / Gradle | Latest |
| Testing | JUnit 5 + Mockito | Latest |
| Containerization | Docker | Latest |

### 7.3 Fallback Backend (Node.js)

| Component | Technology | Version |
|---|---|---|
| Framework | Express.js | 4.x |
| ORM | Prisma | 5.x |
| AI/LLM | Groq SDK | Latest |
| RAG Embeddings | LangChain.js | Latest |
| Vector DB | pgvector (via PostgreSQL) | Latest |
| WebSocket | Socket.IO | 4.x |
| Auth | jsonwebtoken + bcrypt | Latest |
| Testing | Jest + Supertest | Latest |
| Process Manager | PM2 | Latest |

### 7.4 Infrastructure

| Component | Technology |
|---|---|
| Database | Aiven PostgreSQL |
| Cache | Upstash Redis |
| AI API | Groq (LLaMA 3.1, Mixtral) |
| Object Storage | Cloudflare R2 (AR assets, product images) |
| CDN | Cloudflare |
| Containerization | Docker + Docker Compose |
| CI/CD | GitHub Actions |
| Monitoring | Grafana + Prometheus |
| Logging | Loki / Papertrail |

---

## 8. Frontend – React Native (Mobile + Web)

### 8.1 Project Structure

```
vikas-app/
│
├── app/                          # Expo Router (file-based routing)
│   ├── (auth)/
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── forgot-password.tsx
│   ├── (tabs)/
│   │   ├── index.tsx             # Home / Featured
│   │   ├── products.tsx          # Product catalog
│   │   ├── cart.tsx              # Shopping cart
│   │   ├── orders.tsx            # Order history
│   │   └── profile.tsx           # User profile
│   ├── product/
│   │   └── [id].tsx              # Product detail page
│   ├── stores/
│   │   ├── index.tsx             # Store locator
│   │   └── [storeId].tsx         # Individual store view
│   ├── reservation/
│   │   ├── create.tsx            # Slot selection & booking
│   │   └── [id].tsx              # Reservation detail + QR
│   ├── checkout/
│   │   └── index.tsx             # Checkout flow
│   ├── ar/
│   │   └── index.tsx             # AR Try-On screen
│   └── admin/
│       ├── dashboard.tsx          # Admin analytics
│       ├── reservations.tsx       # Manage reservations
│       └── inventory.tsx          # Inventory management
│
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Skeleton.tsx
│   │   └── Modal.tsx
│   ├── product/
│   │   ├── ProductCard.tsx
│   │   ├── ProductGrid.tsx
│   │   ├── ProductFilter.tsx
│   │   ├── ProductSearch.tsx
│   │   └── ProductComparison.tsx
│   ├── chat/
│   │   ├── ChatBubble.tsx
│   │   ├── ChatInput.tsx
│   │   └── AIChatModal.tsx
│   ├── ar/
│   │   ├── ARView.tsx
│   │   ├── AROverlay.tsx
│   │   └── CameraPermissionGate.tsx
│   ├── reservation/
│   │   ├── SlotPicker.tsx
│   │   ├── ReservationCard.tsx
│   │   └── QRCodeDisplay.tsx
│   ├── store/
│   │   ├── StoreLocator.tsx
│   │   ├── StoreCard.tsx
│   │   └── InventoryBadge.tsx
│   └── layout/
│       ├── Header.tsx
│       ├── TabBar.tsx
│       └── AdminSidebar.tsx (web only)
│
├── hooks/
│   ├── useAuth.ts
│   ├── useCart.ts
│   ├── useProducts.ts
│   ├── useInventory.ts
│   ├── useReservation.ts
│   ├── useAI.ts
│   └── useWebSocket.ts
│
├── store/                        # Zustand global state
│   ├── authStore.ts
│   ├── cartStore.ts
│   └── uiStore.ts
│
├── lib/
│   ├── api.ts                    # Axios instance with interceptors
│   ├── auth.ts                   # Auth helpers + token refresh
│   ├── socket.ts                 # WebSocket client
│   └── storage.ts                # MMKV offline storage
│
├── constants/
│   ├── colors.ts
│   ├── fonts.ts
│   └── config.ts
│
└── types/
    ├── product.ts
    ├── user.ts
    ├── order.ts
    └── reservation.ts
```

### 8.2 Key Screens & User Flows

#### 8.2.1 Home Screen
- Featured product carousel
- Festival/event banner with countdown timer
- AI-powered "For You" personalized grid
- Quick links: Store Locator, AR Try-On, Active Reservations
- Floating AI chat button

#### 8.2.2 Product Catalog
- Infinite scroll with virtualized FlatList (mobile) / Grid (web)
- Filter sidebar (web) / Bottom sheet (mobile): Category, Brand, Price range, Rating, In-store availability
- AI-enhanced search with semantic matching
- Sort: Relevance, Price, Rating, New Arrivals
- "Available Near Me" toggle using geolocation

#### 8.2.3 Product Detail
- Image gallery with pinch-to-zoom
- AI description enhancement
- Real-time stock indicator per store (live WebSocket feed)
- "Try with AR" button (conditionally shown for supported categories)
- Size/variant selector
- Add to Cart / Buy Now / Reserve for Pickup
- AI-powered "Ask About This Product" chat expansion
- Related products (AI recommendations)
- Comparison mode: select up to 3 products

#### 8.2.4 Reservation Flow
1. User selects store from inventory map
2. Selects available time slot (30-min intervals)
3. System locks inventory via transactional write
4. Confirmation screen with QR code
5. QR code displayed on-device for store scan
6. Push notification reminder 1 hour before slot

#### 8.2.5 AR Try-On
- Camera permission request flow
- Face detection via Mediapipe (for wearables: glasses, headwear)
- 3D model overlay rendering at 30fps
- Product selection from AR-compatible catalog
- Screenshot capture and share

#### 8.2.6 Admin Dashboard (web-optimized)
- KPI cards: Today's Reservations, Active Orders, AI Queries, Peak Hour
- Sales heatmap by hour/day
- Live reservation queue per store
- AI query topic clustering
- Export to CSV

### 8.3 Web vs Mobile Adaptations

| Feature | Mobile | Web |
|---|---|---|
| Navigation | Bottom Tab Bar | Sidebar + Top Nav |
| Filters | Bottom Sheet | Sidebar Panel |
| Admin Dashboard | Simplified cards | Full analytics UI |
| AR Try-On | Native camera | WebRTC camera |
| QR Code | Full screen display | Modal + print option |
| Offline Mode | MMKV cached data | Service Worker |

---

## 9. Primary Backend – Spring Boot

### 9.1 Project Structure

```
vikas-backend-spring/
│
├── src/main/java/com/vikas/
│   │
│   ├── VikasApplication.java
│   │
│   ├── config/
│   │   ├── DatabaseConfig.java
│   │   ├── RedisConfig.java
│   │   ├── SecurityConfig.java
│   │   ├── SwaggerConfig.java
│   │   └── WebSocketConfig.java
│   │
│   ├── auth/
│   │   ├── AuthController.java
│   │   ├── AuthService.java
│   │   ├── JwtTokenProvider.java
│   │   ├── JwtAuthFilter.java
│   │   └── dto/
│   │       ├── LoginRequest.java
│   │       ├── RegisterRequest.java
│   │       └── AuthResponse.java
│   │
│   ├── user/
│   │   ├── UserController.java
│   │   ├── UserService.java
│   │   ├── UserRepository.java
│   │   └── User.java (Entity)
│   │
│   ├── product/
│   │   ├── ProductController.java
│   │   ├── ProductService.java
│   │   ├── ProductRepository.java
│   │   ├── Product.java (Entity)
│   │   └── dto/
│   │       ├── ProductDTO.java
│   │       └── ProductFilterRequest.java
│   │
│   ├── inventory/
│   │   ├── InventoryController.java
│   │   ├── InventoryService.java
│   │   ├── InventoryRepository.java
│   │   └── Inventory.java (Entity)
│   │
│   ├── store/
│   │   ├── StoreController.java
│   │   ├── StoreService.java
│   │   ├── StoreRepository.java
│   │   └── Store.java (Entity)
│   │
│   ├── cart/
│   │   ├── CartController.java
│   │   ├── CartService.java
│   │   ├── CartRepository.java
│   │   └── CartItem.java (Entity)
│   │
│   ├── order/
│   │   ├── OrderController.java
│   │   ├── OrderService.java
│   │   ├── OrderRepository.java
│   │   └── Order.java (Entity)
│   │
│   ├── reservation/
│   │   ├── ReservationController.java
│   │   ├── ReservationService.java
│   │   ├── ReservationRepository.java
│   │   ├── SlotManager.java
│   │   ├── QRCodeService.java
│   │   └── Reservation.java (Entity)
│   │
│   ├── analytics/
│   │   ├── AnalyticsController.java
│   │   ├── AnalyticsService.java
│   │   └── dto/
│   │       ├── SalesReport.java
│   │       └── ReservationMetrics.java
│   │
│   ├── websocket/
│   │   ├── InventoryWebSocketHandler.java
│   │   └── ReservationWebSocketHandler.java
│   │
│   └── common/
│       ├── exception/
│       │   ├── GlobalExceptionHandler.java
│       │   ├── ResourceNotFoundException.java
│       │   └── OverbookingException.java
│       ├── response/
│       │   └── ApiResponse.java
│       └── util/
│           └── PaginationUtil.java
│
├── src/main/resources/
│   ├── application.yml
│   ├── application-dev.yml
│   └── application-prod.yml
│
└── src/test/
    ├── auth/AuthServiceTest.java
    ├── reservation/ReservationServiceTest.java
    └── inventory/InventoryServiceTest.java
```

### 9.2 Core Spring Boot Service Specifications

#### 9.2.1 Auth Service
- JWT access token (15 min TTL) + refresh token (7 days TTL)
- Tokens stored server-side in Redis for revocation support
- bcrypt password hashing (strength 12)
- Role-based access: `ROLE_CUSTOMER`, `ROLE_STORE_ADMIN`, `ROLE_SUPER_ADMIN`
- Spring Security filter chain for route-level authorization

#### 9.2.2 Product Service
- JPA Specification-based dynamic filtering (category, brand, price range, rating)
- Full-text PostgreSQL search using `tsvector` + `tsquery`
- Paginated responses (default 20 items/page, max 100)
- Redis cache on hot product reads (TTL: 10 min)
- Eager store availability join via `VIKAS-inventory`

#### 9.2.3 Inventory Service
- Optimistic locking (`@Version` on entity) to prevent concurrent overbooking
- Real-time inventory broadcast via WebSocket on stock change
- Reservation lock mechanism: marks inventory "reserved" (not yet decremented) on slot booking
- Stock decrement only on successful pickup (QR scan by store admin)
- Scheduled task: releases expired reservation locks every 5 minutes

#### 9.2.4 Reservation Service
- Slot generation: 30-minute intervals, configurable per store per event
- Slot capacity: configurable per slot (default: 10 reservations)
- Transaction-level locking: `@Transactional(isolation = SERIALIZABLE)` on slot booking
- QR code generation via ZXing library (Base64 PNG embedded in response)
- Reservation state machine: `PENDING → CONFIRMED → COMPLETED | EXPIRED | CANCELLED`
- Scheduled expiry: reservations auto-expire 15 min past slot time if not scanned

#### 9.2.5 Analytics Service
- Aggregation queries with PostgreSQL `GROUP BY` + `date_trunc`
- Pre-computed daily summaries via `@Scheduled` jobs (runs at midnight)
- Redis-cached real-time metrics (TTL: 60 seconds)
- Endpoints return paginated JSON for large date ranges

---

## 10. Fallback Backend – Node.js

The Node.js backend serves as a purpose-built fallback and extension layer, handling workloads that are better suited to JavaScript's ecosystem — specifically AI/LLM orchestration, real-time event streaming, and lightweight edge API tasks.

### 10.1 Project Structure

```
vikas-backend-node/
│
├── src/
│   │
│   ├── config/
│   │   ├── db.ts               # Prisma client init
│   │   ├── redis.ts            # Redis connection
│   │   ├── groq.ts             # Groq SDK init
│   │   └── env.ts              # Zod env validation
│   │
│   ├── routes/
│   │   ├── aiRoutes.ts
│   │   ├── arRoutes.ts
│   │   ├── notificationRoutes.ts
│   │   ├── webhookRoutes.ts
│   │   └── healthRoutes.ts
│   │
│   ├── services/
│   │   ├── ai/
│   │   │   ├── groqService.ts       # LLM API calls
│   │   │   ├── ragService.ts        # Retrieval-Augmented Generation
│   │   │   ├── embeddingService.ts  # Generate & query pgvector embeddings
│   │   │   └── agentOrchestrator.ts # Multi-step AI agent
│   │   ├── notification/
│   │   │   ├── pushService.ts       # Expo Push Notifications
│   │   │   └── notificationQueue.ts # Bull queue for scheduled sends
│   │   ├── ar/
│   │   │   └── assetService.ts      # AR 3D asset delivery from R2
│   │   └── analytics/
│   │       └── aiAnalyticsService.ts # AI query trend analysis
│   │
│   ├── middleware/
│   │   ├── auth.ts              # JWT verification (shared secret with Spring Boot)
│   │   ├── rateLimiter.ts       # Per-user AI rate limiting
│   │   └── errorHandler.ts
│   │
│   ├── agents/
│   │   ├── shopAssistant.ts     # Main conversational agent
│   │   ├── productComparator.ts # Product comparison logic
│   │   └── personalizationAgent.ts # Recommendation engine
│   │
│   ├── scripts/
│   │   ├── seedEmbeddings.ts    # Generate pgvector embeddings for 28k products
│   │   └── testAI.ts
│   │
│   └── server.ts
│
├── prisma/
│   └── schema.prisma
│
└── package.json
```

### 10.2 Fallback Routing Logic

The Spring Boot API Gateway determines routing:

```
Spring Boot API Gateway
│
├── /auth/**     → Spring Boot Auth Service
├── /products/** → Spring Boot Product Service
├── /inventory/**→ Spring Boot Inventory Service
├── /orders/**   → Spring Boot Order Service
├── /reservations/** → Spring Boot Reservation Service
├── /admin/**    → Spring Boot Analytics Service
│
├── /ai/**       → Node.js AI Service (PRIMARY)
├── /ar/**       → Node.js AR Asset Service (PRIMARY)
├── /notify/**   → Node.js Notification Service (PRIMARY)
│
└── [Spring Boot health check fails]
    → All routes failover to Node.js fallback endpoints
```

**Failover condition:** If Spring Boot health check at `/actuator/health` returns non-200 for 3 consecutive checks (10-second interval), the gateway redirects core API traffic to Node.js fallback until Spring Boot recovers. Node.js maintains a read-only mirror of critical data via Redis to serve this fallback traffic.

### 10.3 AI/RAG Pipeline (Node.js)

```
User Query
    │
    ▼
Query Analysis (Groq - fast inference)
    │
    ├── Intent: Product Search → pgvector similarity search (top-10)
    ├── Intent: Comparison    → Fetch 2-3 products + structured compare prompt
    ├── Intent: Availability  → Spring Boot inventory API call
    └── Intent: General       → LLM direct response
    │
    ▼
Context Assembly
    │
    ├── Retrieved product chunks (RAG)
    ├── User's cart & history (from Redis session)
    └── Store availability (real-time)
    │
    ▼
Groq LLM (LLaMA 3.1 70B)
    │
    ▼
Structured Response (JSON + natural language)
    │
    ▼
Client
```

---

## 11. Database Schema (PostgreSQL)

### 11.1 Full Schema

```sql
-- Users
CREATE TABLE "vikas-users" (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email         VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name     VARCHAR(255),
    phone         VARCHAR(20),
    role          VARCHAR(50) NOT NULL DEFAULT 'CUSTOMER',
    is_active     BOOLEAN DEFAULT true,
    created_at    TIMESTAMP DEFAULT NOW(),
    updated_at    TIMESTAMP DEFAULT NOW()
);

-- Product Dataset
CREATE TABLE "vikas-dataset" (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title         VARCHAR(500) NOT NULL,
    description   TEXT,
    category      VARCHAR(255),
    sub_category  VARCHAR(255),
    brand         VARCHAR(255),
    price         NUMERIC(10, 2),
    original_price NUMERIC(10, 2),
    discount_pct  INTEGER,
    rating        NUMERIC(3, 1),
    review_count  INTEGER,
    image_url     TEXT,
    ar_model_url  TEXT,
    is_ar_enabled BOOLEAN DEFAULT false,
    search_vector TSVECTOR,
    embedding     VECTOR(1536),     -- pgvector for RAG
    created_at    TIMESTAMP DEFAULT NOW()
);

-- Stores
CREATE TABLE "vikas-stores" (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(255) NOT NULL,
    address     TEXT,
    city        VARCHAR(100),
    state       VARCHAR(100),
    pincode     VARCHAR(10),
    latitude    DECIMAL(9, 6),
    longitude   DECIMAL(9, 6),
    phone       VARCHAR(20),
    hours       JSONB,             -- { "mon": "9-21", ... }
    is_active   BOOLEAN DEFAULT true
);

-- Inventory (Store x Product)
CREATE TABLE "vikas-inventory" (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id    UUID NOT NULL REFERENCES "vikas-stores"(id),
    product_id  UUID NOT NULL REFERENCES "vikas-dataset"(id),
    quantity    INTEGER NOT NULL DEFAULT 0,
    reserved    INTEGER NOT NULL DEFAULT 0,  -- locked by active reservations
    updated_at  TIMESTAMP DEFAULT NOW(),
    version     INTEGER DEFAULT 0,           -- optimistic locking
    UNIQUE(store_id, product_id)
);

-- Carts
CREATE TABLE "vikas-carts" (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES "vikas-users"(id),
    product_id  UUID NOT NULL REFERENCES "vikas-dataset"(id),
    quantity    INTEGER NOT NULL DEFAULT 1,
    added_at    TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- Orders
CREATE TABLE "vikas-orders" (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID NOT NULL REFERENCES "vikas-users"(id),
    total            NUMERIC(10, 2) NOT NULL,
    status           VARCHAR(50) DEFAULT 'PENDING',
    shipping_address JSONB,
    items            JSONB NOT NULL,   -- snapshot of ordered products
    created_at       TIMESTAMP DEFAULT NOW(),
    updated_at       TIMESTAMP DEFAULT NOW()
);

-- Reservations
CREATE TABLE "vikas-reservations" (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID NOT NULL REFERENCES "vikas-users"(id),
    product_id   UUID NOT NULL REFERENCES "vikas-dataset"(id),
    store_id     UUID NOT NULL REFERENCES "vikas-stores"(id),
    slot_time    TIMESTAMP NOT NULL,
    slot_end     TIMESTAMP NOT NULL,
    quantity     INTEGER NOT NULL DEFAULT 1,
    status       VARCHAR(50) DEFAULT 'PENDING',
    qr_code      TEXT,                -- Base64 QR image
    qr_token     VARCHAR(100),        -- Verification token
    expires_at   TIMESTAMP,
    created_at   TIMESTAMP DEFAULT NOW()
);

-- AI Query Log
CREATE TABLE "vikas-ai-logs" (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID REFERENCES "vikas-users"(id),
    query       TEXT,
    intent      VARCHAR(100),
    response    TEXT,
    latency_ms  INTEGER,
    created_at  TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_inventory_store ON "vikas-inventory"(store_id);
CREATE INDEX idx_inventory_product ON "vikas-inventory"(product_id);
CREATE INDEX idx_reservations_user ON "vikas-reservations"(user_id);
CREATE INDEX idx_reservations_slot ON "vikas-reservations"(slot_time);
CREATE INDEX idx_product_search ON "vikas-dataset" USING GIN(search_vector);
CREATE INDEX idx_product_embedding ON "vikas-dataset" USING ivfflat(embedding vector_cosine_ops);
```

### 11.2 Entity Relationship Summary

```
vikas-users ──< vikas-carts >── vikas-dataset
vikas-users ──< vikas-orders
vikas-users ──< vikas-reservations >── vikas-stores
                vikas-reservations >── vikas-dataset
vikas-stores ──< vikas-inventory >── vikas-dataset
```

---

## 12. API Endpoints Reference

### Base URL
- **Spring Boot Primary:** `https://api.vikas.app/api/v1`
- **Node.js Fallback:** `https://ai.vikas.app/api/v1`

### 12.1 Authentication

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/auth/register` | Register new user | Public |
| POST | `/auth/login` | Login, returns JWT | Public |
| POST | `/auth/logout` | Invalidate token | Bearer |
| POST | `/auth/refresh` | Refresh access token | Refresh Token |
| GET | `/auth/me` | Get current user profile | Bearer |
| PATCH | `/auth/me` | Update profile | Bearer |
| POST | `/auth/change-password` | Change password | Bearer |

### 12.2 Products

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/products` | List products (paginated, filterable) | Public |
| GET | `/products/:id` | Get single product | Public |
| GET | `/products/:id/stores` | Store availability for product | Public |
| GET | `/products/:id/similar` | AI-powered similar products | Public |
| GET | `/products/meta/categories` | All categories | Public |
| GET | `/products/meta/brands` | All brands | Public |
| GET | `/products/search?q=` | Full-text + semantic search | Public |

**Query Parameters for `/products`:**
- `category`, `brand`, `minPrice`, `maxPrice`, `minRating`, `inStock`, `storeId`, `page`, `size`, `sort`

### 12.3 Cart

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/cart` | Get user's cart | Bearer |
| POST | `/cart` | Add item to cart | Bearer |
| PUT | `/cart/:id` | Update item quantity | Bearer |
| DELETE | `/cart/:id` | Remove item from cart | Bearer |
| DELETE | `/cart` | Clear entire cart | Bearer |

### 12.4 Orders

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/orders` | Get user's order history | Bearer |
| GET | `/orders/:id` | Get specific order | Bearer |
| POST | `/orders` | Place order from cart | Bearer |
| POST | `/orders/buy-now` | Instant buy (skip cart) | Bearer |
| PATCH | `/orders/:id/cancel` | Cancel pending order | Bearer |

### 12.5 Reservations

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/reservations/slots` | Get available slots for store+product | Bearer |
| POST | `/reservations` | Create reservation (locks inventory) | Bearer |
| GET | `/reservations/:id` | Get reservation + QR code | Bearer |
| GET | `/reservations` | User's reservation history | Bearer |
| PATCH | `/reservations/:id/cancel` | Cancel reservation | Bearer |
| POST | `/reservations/:id/scan` | Scan QR (store admin completes pickup) | Admin |

### 12.6 Stores

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/stores` | List all stores | Public |
| GET | `/stores/:id` | Store detail + hours | Public |
| GET | `/stores/nearby?lat=&lng=` | Stores near coordinates | Public |
| GET | `/stores/:id/inventory` | Full inventory for a store | Admin |

### 12.7 AI (Node.js Service)

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/ai/query` | General AI shopping query | Bearer |
| POST | `/ai/product/:id/ask` | Ask about specific product | Bearer |
| POST | `/ai/compare` | Compare multiple products | Bearer |
| GET | `/ai/recommendations/:productId` | AI product recommendations | Bearer |
| GET | `/ai/search?q=` | Semantic search query | Public |

**Request body for `/ai/query`:**
```json
{
  "message": "I need running shoes under ₹3000 with good cushioning",
  "sessionId": "uuid",
  "context": {
    "currentProductId": "optional",
    "cartItems": []
  }
}
```

### 12.8 Admin

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/admin/analytics` | Dashboard KPI summary | Super Admin |
| GET | `/admin/analytics/sales` | Sales aggregation by time range | Super Admin |
| GET | `/admin/analytics/reservations` | Reservation metrics | Admin |
| GET | `/admin/analytics/ai-queries` | AI query trends | Super Admin |
| GET | `/admin/reservations` | All reservations (filterable) | Admin |
| GET | `/admin/users` | User list | Super Admin |
| GET | `/admin/health` | System health status | Super Admin |

### 12.9 WebSocket Events

| Event | Direction | Description |
|---|---|---|
| `inventory:update` | Server → Client | Real-time stock change for a product |
| `reservation:confirmed` | Server → Client | Reservation confirmation |
| `reservation:expiring` | Server → Client | 5-min expiry warning |
| `slot:capacity` | Server → Client | Slot fill level update |

---

## 13. AI & RAG Subsystem

### 13.1 RAG Architecture

The RAG system uses pgvector to enable semantic product search and contextually grounded AI responses from the 28,000-product catalog.

**Embedding Generation (Offline/Seed):**
1. For each product: concatenate `title + description + category + brand`
2. Generate 1536-dim embedding via OpenAI `text-embedding-3-small` or equivalent
3. Store in `vikas-dataset.embedding` column (pgvector)

**Query-time RAG Flow:**
1. Embed user query → 1536-dim vector
2. `SELECT * FROM "vikas-dataset" ORDER BY embedding <=> $1 LIMIT 10` (cosine similarity)
3. Format top-10 products as context chunks
4. Inject into LLM prompt with user query
5. LLM (Groq LLaMA 3.1 70B) generates grounded response

### 13.2 AI Agent Capabilities

| Capability | Description |
|---|---|
| Product Discovery | Semantic search beyond keyword matching |
| Specification Q&A | Answer "does this have X feature?" using product description |
| Comparison | Side-by-side feature analysis of 2-3 products |
| Budget Recommendations | "Best options under ₹X for Y use case" |
| Stock Awareness | Real-time inventory queries via Spring Boot API tool call |
| Personalization | Recommendations based on cart and order history |
| Context Memory | Session-scoped conversation history (Redis) |

### 13.3 LLM Configuration

| Parameter | Value |
|---|---|
| Primary Model | Groq `llama-3.1-70b-versatile` |
| Fallback Model | Groq `mixtral-8x7b-32768` |
| Max Context Tokens | 8,192 |
| Temperature | 0.3 (factual responses) |
| Max Output Tokens | 1,024 |
| Rate Limit | 30 requests/min per user |
| Session TTL | 30 minutes (Redis) |

---

## 14. AR Try-On Module

### 14.1 Technical Approach

The AR module uses **React Native Vision Camera** with **Mediapipe Face Mesh** for facial landmark detection, enabling 3D overlay rendering for supported product categories (eyewear, headwear, jewelry, etc.).

**Supported Categories (MVP):**
- Sunglasses / Eyewear
- Headbands / Hats / Caps

**Technical Stack:**
- Vision Camera + Frame Processor (JSI/C++ based, 60fps)
- Mediapipe Face Mesh (468 facial landmarks)
- Three.js / Expo GL for 3D model rendering
- 3D assets (.glb format) served from Cloudflare R2

### 14.2 AR Flow

```
Camera Permissions Check
        │
        ▼
Vision Camera Preview (front-facing)
        │
        ▼
Mediapipe Frame Processor
  (face mesh landmarks @ 30fps)
        │
        ▼
Calculate 3D anchor points
  (eye corners, nose bridge, etc.)
        │
        ▼
Three.js render 3D product model
  (positioned + scaled to face mesh)
        │
        ▼
User sees product virtually worn
        │
        ├── Capture screenshot → Share / Save
        └── Add to Cart / Reserve
```

### 14.3 Graceful Fallback

- If device does not support Vision Camera (old hardware, web): show 2D overlay on static photo
- If no AR model exists for product: show 360-degree product viewer instead
- AR capability detection on app launch, gracefully hide feature for unsupported devices

---

## 15. Reservation & Click-Collect Engine

### 15.1 Slot Management

**Slot Generation Logic:**
- Slots are pre-generated for event days by store admins via admin panel
- Default: 30-minute intervals from store open to close
- Each slot has a configurable capacity (e.g., max 10 active reservations simultaneously)
- Slot availability = `capacity - (active reservations for that slot_time at that store)`

**Reservation State Machine:**

```
PENDING (slot locked, inventory reserved)
    │
    ├─ [15 min timeout without payment confirmation] → EXPIRED
    │       └─ inventory lock released
    │
    ├─ [User pays or confirms] → CONFIRMED
    │       └─ QR code generated
    │
    ├─ [User cancels] → CANCELLED
    │       └─ inventory lock released
    │
    └─ [Store admin scans QR] → COMPLETED
            └─ inventory quantity decremented
```

### 15.2 Overbooking Prevention

The system uses **database-level serializable isolation** in Spring Boot to prevent race conditions:

```java
@Transactional(isolation = Isolation.SERIALIZABLE)
public Reservation createReservation(ReservationRequest request) {
    Inventory inv = inventoryRepository.findByStoreAndProduct(
        request.storeId(), request.productId()
    ); // Acquires row-level lock
    
    int available = inv.getQuantity() - inv.getReserved();
    if (available < request.quantity()) {
        throw new OverbookingException("Insufficient stock for this slot");
    }
    
    inv.setReserved(inv.getReserved() + request.quantity());
    inventoryRepository.save(inv);
    
    // Create reservation...
}
```

### 15.3 QR Code Validation

- QR code encodes a signed JWT: `{ reservationId, userId, storeId, expiry, signature }`
- Store admin scans via admin app → calls `/reservations/:id/scan`
- Spring Boot validates JWT signature, checks reservation status, confirms pick up
- Prevents duplicate scans (status check before processing)

---

## 16. Real-Time Analytics Dashboard

### 16.1 Admin Dashboard KPIs

| Metric | Source | Refresh |
|---|---|---|
| Today's Reservations | PostgreSQL aggregate | 60s (cached) |
| Completed Pickups | PostgreSQL count | 60s |
| Active Carts | Redis (cart sessions) | Real-time |
| AI Queries Today | vikas-ai-logs aggregate | 5 min |
| Revenue (orders) | vikas-orders sum | 60s |
| Peak Hour | Reservations by hour | Pre-computed |

### 16.2 Heatmap & Trend Charts

- **Sales Heatmap:** Orders by hour × day-of-week matrix for last 4 weeks
- **Reservation Timeline:** Slot-by-slot fill levels across stores
- **AI Query Topics:** NLP clustering of top query intents (via Node.js analytics service)
- **Inventory Velocity:** Which products are being reserved/sold fastest

### 16.3 Store Manager View (Simplified)
- Today's reservation queue (sorted by slot time)
- Low stock alerts (< 5 units)
- QR scan tool for pickup validation
- Quick inventory edit capability

---

## 17. Non-Functional Requirements

### 17.1 Performance

| Requirement | Target |
|---|---|
| API response time (P95) | < 500ms |
| AI chat response time | < 2 seconds |
| Product catalog page load | < 1 second |
| WebSocket inventory update | < 100ms |
| Concurrent users (peak) | 10,000+ |
| Database query time (P99) | < 200ms |

### 17.2 Scalability

- **Horizontal scaling:** Spring Boot services are stateless (sessions in Redis), deployable as multiple instances behind a load balancer
- **Database:** Connection pooling via HikariCP (Spring Boot), Prisma connection pooling (Node.js)
- **Cache strategy:** Redis for hot data (inventory, sessions, analytics); CDN for static assets
- **Docker-ready:** All services containerized; Docker Compose for local dev, Kubernetes-ready for production

### 17.3 Availability

- **Target SLA:** 99.9% uptime (8.7 hours downtime/year max)
- **Fallback:** Node.js backend activates automatically when Spring Boot is unhealthy
- **Database:** Aiven PostgreSQL with automated failover and daily backups
- **Health checks:** Spring Boot Actuator + Node.js `/health` endpoints monitored every 10 seconds

### 17.4 Accessibility (WCAG 2.1 AA)

- All interactive elements have `accessibilityLabel` props (React Native)
- Color contrast ratio ≥ 4.5:1 for normal text
- Minimum touch target size: 44×44pt
- Screen reader compatibility for core shopping flows
- Web: semantic HTML via `react-native-web` ARIA mappings

---

## 18. Security Architecture

### 18.1 Authentication & Authorization

- JWT access tokens (HS256, 15-min TTL)
- Refresh tokens (30-day TTL, stored in `HttpOnly` cookie on web / SecureStore on mobile)
- Token revocation via Redis blacklist on logout
- Role hierarchy: `SUPER_ADMIN > STORE_ADMIN > CUSTOMER`
- Spring Security method-level `@PreAuthorize` annotations

### 18.2 API Security

- All endpoints over HTTPS/TLS 1.3
- Input validation: Hibernate Validator (Spring Boot) + Zod (Node.js)
- SQL injection prevention: parameterized queries via JPA/Prisma
- Rate limiting: per-user per-endpoint limits (future: Spring Cloud Gateway)
- CORS: configured allowlist of frontend domains only

### 18.3 Data Security

- PostgreSQL: SSL enforced (Aiven managed certificate)
- Passwords: bcrypt hashed (cost factor 12), never stored in plaintext
- PII: User email, phone masked in logs
- QR tokens: signed JWT with expiry, single-use validation

---

## 19. Deployment Strategy

### 19.1 Infrastructure

| Component | Platform | Notes |
|---|---|---|
| React Native App | Expo EAS Build + App Store / Play Store | Mobile |
| React Native Web | Vercel | Web deployment |
| Spring Boot Backend | Railway / Render / AWS Elastic Beanstalk | Docker container |
| Node.js Backend | Railway / Render | Docker container |
| PostgreSQL | Aiven Cloud | Managed, auto-failover |
| Redis | Upstash | Serverless Redis |
| AR Assets (3D models) | Cloudflare R2 + CDN | Low-latency global delivery |
| AI API | Groq Cloud | LLM inference |

### 19.2 CI/CD Pipeline

```
Developer pushes to GitHub
        │
        ▼
GitHub Actions trigger:
  ├── Lint + TypeScript check (React Native)
  ├── Maven build + JUnit tests (Spring Boot)
  └── Jest tests (Node.js)
        │
        ▼
Docker image build (Spring Boot + Node.js)
        │
        ▼
Push to container registry (GHCR)
        │
        ▼
Deploy to staging environment
        │
        ▼
Automated smoke tests
        │
        ▼
Manual approval → Deploy to production
```

### 19.3 Environment Configuration

| Environment | Purpose |
|---|---|
| `development` | Local Docker Compose, SQLite fallback |
| `staging` | Full cloud stack, production-like data |
| `production` | Live environment with monitoring |

---

## 20. Risks & Mitigation

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Groq API rate limits during peak | Medium | High | Redis response cache (TTL 5 min for similar queries), graceful degradation to keyword search |
| Database overload during flash sale | Medium | Critical | Index optimization, Redis cache layer, read replicas (future) |
| AR incompatibility on older devices | High | Medium | Graceful fallback to 2D viewer, capability detection on launch |
| Overbooking race condition | Low | Critical | Serializable DB transactions + optimistic locking |
| Spring Boot failover delay | Low | High | Node.js fallback with < 30s switchover, Redis-mirrored critical data |
| Expo SDK breaking changes | Low | Medium | Pin SDK version, staged upgrade process |
| pgvector embedding drift | Low | Low | Periodic re-indexing job, version-controlled seed script |

---

## 21. Feature Roadmap

### Phase 1 – MVP (Weeks 1–8)
- Authentication (Spring Boot)
- Product catalog with filtering + full-text search
- Cart & order flow
- Basic AI chatbot (Groq + RAG)
- Store inventory check
- Click & Collect reservations + QR
- Admin analytics dashboard
- React Native app (iOS + Android + Web)

### Phase 2 – Enhancement (Weeks 9–16)
- AR Try-On (eyewear category)
- WebSocket real-time inventory
- Push notifications (Expo)
- Personalization agent (order history-based)
- Product comparison UI
- Store manager mobile view

### Phase 3 – Scale (Weeks 17–24)
- Payment gateway integration (Razorpay)
- Dynamic pricing AI
- Multi-store inventory transfer suggestions
- Live footfall / crowd detection (CCTV integration)
- Multi-tenant retailer white-labeling
- Loyalty & gamification layer

---

## 22. Definition of Done

A feature is considered complete when:

- All acceptance criteria are met and verified by QA
- Unit tests cover ≥ 80% of service-layer code
- API documented in Swagger (Spring Boot) and JSDoc (Node.js)
- Mobile (iOS + Android) and Web builds passing
- Performance benchmarks met (API < 500ms P95)
- Security review completed (no critical/high vulnerabilities)
- Deployed to staging and smoke-tested
- Product Owner sign-off received

**System-Level DoD:**
- Full omnichannel flow operable end-to-end
- AI chatbot resolving queries with ≥ 85% satisfaction (test set)
- Reservation system preventing overbooking under 1,000 concurrent booking attempts
- AR try-on functional on iOS 15+ and Android 10+ devices
- Node.js fallback activating automatically on Spring Boot failure
- Analytics dashboard showing live data with < 60s latency
- App deployable to App Store and Play Store

---

## 23. Conclusion

VIKAS represents a new paradigm in event-driven retail commerce — a platform engineered from the ground up for the chaos of festive surges, not adapted from standard e-commerce templates.

The architectural choices are deliberate:

- **React Native** for a single codebase that delivers a first-class experience on iOS, Android, and Web simultaneously — maximizing reach while minimizing development cost.
- **Spring Boot** as the production-grade, battle-tested primary backend — offering enterprise reliability, strong typing, transactional integrity, and mature ecosystem support for the critical services (inventory, reservations, orders).
- **Node.js** as the agile fallback and AI orchestration layer — leveraging JavaScript's LangChain/Groq ecosystem and rapid iteration capability for the intelligence features.
- **PostgreSQL + pgvector** as the unified data store — handling both transactional commerce data and semantic AI embeddings in a single, familiar system.

VIKAS is not simply an e-commerce application.

**It is event-driven retail intelligence infrastructure.**

It transforms the chaotic, unmanageable festive shopping surge into an orchestrated, predictable, data-driven experience — for customers, store managers, and business owners alike.

---

*Document Owner: VIKAS Engineering Team*  
*Review Cycle: Bi-weekly during active development*  
*Next Review Date: March 2026*

# 📄 PRODUCT REQUIREMENTS DOCUMENT (PRD)

# **VIKAS – Virtually Intelligent Knowledge Assisted Shopping**

### Category: Development → EventFlex Marketplace Platform

### Theme: AI for Society

---

# 1️⃣ Executive Summary

VIKAS is a scalable, AI-powered omnichannel marketplace platform designed to manage high-demand retail events (festivals, flash sales, seasonal spikes). It reduces queue congestion, improves inventory visibility, and enables intelligent online-to-offline shopping using AI, reservations, and AR.

The system aligns with **EventFlex Marketplace Platform** by delivering:

* Modular architecture
* Scalable backend infrastructure
* Secure authentication layer
* Real-time analytics
* User-focused omnichannel interface

---

# 2️⃣ Problem Statement (Detailed)

During festive seasons and retail events:

* Stores face 3–5x surge in demand.
* Long billing queues reduce customer satisfaction.
* Inventory mismatch causes wasted trips.
* Store managers lack predictive analytics.
* Overcrowding creates safety risks.

Traditional e-commerce systems do not integrate:

* Real-time store-level inventory
* Smart slot-based pickup
* AI-based demand orchestration
* AR-assisted buying

Retail infrastructure needs a scalable event-driven commerce system.

---

# 3️⃣ Goals & Objectives

## Primary Goals

* Reduce in-store queue time by 50%
* Enable real-time omnichannel inventory visibility
* Provide AI-powered decision assistance
* Enable event-driven scalability

## Secondary Goals

* Improve conversion rate
* Improve customer satisfaction
* Provide store-level analytics dashboard

---

# 4️⃣ Scope

## In Scope (MVP)

* Authentication
* Product catalog (28k dataset)
* Cart & checkout
* AI chatbot (RAG-based)
* Store inventory
* Click & Collect reservation
* AR Try-On
* Admin analytics (basic)

## Out of Scope (Future)

* Live CCTV crowd detection
* Payment gateway integration (Stripe/Razorpay)
* Multi-tenant retailer support
* Dynamic pricing AI

---

# 5️⃣ System Architecture

## High-Level Architecture

Frontend (Next.js)
↓
API Gateway (Express.js)
↓
Service Layer

* Auth Service
* Product Service
* Inventory Service
* AI Service
* Reservation Service
* Order Service
  ↓
  PostgreSQL (Aiven)

Optional:

* Groq LLM API
* Mediapipe WASM

---

# 6️⃣ Backend Structure (Detailed)

## Backend Folder Hierarchy

```
backend/
│
├── config/
│   └── db.js
│
├── models/
│   ├── User.js
│   ├── Product.js
│   ├── Inventory.js
│   ├── Cart.js
│   ├── Order.js
│   ├── Reservation.js
│   ├── Store.js
│   └── Session.js
│
├── routes/
│   ├── authRoutes.js
│   ├── productRoutes.js
│   ├── cartRoutes.js
│   ├── orderRoutes.js
│   ├── reservationRoutes.js
│   ├── aiRoutes.js
│   └── adminRoutes.js
│
├── middleware/
│   ├── auth.js
│   └── errorHandler.js
│
├── services/
│   ├── groq.js
│   ├── rag.js
│   ├── inventoryService.js
│   ├── reservationService.js
│   └── analyticsService.js
│
├── agents/
│   ├── orchestrator.js
│   ├── personalization.js
│   ├── analyticsEngine.js
│
├── scripts/
│   ├── seedData.js
│   └── testConnection.js
│
└── server.js
```

---

# 7️⃣ Backend Components

## 7.1 Authentication Layer

* JWT-based authentication
* bcrypt password hashing
* Role-based authorization
* Session management

## 7.2 Product Service

* Product filtering
* Pagination
* Category & brand metadata
* Store-level availability

## 7.3 Inventory Service

* Real-time stock sync
* Reservation locking
* Stock decrement logic
* Prevent overbooking

## 7.4 Reservation Engine

* Slot-based pickup
* Expiry timer
* QR code generation
* Status tracking

## 7.5 AI Service

* Groq LLM integration
* RAG-based retrieval
* Context injection
* Product comparison

## 7.6 Analytics Engine

* Reservation metrics
* Peak hour detection
* Query analysis
* Sales aggregation

---

# 8️⃣ Database Schema (PostgreSQL)

## Tables

### VIKAS-users

* id
* email
* password_hash
* role
* createdAt

### VIKAS-dataset

* id
* title
* description
* category
* price
* rating
* brand

### VIKAS-inventory

* id
* storeId
* productId
* quantity

### VIKAS-stores

* id
* name
* location
* address

### VIKAS-carts

* id
* userId
* productId
* quantity

### VIKAS-orders

* id
* userId
* total
* status
* shippingAddress

### VIKAS-reservations

* id
* userId
* productId
* storeId
* slot
* status

---

# 9️⃣ API Endpoints Tree

## Base URL

`/api`

---

## Authentication

```
POST   /auth/register
POST   /auth/login
POST   /auth/logout
GET    /auth/me
```

---

## Products

```
GET    /products
GET    /products/:id
GET    /products/:id/stores
GET    /products/meta/categories
GET    /products/meta/brands
```

---

## Cart

```
GET    /cart
POST   /cart
PUT    /cart/:id
DELETE /cart/:id
```

---

## Orders

```
GET    /orders
POST   /orders
POST   /orders/buy-now
```

---

## AI

```
POST   /ai/query
POST   /ai/product/:id/ask
POST   /ai/compare
GET    /ai/recommendations/:productId
```

---

## Reservations

```
POST   /reservations/create
POST   /reservations/:id/pay
GET    /reservations/:id
```

---

## Admin

```
GET    /admin/analytics
GET    /admin/reservations
GET    /admin/sales
```

---

# 🔟 Frontend Structure (Next.js 14)

```
frontend/
│
├── src/app/
│   ├── page.js
│   ├── layout.js
│   ├── products/
│   ├── product/[id]/
│   ├── cart/
│   ├── checkout/
│   ├── orders/
│   ├── auth/
│   ├── stores/
│   ├── reservation/
│   ├── ar/
│   └── admin/
│
├── components/
│   ├── Header.js
│   ├── Footer.js
│   ├── ProductCard.js
│   ├── ChatBubble.js
│   ├── ARView.js
│   ├── ReservationModal.js
│   ├── StoreLocator.js
│
├── lib/
│   ├── api.js
│   └── authContext.js
```

---

# 11️⃣ Frontend Features

## Core Features

* Responsive UI
* Amazon-like layout
* Product filters
* Pagination

## AI Features

* Chat assistant
* AI search results
* Comparison view

## Omnichannel

* Store availability checker
* Click & Collect
* QR display

## AR Module

* Mediapipe face tracking
* 3D overlay rendering
* Camera permission management

---

# 12️⃣ Non-Functional Requirements

## Performance

* API response < 500ms
* AI response < 2 seconds

## Scalability

* Stateless server
* Cloud deployable
* Docker-ready

## Security

* JWT auth
* SSL database
* Input validation
* Rate limiting (future)

## Accessibility

* Mobile-first design
* ARIA labels
* Color contrast compliance

---

# 13️⃣ Real-Time Analytics Dashboard

Admin can see:

* Live reservations per store
* Sales heatmap
* AI query trends
* Peak time distribution

---

# 14️⃣ Key Features List (Complete)

* User registration/login
* Product catalog
* Smart filtering
* AI shopping assistant
* Product comparison
* Personalized recommendations
* Store locator
* Inventory check
* Click & Collect
* QR pickup
* AR try-on
* Order history
* Admin analytics
* Secure session management

---

# 15️⃣ Risks & Mitigation

| Risk             | Mitigation          |
| ---------------- | ------------------- |
| API rate limits  | Caching             |
| DB overload      | Indexing            |
| AR compatibility | Graceful fallback   |
| Overbooking      | Transaction locking |

---

# 16️⃣ Deployment Strategy

Frontend → Vercel
Backend → Render
Database → Aiven PostgreSQL
AI → Groq API

---

# 17️⃣ Definition of Done

* Fully functional omnichannel flow
* AI working with RAG
* Reservation prevents overbooking
* AR works on mobile
* Deployed & accessible
* Analytics dashboard working

---

# 18️⃣ Conclusion

VIKAS is a modular, scalable, AI-driven EventFlex marketplace infrastructure designed to manage festive demand surges through intelligent inventory orchestration, reservation-based queue reduction, and omnichannel integration.

It is not just e-commerce —
It is event-driven retail intelligence infrastructure.

---

If you'd like, I can now generate:

* 📊 Architecture diagram (visual explanation format)
* 🗺️ ER Diagram
* 🎤 5-minute judge pitch script
* 📈 Monetization & business model
* 🔥 Innovation justification section

Tell me what you need next.