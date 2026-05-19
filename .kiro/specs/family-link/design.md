# Design Document — FamilyLink

---

## Executive Summary *(Para el tribunal)*

**FamilyLink** es una aplicación web de localización familiar que permite a grupos de usuarios compartir su ubicación de forma voluntaria y controlada, sin GPS continuo. Desarrollada como TFG con arquitectura hexagonal y Domain-Driven Design (DDD), demuestra la aplicación práctica de patrones de ingeniería de software profesionales en un producto funcional y desplegable.

### Stack tecnológico — 100% gratuito (COST-1)

| Capa | Tecnología | Hosting |
|------|-----------|---------|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS 4 + MapLibre GL | Vercel (free) |
| Backend | Node.js 20 + Express + TypeScript | Render (free) |
| Base de datos | PostgreSQL 16 + Prisma ORM | Railway (free) |
| Cache | Redis (Upstash free tier) | Upstash (free) |
| Push notifications | Firebase FCM | Google (free) |

### Funcionalidades principales

- **Autenticación JWT** con refresh tokens, bcrypt y protección anti-brute-force
- **Círculos familiares** con roles (Circle_Admin / Circle_Member) e invitaciones por email
- **Compartición de ubicación bajo demanda** — botón manual, sin GPS continuo, historial 30 días
- **Zonas dibujables** en mapa con polígonos personalizables, colores #RRGGBB y notificaciones de entrada/salida
- **Modo Privacidad** — pausa el seguimiento con duración configurable (15 min – 8h), máx. 5 activaciones/día
- **Límites diarios por rol** — configurable por Circle_Admin (1–500 actualizaciones/día)
- **Tiempo real** — mapa actualizado vía WebSocket (Socket.IO) sin recargar página
- **i18n** — interfaz en español e inglés con detección automática del navegador

### Arquitectura en una imagen

```mermaid
graph TB
  subgraph FRONTEND["🖥️ Frontend (React + Vite)"]
    UI[UI Components]
    MAP[Map · MapLibre GL + MapTiler]
    STORE[Zustand + React Query]
  end
  subgraph GATEWAY["🔀 API Gateway (Express)"]
    REST[REST API]
    WS[WebSocket · Socket.IO]
    MW[JWT · Rate Limit · Zod]
  end
  subgraph APPLICATION["⚙️ Application Layer"]
    UC[Use Cases]
  end
  subgraph DOMAIN["🧠 Domain Layer — núcleo puro"]
    AGG[Aggregates · Entities]
    VO[Value Objects]
    DE[Domain Events]
    PORTS[Repository Ports]
  end
  subgraph INFRA["🏗️ Infrastructure"]
    PG[(PostgreSQL)]
    REDIS[(Redis Cache)]
    FCM[Firebase FCM]
  end

  FRONTEND --> GATEWAY --> APPLICATION --> DOMAIN
  DOMAIN --> PORTS --> INFRA
  DE --> FCM
  WS --> REDIS
```

### Calidad y testing

| Tipo | Herramienta | Cobertura objetivo |
|------|-------------|-------------------|
| Unitarios (Value Objects + Aggregates) | Vitest | **100%** |
| Integración (Use Cases + API) | Vitest + Supertest | **90%** |
| Componentes frontend | Vitest + React Testing Library | **80%** |
| E2E (flujo crítico completo) | Playwright | Flujo crítico cubierto |

### Requisitos no funcionales destacados

- TTFB API < 200ms (p95) · Mapa carga < 3s en 4G · 100 req/s concurrentes
- Disponibilidad 99.5% · Cifrado AES-256-GCM en reposo · TLS 1.2+ en tránsito
- WCAG 2.1 nivel AA · Modo oscuro/claro · Documentación API con Swagger/OpenAPI

### Enlace al repositorio

> 🔗 **GitHub:** *(añadir URL cuando el repositorio esté creado)*

---

## Table of Contents

1. [Introduction](#1-introduction)
   - 1.1 Propósito
   - 1.2 Arquitectura Hexagonal (Ports & Adapters)
   - 1.3 Domain-Driven Design (DDD)
   - 1.4 Stack Tecnológico
   - 1.5 Principios de Diseño
2. [System Architecture](#2-system-architecture)
   - 2.1 Visión General
   - 2.2 Descripción de Capas
   - 2.3 Flujo de una Petición Típica
3. [Domain Model & Ports/Adapters](#3-domain-model--portsadapters)
   - 3.1 Puertos (Repository Ports)
   - 3.2 Adaptadores (Infrastructure Adapters)
   - 3.3 Tabla resumen Port → Adapter
   - 3.4 Inyección de Dependencias
4. [Folder Structure](#4-folder-structure)
   - 4.1 Backend (Node.js + Express + DDD Hexagonal)
   - 4.2 Frontend (React + TypeScript + Vite)
   - 4.3 Raíz del Monorepo
5. [Data Models](#5-data-models)
   - 5.1 Diagrama Entidad-Relación
   - 5.2 Tabla: `users`
   - 5.3 Tabla: `circles`
   - 5.4 Tabla: `circle_members`
   - 5.5 Tabla: `zones`
   - 5.6 Tabla: `location_updates`
   - 5.7 Tabla: `invitations`
   - 5.8 Tabla: `daily_limits`
   - 5.9 Estrategia de limpieza automática
6. [API Endpoints](#6-api-endpoints)
   - 6.1 Auth (`/api/v1/auth`)
   - 6.2 Circles (`/api/v1/circles`)
   - 6.3 Locations (`/api/v1/locations`)
   - 6.4 Zones (`/api/v1/zones`)
   - 6.5 Privacy Mode (`/api/v1/privacy`)
   - 6.6 WebSocket Events (`/ws`)
7. [Security Design](#7-security-design)
   - 7.1 Autenticación JWT
   - 7.2 Autorización por Roles
   - 7.3 Rate Limiting
   - 7.4 Cifrado de Datos Sensibles
   - 7.5 Política de Retención de Datos
   - 7.6 Logs Seguros
   - 7.7 HTTPS y Headers de Seguridad
8. [Testing Strategy](#8-testing-strategy)
   - 8.1 Estrategia por Capas
   - 8.2 Librerías y Configuración
   - 8.3 Ejemplo: Test Unitario — `Coordinates`
   - 8.4 Ejemplo: Test de Integración — `ShareLocationUseCase`
   - 8.5 Test E2E — Flujo Crítico
   - 8.6 Cobertura Objetivo
   - 8.7 Comandos de Ejecución
9. [Deployment & CI/CD](#9-deployment--cicd)
   - 9.1 Entornos
   - 9.2 Pipeline CI/CD
   - 9.3 GitHub Actions — Backend
   - 9.4 GitHub Actions — Frontend
   - 9.5 Variables de Entorno
   - 9.6 Desarrollo Local con Docker Compose
   - 9.7 Estrategia de Rollback
10. [Zero-Cost Compliance (COST-1)](#10-zero-cost-compliance-cost-1)
    - 10.1 Tabla de Verificación de Servicios
    - 10.2 Riesgos Detallados y Mitigaciones
    - 10.3 Script `npm run check-costs`

---

## 1. Introduction

### 1.1 Propósito

Este documento describe el diseño técnico de FamilyLink, una aplicación de localización familiar con compartición de ubicación bajo demanda, zonas dibujables y modo privacidad. El diseño está orientado a servir como referencia de implementación para el Trabajo de Fin de Grado (TFG), cubriendo tanto las decisiones arquitectónicas de alto nivel como los detalles de implementación necesarios para construir el sistema.

### 1.2 Arquitectura Hexagonal (Ports & Adapters)

FamilyLink adopta la **arquitectura hexagonal** (también conocida como Ports & Adapters, propuesta por Alistair Cockburn) como patrón estructural principal. El objetivo es aislar completamente el núcleo de negocio de cualquier detalle tecnológico externo.

```
┌─────────────────────────────────────────────────────────┐
│                    MUNDO EXTERIOR                        │
│  (HTTP, WebSocket, PostgreSQL, FCM, Redis, Browser)      │
└──────────────────────┬──────────────────────────────────┘
                       │  Adapters (Infraestructura)
┌──────────────────────▼──────────────────────────────────┐
│                  CAPA DE APLICACIÓN                      │
│              (Use Cases / Orquestación)                  │
├─────────────────────────────────────────────────────────┤
│                   CAPA DE DOMINIO                        │
│   (Entities, Aggregates, Value Objects, Domain Events)   │
│              ← núcleo puro, sin dependencias →           │
└─────────────────────────────────────────────────────────┘
```

**Principio clave:** el dominio no importa nada de Express, PostgreSQL, Redis ni ninguna librería externa. Las dependencias siempre apuntan hacia adentro.

- **Ports (puertos):** interfaces definidas en el dominio que describen qué necesita el sistema (ej. `ICircleRepository`, `INotificationService`).
- **Adapters (adaptadores):** implementaciones concretas en la capa de infraestructura que satisfacen esos puertos (ej. `PostgresCircleRepository`, `FCMNotificationAdapter`).

### 1.3 Domain-Driven Design (DDD)

El modelo de dominio de FamilyLink se construye siguiendo los patrones tácticos de **DDD**:

| Patrón | Aplicación en FamilyLink |
|--------|--------------------------|
| **Entity** | `User`, `Circle`, `Zone`, `Invitation` — tienen identidad propia (UUID) |
| **Value Object** | `Coordinates`, `Email`, `ColorHex`, `ZonePolygon`, `DailyLimit` — inmutables, definidos por sus atributos |
| **Aggregate** | `Circle` (raíz) agrupa miembros, zonas e invitaciones; `User` gestiona su propio estado de privacidad |
| **Domain Event** | `LocationShared`, `ZoneEntered`, `ZoneExited`, `PrivacyModeActivated`, `CircleCreated` |
| **Repository Port** | `ICircleRepository`, `IUserRepository`, `IZoneRepository`, `ILocationRepository` |
| **Use Case** | `CreateCircleUseCase`, `ShareLocationUseCase`, `CreateZoneUseCase`, `ActivatePrivacyModeUseCase` |
| **Domain Service** | `ZoneEvaluationService` (lógica de intersección punto-polígono), `DailyLimitService` |

### 1.4 Stack Tecnológico

Todas las tecnologías seleccionadas cumplen la restricción **COST-1** (plan gratuito perpetuo o créditos suficientes para TFG).

#### Frontend
| Tecnología | Versión | Rol | Coste |
|-----------|---------|-----|-------|
| React | 18.x | UI framework | ✅ Gratuito |
| TypeScript | 5.x | Tipado estático | ✅ Gratuito |
| Vite | 5.x | Build tool + dev server | ✅ Gratuito |
| Tailwind CSS | 4.x | Utility-first CSS framework | ✅ Gratuito |
| MapLibre GL JS | 4.x | Mapas vectoriales 3D interactivos | ✅ Gratuito |
| react-map-gl | 7.x | Wrapper React para MapLibre GL | ✅ Gratuito |
| MapTiler | Free tier | Teselas vectoriales + estilos (streets, dark, satellite) | ✅ Gratuito (100k tiles/mes) |
| @mapbox/mapbox-gl-draw | 1.x | Dibujo de polígonos (geocercas) | ✅ Gratuito |
| Zustand | 4.x | Gestión de estado global | ✅ Gratuito |
| React Query (TanStack) | 5.x | Server state + caché | ✅ Gratuito |
| i18next | 23.x | Internacionalización | ✅ Gratuito |
| Framer Motion | 11.x | Animaciones fluidas estilo Apple | ✅ Gratuito |

#### Backend
| Tecnología | Versión | Rol | Coste |
|-----------|---------|-----|-------|
| Node.js | 20.x LTS | Runtime | ✅ Gratuito |
| Express | 4.x | HTTP framework | ✅ Gratuito |
| TypeScript | 5.x | Tipado estático | ✅ Gratuito |
| Zod | 3.x | Validación de schemas | ✅ Gratuito |
| Prisma | 5.x | ORM + migraciones | ✅ Gratuito |
| jsonwebtoken | 9.x | JWT auth | ✅ Gratuito |
| bcrypt | 5.x | Hash de contraseñas | ✅ Gratuito |
| Socket.IO | 4.x | WebSocket tiempo real | ✅ Gratuito |
| Swagger UI Express | 5.x | Documentación API | ✅ Gratuito |

#### Infraestructura
| Servicio | Plan | Rol | Coste |
|---------|------|-----|-------|
| PostgreSQL (Railway) | Free tier | Base de datos principal | ✅ Gratuito |
| Upstash Redis | Free tier (10k req/día) | Caché de ubicaciones activas | ✅ Gratuito |
| Firebase FCM | Gratuito ilimitado | Push notifications | ✅ Gratuito |
| Vercel | Free tier | Hosting frontend | ✅ Gratuito |
| Render | Free tier | Hosting backend | ✅ Gratuito |
| GitHub Actions | 2000 min/mes | CI/CD | ✅ Gratuito |

### 1.5 Principios de Diseño

Los siguientes principios guían todas las decisiones de implementación de FamilyLink:

**1. Dependency Inversion (DIP)**
El dominio nunca depende de la infraestructura. Los use cases dependen de interfaces (ports), no de implementaciones concretas. Esto permite sustituir PostgreSQL por cualquier otra base de datos sin tocar una línea de lógica de negocio.

**2. Single Responsibility (SRP)**
Cada clase tiene una única razón para cambiar. Los use cases orquestan pero no contienen lógica de dominio. Las entidades contienen lógica de dominio pero no acceden a la base de datos.

**3. Fail Fast con errores explícitos**
Las validaciones ocurren en el borde del sistema (capa de aplicación con Zod) y en el dominio (Value Objects que lanzan excepciones en construcción). Nunca se propagan estados inválidos hacia el interior.

**4. Inmutabilidad en Value Objects**
Todos los Value Objects son inmutables. Para "modificar" un Value Object se crea uno nuevo. Esto elimina bugs de estado compartido y facilita el testing.

**5. Eventos de dominio para efectos secundarios**
Las notificaciones, actualizaciones de caché y métricas se disparan mediante Domain Events, no mediante llamadas directas desde los use cases. Esto desacopla la lógica de negocio de los efectos secundarios.

**6. Coste cero (COST-1)**
Ninguna decisión técnica puede requerir pago. Ante dos opciones técnicamente equivalentes, se elige siempre la gratuita. Esta restricción se evalúa en cada pull request.

**7. Privacidad por defecto**
La ubicación de un usuario nunca se expone sin su consentimiento explícito. El Privacy_Mode es un estado de primera clase en el dominio, no un flag opcional.

**8. Testabilidad**
El diseño hexagonal garantiza que el dominio y los use cases son testeables sin levantar base de datos ni servidor HTTP. Los adapters se mockean mediante los ports.

---

*Las secciones 2–10 se desarrollarán en las siguientes iteraciones del documento.*

---

## 2. System Architecture

### 2.1 Visión General

FamilyLink se organiza en cinco capas bien diferenciadas. Las dependencias fluyen siempre hacia el interior: la infraestructura depende de la aplicación, la aplicación depende del dominio, y el dominio no depende de nadie.

```mermaid
graph TB
  subgraph FRONTEND["🖥️ Frontend (React + Vite)"]
    UI[UI Components]
    MAP[Map Component<br/>Leaflet + OSM]
    STORE[State Store<br/>Zustand]
    RQ[Server State<br/>React Query]
  end

  subgraph GATEWAY["🔀 API Gateway (Express)"]
    AUTH_R[/auth/*]
    CIRCLE_R[/circles/*]
    LOCATION_R[/locations/*]
    ZONE_R[/zones/*]
    WS[WebSocket<br/>Socket.IO]
    MW[Middleware<br/>JWT · Rate Limit · Zod]
  end

  subgraph APPLICATION["⚙️ Application Layer"]
    UC_AUTH[AuthUseCases]
    UC_CIRCLE[CircleUseCases]
    UC_LOC[LocationUseCases]
    UC_ZONE[ZoneUseCases]
    UC_PRIV[PrivacyUseCases]
    MAPPERS[DTOs & Mappers]
  end

  subgraph DOMAIN["🧠 Domain Layer"]
    AGG_CIRCLE[Circle Aggregate]
    AGG_USER[User Aggregate]
    ENT_ZONE[Zone Entity]
    ENT_INV[Invitation Entity]
    VO[Value Objects<br/>Coordinates · Email · ColorHex · ZonePolygon]
    DE[Domain Events<br/>LocationShared · ZoneEntered · ZoneExited · PrivacyModeActivated]
    PORTS[Repository Ports<br/>ICircleRepo · IUserRepo · IZoneRepo · ILocationRepo]
    DS[Domain Services<br/>ZoneEvaluationService · DailyLimitService]
  end

  subgraph INFRA["🏗️ Infrastructure"]
    PG[(PostgreSQL<br/>Railway)]
    REDIS[(Redis Cache<br/>Upstash)]
    FCM[Push Notifications<br/>Firebase FCM]
    ADAPTERS[Adapters<br/>PostgresCircleRepo · PostgresZoneRepo · ...]
  end

  UI --> AUTH_R
  MAP --> LOCATION_R
  MAP --> ZONE_R
  UI --> CIRCLE_R
  STORE --> RQ
  RQ --> GATEWAY
  UI --> WS

  AUTH_R --> MW
  CIRCLE_R --> MW
  LOCATION_R --> MW
  ZONE_R --> MW
  MW --> UC_AUTH
  MW --> UC_CIRCLE
  MW --> UC_LOC
  MW --> UC_ZONE
  MW --> UC_PRIV

  UC_AUTH --> AGG_USER
  UC_CIRCLE --> AGG_CIRCLE
  UC_LOC --> AGG_USER
  UC_LOC --> DS
  UC_ZONE --> ENT_ZONE
  UC_ZONE --> DS
  UC_PRIV --> AGG_USER

  AGG_CIRCLE --> PORTS
  AGG_USER --> PORTS
  ENT_ZONE --> PORTS
  DS --> PORTS
  AGG_CIRCLE --> DE
  AGG_USER --> DE
  ENT_ZONE --> DE

  PORTS --> ADAPTERS
  ADAPTERS --> PG
  ADAPTERS --> REDIS
  DE --> FCM
  WS --> REDIS
```

### 2.2 Descripción de Capas

#### Frontend
Aplicación React + TypeScript construida con Vite. Se comunica con el backend exclusivamente a través de la API REST (React Query) y WebSocket (Socket.IO client) para actualizaciones en tiempo real del mapa. El estado global de sesión y UI se gestiona con Zustand.

#### API Gateway
Capa Express que actúa como punto de entrada único. Responsabilidades:
- Routing por recurso (`/auth`, `/circles`, `/locations`, `/zones`)
- Middleware transversal: verificación JWT, rate limiting por IP, validación de payloads con Zod
- Servidor WebSocket (Socket.IO) para emitir eventos de ubicación y zona en tiempo real
- Generación automática de documentación con Swagger UI

#### Application Layer
Contiene los Use Cases que orquestan las operaciones de negocio. Cada use case:
- Recibe un DTO validado
- Coordina entidades y servicios de dominio
- Persiste cambios a través de los Repository Ports
- Emite Domain Events para efectos secundarios (notificaciones, caché)
- Devuelve un DTO de respuesta

No contiene lógica de negocio propia — esa responsabilidad pertenece al dominio.

#### Domain Layer
Núcleo puro del sistema. No importa ninguna librería externa. Contiene:
- **Aggregates** (`Circle`, `User`): raíces transaccionales con invariantes de negocio
- **Entities** (`Zone`, `Invitation`): objetos con identidad propia
- **Value Objects** (`Coordinates`, `Email`, `ColorHex`, `ZonePolygon`, `DailyLimit`): inmutables, con validación en construcción
- **Domain Events**: hechos de negocio que han ocurrido
- **Domain Services** (`ZoneEvaluationService`, `DailyLimitService`): lógica que no pertenece a una sola entidad
- **Repository Ports**: interfaces que definen el contrato de persistencia

#### Infrastructure
Implementaciones concretas de los ports. Incluye:
- **Adapters de persistencia**: `PostgresCircleRepository`, `PostgresZoneRepository`, etc. (via Prisma ORM)
- **Adapter de caché**: `UpstashRedisLocationCache` para ubicaciones activas
- **Adapter de notificaciones**: `FCMNotificationAdapter` para push notifications
- **Adapter de eventos**: publicación de Domain Events hacia Socket.IO y FCM

### 2.3 Flujo de una Petición Típica

El siguiente diagrama muestra el ciclo completo de la operación "compartir ubicación":

```mermaid
sequenceDiagram
  actor User as 👤 Usuario
  participant FE as Frontend
  participant GW as API Gateway
  participant UC as ShareLocationUseCase
  participant DOM as Domain (User Aggregate)
  participant REPO as ILocationRepository
  participant PG as PostgreSQL
  participant REDIS as Redis Cache
  participant WS as Socket.IO
  participant FCM as Firebase FCM

  User->>FE: Pulsa "Compartir ubicación"
  FE->>GW: POST /locations {lat, lng}
  GW->>GW: Verifica JWT + valida payload (Zod)
  GW->>UC: execute(ShareLocationDTO)
  UC->>DOM: user.shareLocation(coordinates)
  DOM->>DOM: Valida Daily_Limit + Privacy_Mode
  DOM-->>UC: LocationShared event
  UC->>REPO: save(locationUpdate)
  REPO->>PG: INSERT location_updates
  UC->>REDIS: cache.setActiveLocation(userId, coords)
  UC->>WS: emit('location:updated', payload)
  UC->>FCM: notify circle members (Zone evaluation)
  WS-->>FE: location:updated event
  FE-->>User: Marcador actualizado en mapa
```

*Las secciones 4–10 se desarrollarán en las siguientes iteraciones del documento.*

---

## 3. Domain Model & Ports/Adapters

### 3.1 Puertos (Repository Ports)

Los puertos son interfaces TypeScript definidas en la capa de dominio. Representan **contratos** que el dominio necesita satisfacer, sin saber cómo se implementan. Cada puerto vive en `src/domain/ports/`.

#### IUserRepository

```typescript
// src/domain/ports/IUserRepository.ts
export interface IUserRepository {
  findById(id: UserId): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  save(user: User): Promise<void>;
  delete(id: UserId): Promise<void>;
}
```

#### ICircleRepository

```typescript
// src/domain/ports/ICircleRepository.ts
export interface ICircleRepository {
  findById(id: CircleId): Promise<Circle | null>;
  findByMemberId(userId: UserId): Promise<Circle[]>;
  save(circle: Circle): Promise<void>;
  delete(id: CircleId): Promise<void>;
}
```

#### ILocationRepository

```typescript
// src/domain/ports/ILocationRepository.ts
export interface ILocationRepository {
  save(location: LocationUpdate): Promise<void>;
  findLatestByUserId(userId: UserId): Promise<LocationUpdate | null>;
  findByCircleId(circleId: CircleId, since: Date): Promise<LocationUpdate[]>;
  deleteOlderThan(date: Date): Promise<void>;
  countTodayByUserId(userId: UserId): Promise<number>;
}
```

#### IZoneRepository

```typescript
// src/domain/ports/IZoneRepository.ts
export interface IZoneRepository {
  findById(id: ZoneId): Promise<Zone | null>;
  findByCircleId(circleId: CircleId): Promise<Zone[]>;
  save(zone: Zone): Promise<void>;
  delete(id: ZoneId): Promise<void>;
  countByCircleId(circleId: CircleId): Promise<number>;
}
```

#### IInvitationRepository

```typescript
// src/domain/ports/IInvitationRepository.ts
export interface IInvitationRepository {
  findById(id: InvitationId): Promise<Invitation | null>;
  findPendingByCircleId(circleId: CircleId): Promise<Invitation[]>;
  findPendingByEmail(email: Email): Promise<Invitation[]>;
  save(invitation: Invitation): Promise<void>;
  invalidate(id: InvitationId): Promise<void>;
}
```

#### Puertos de servicios externos

```typescript
// src/domain/ports/INotificationService.ts
export interface INotificationService {
  sendPushToCircle(circleId: CircleId, payload: NotificationPayload): Promise<void>;
  sendEmailToUser(userId: UserId, template: EmailTemplate): Promise<void>;
}

// src/domain/ports/ILocationCache.ts
export interface ILocationCache {
  setActiveLocation(userId: UserId, coords: Coordinates, ttlSeconds: number): Promise<void>;
  getActiveLocation(userId: UserId): Promise<Coordinates | null>;
  removeActiveLocation(userId: UserId): Promise<void>;
}

// src/domain/ports/IEventPublisher.ts
export interface IEventPublisher {
  publish(event: DomainEvent): Promise<void>;
}
```

---

### 3.2 Adaptadores (Infrastructure Adapters)

Los adaptadores implementan los puertos en la capa de infraestructura (`src/infrastructure/`). Dependen de tecnologías concretas (Prisma, Upstash, FCM) pero el dominio nunca los conoce directamente.

```mermaid
classDiagram
  class IUserRepository {
    <<interface>>
    +findById(id) User
    +findByEmail(email) User
    +save(user) void
    +delete(id) void
  }
  class ICircleRepository {
    <<interface>>
    +findById(id) Circle
    +findByMemberId(userId) Circle[]
    +save(circle) void
    +delete(id) void
  }
  class ILocationRepository {
    <<interface>>
    +save(location) void
    +findLatestByUserId(userId) LocationUpdate
    +findByCircleId(circleId, since) LocationUpdate[]
    +countTodayByUserId(userId) number
  }
  class IZoneRepository {
    <<interface>>
    +findById(id) Zone
    +findByCircleId(circleId) Zone[]
    +save(zone) void
    +delete(id) void
  }
  class INotificationService {
    <<interface>>
    +sendPushToCircle(circleId, payload) void
    +sendEmailToUser(userId, template) void
  }
  class ILocationCache {
    <<interface>>
    +setActiveLocation(userId, coords, ttl) void
    +getActiveLocation(userId) Coordinates
    +removeActiveLocation(userId) void
  }

  class PostgresUserRepository {
    -prisma: PrismaClient
    +findById(id) User
    +findByEmail(email) User
    +save(user) void
    +delete(id) void
  }
  class PostgresCircleRepository {
    -prisma: PrismaClient
    +findById(id) Circle
    +findByMemberId(userId) Circle[]
    +save(circle) void
    +delete(id) void
  }
  class PostgresLocationRepository {
    -prisma: PrismaClient
    +save(location) void
    +findLatestByUserId(userId) LocationUpdate
    +findByCircleId(circleId, since) LocationUpdate[]
    +countTodayByUserId(userId) number
  }
  class PostgresZoneRepository {
    -prisma: PrismaClient
    +findById(id) Zone
    +findByCircleId(circleId) Zone[]
    +save(zone) void
    +delete(id) void
  }
  class FCMNotificationAdapter {
    -fcmApp: FirebaseApp
    +sendPushToCircle(circleId, payload) void
    +sendEmailToUser(userId, template) void
  }
  class UpstashLocationCache {
    -redis: Redis
    +setActiveLocation(userId, coords, ttl) void
    +getActiveLocation(userId) Coordinates
    +removeActiveLocation(userId) void
  }

  IUserRepository <|.. PostgresUserRepository
  ICircleRepository <|.. PostgresCircleRepository
  ILocationRepository <|.. PostgresLocationRepository
  IZoneRepository <|.. PostgresZoneRepository
  INotificationService <|.. FCMNotificationAdapter
  ILocationCache <|.. UpstashLocationCache
```

---

### 3.3 Tabla resumen Port → Adapter

| Puerto (Dominio) | Adaptador (Infraestructura) | Tecnología | Ubicación |
|-----------------|----------------------------|-----------|-----------|
| `IUserRepository` | `PostgresUserRepository` | Prisma + PostgreSQL | `src/infrastructure/persistence/` |
| `ICircleRepository` | `PostgresCircleRepository` | Prisma + PostgreSQL | `src/infrastructure/persistence/` |
| `ILocationRepository` | `PostgresLocationRepository` | Prisma + PostgreSQL | `src/infrastructure/persistence/` |
| `IZoneRepository` | `PostgresZoneRepository` | Prisma + PostgreSQL | `src/infrastructure/persistence/` |
| `IInvitationRepository` | `PostgresInvitationRepository` | Prisma + PostgreSQL | `src/infrastructure/persistence/` |
| `INotificationService` | `FCMNotificationAdapter` | Firebase Admin SDK | `src/infrastructure/notifications/` |
| `ILocationCache` | `UpstashLocationCache` | Upstash Redis SDK | `src/infrastructure/cache/` |
| `IEventPublisher` | `SocketIOEventPublisher` | Socket.IO | `src/infrastructure/realtime/` |

---

### 3.4 Inyección de Dependencias

Los adaptadores se inyectan en los use cases mediante el constructor, nunca mediante imports directos. Esto permite sustituir cualquier adaptador por un mock en tests sin modificar el código de producción.

```typescript
// src/application/use-cases/ShareLocationUseCase.ts
export class ShareLocationUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly locationRepo: ILocationRepository,
    private readonly locationCache: ILocationCache,
    private readonly eventPublisher: IEventPublisher,
    private readonly notificationService: INotificationService,
  ) {}

  async execute(dto: ShareLocationDTO): Promise<void> {
    // lógica de orquestación...
  }
}
```

El ensamblado de dependencias ocurre en `src/infrastructure/container.ts`, que actúa como composition root de la aplicación.

---

## 4. Folder Structure

### 4.1 Backend (Node.js + Express + DDD Hexagonal)

```
backend/
├── src/
│   ├── domain/                          # Núcleo puro — sin dependencias externas
│   │   ├── aggregates/
│   │   │   ├── circle/
│   │   │   │   ├── Circle.ts            # Aggregate Root
│   │   │   │   ├── Circle.test.ts
│   │   │   │   └── CircleId.ts          # Value Object
│   │   │   └── user/
│   │   │       ├── User.ts              # Aggregate Root
│   │   │       ├── User.test.ts
│   │   │       └── UserId.ts
│   │   ├── entities/
│   │   │   ├── Zone.ts
│   │   │   ├── Zone.test.ts
│   │   │   ├── Invitation.ts
│   │   │   └── LocationUpdate.ts
│   │   ├── value-objects/
│   │   │   ├── Coordinates.ts           # lat/lng con validación [-90,90] / [-180,180]
│   │   │   ├── Coordinates.test.ts
│   │   │   ├── Email.ts
│   │   │   ├── Email.test.ts
│   │   │   ├── ColorHex.ts              # #RRGGBB
│   │   │   ├── ZonePolygon.ts           # polígono con validación de vértices y área
│   │   │   ├── ZonePolygon.test.ts
│   │   │   └── DailyLimit.ts
│   │   ├── events/
│   │   │   ├── DomainEvent.ts           # clase base abstracta
│   │   │   ├── LocationShared.ts
│   │   │   ├── ZoneEntered.ts
│   │   │   ├── ZoneExited.ts
│   │   │   ├── PrivacyModeActivated.ts
│   │   │   └── CircleCreated.ts
│   │   ├── services/
│   │   │   ├── ZoneEvaluationService.ts # lógica punto-en-polígono
│   │   │   ├── ZoneEvaluationService.test.ts
│   │   │   └── DailyLimitService.ts
│   │   └── ports/
│   │       ├── IUserRepository.ts
│   │       ├── ICircleRepository.ts
│   │       ├── ILocationRepository.ts
│   │       ├── IZoneRepository.ts
│   │       ├── IInvitationRepository.ts
│   │       ├── INotificationService.ts
│   │       ├── ILocationCache.ts
│   │       └── IEventPublisher.ts
│   │
│   ├── application/                     # Orquestación — depende solo del dominio
│   │   ├── use-cases/
│   │   │   ├── auth/
│   │   │   │   ├── RegisterUserUseCase.ts
│   │   │   │   ├── LoginUserUseCase.ts
│   │   │   │   └── RefreshTokenUseCase.ts
│   │   │   ├── circle/
│   │   │   │   ├── CreateCircleUseCase.ts
│   │   │   │   ├── InviteMemberUseCase.ts
│   │   │   │   ├── AcceptInvitationUseCase.ts
│   │   │   │   └── DissolveCircleUseCase.ts
│   │   │   ├── location/
│   │   │   │   ├── ShareLocationUseCase.ts
│   │   │   │   └── GetCircleLocationsUseCase.ts
│   │   │   ├── zone/
│   │   │   │   ├── CreateZoneUseCase.ts
│   │   │   │   ├── UpdateZoneUseCase.ts
│   │   │   │   └── DeleteZoneUseCase.ts
│   │   │   └── privacy/
│   │   │       ├── ActivatePrivacyModeUseCase.ts
│   │   │       └── DeactivatePrivacyModeUseCase.ts
│   │   └── dtos/
│   │       ├── auth/
│   │       │   ├── RegisterDTO.ts
│   │       │   └── LoginDTO.ts
│   │       ├── circle/
│   │       │   ├── CreateCircleDTO.ts
│   │       │   └── InviteMemberDTO.ts
│   │       ├── location/
│   │       │   └── ShareLocationDTO.ts
│   │       └── zone/
│   │           ├── CreateZoneDTO.ts
│   │           └── UpdateZoneDTO.ts
│   │
│   ├── infrastructure/                  # Adaptadores — depende de librerías externas
│   │   ├── persistence/
│   │   │   ├── prisma/
│   │   │   │   ├── schema.prisma        # Esquema de base de datos
│   │   │   │   └── migrations/
│   │   │   ├── PostgresUserRepository.ts
│   │   │   ├── PostgresCircleRepository.ts
│   │   │   ├── PostgresLocationRepository.ts
│   │   │   ├── PostgresZoneRepository.ts
│   │   │   └── PostgresInvitationRepository.ts
│   │   ├── cache/
│   │   │   └── UpstashLocationCache.ts
│   │   ├── notifications/
│   │   │   └── FCMNotificationAdapter.ts
│   │   ├── realtime/
│   │   │   └── SocketIOEventPublisher.ts
│   │   ├── http/
│   │   │   ├── server.ts                # Express app setup
│   │   │   ├── middleware/
│   │   │   │   ├── authMiddleware.ts    # Verificación JWT
│   │   │   │   ├── rateLimitMiddleware.ts
│   │   │   │   └── errorHandler.ts
│   │   │   └── routes/
│   │   │       ├── authRoutes.ts
│   │   │       ├── circleRoutes.ts
│   │   │       ├── locationRoutes.ts
│   │   │       └── zoneRoutes.ts
│   │   └── container.ts                # Composition root (DI manual)
│   │
│   └── shared/                         # Utilidades transversales
│       ├── errors/
│       │   ├── AppError.ts             # Clase base de errores
│       │   ├── NotFoundError.ts
│       │   ├── UnauthorizedError.ts
│       │   └── ValidationError.ts
│       ├── types/
│       │   └── Result.ts               # Result<T, E> para manejo funcional de errores
│       ├── utils/
│       │   ├── logger.ts               # Logger estructurado JSON
│       │   └── dateUtils.ts
│       └── config/
│           └── env.ts                  # Variables de entorno validadas con Zod
│
├── tests/
│   ├── unit/                           # Tests de dominio (sin DB, sin HTTP)
│   │   ├── aggregates/
│   │   ├── value-objects/
│   │   └── services/
│   ├── integration/                    # Tests de use cases con DB real (test container)
│   │   ├── auth/
│   │   ├── circle/
│   │   ├── location/
│   │   └── zone/
│   └── e2e/                            # Tests end-to-end con Playwright
│       └── critical-flow.spec.ts       # registro → círculo → invitación → ubicación → notificación
│
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── .env.example
```

---

### 4.2 Frontend (React + TypeScript + Vite)

```
frontend/
├── src/
│   ├── components/                     # Componentes reutilizables
│   │   ├── ui/                         # Primitivos (Button, Input, Modal, Badge...)
│   │   ├── map/
│   │   │   ├── FamilyMap.tsx           # Componente principal Leaflet
│   │   │   ├── MemberMarker.tsx
│   │   │   └── ZoneLayer.tsx           # Renderizado de zonas con colores
│   │   ├── circle/
│   │   │   ├── CircleCard.tsx
│   │   │   ├── MemberList.tsx
│   │   │   └── InviteForm.tsx
│   │   ├── location/
│   │   │   └── ShareLocationButton.tsx
│   │   ├── zone/
│   │   │   ├── ZoneDrawer.tsx          # Herramienta de dibujo de polígonos
│   │   │   └── ZoneColorPicker.tsx
│   │   └── privacy/
│   │       └── PrivacyModeToggle.tsx
│   │
│   ├── pages/                          # Rutas principales (code splitting por página)
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── MapPage.tsx
│   │   ├── CircleSettingsPage.tsx
│   │   └── ProfilePage.tsx
│   │
│   ├── hooks/                          # Custom hooks
│   │   ├── useAuth.ts
│   │   ├── useCircle.ts
│   │   ├── useLocation.ts
│   │   ├── useZones.ts
│   │   └── useSocket.ts               # Conexión Socket.IO
│   │
│   ├── store/                          # Estado global (Zustand)
│   │   ├── authStore.ts
│   │   ├── circleStore.ts
│   │   └── mapStore.ts
│   │
│   ├── api/                            # Capa de acceso a la API REST (React Query)
│   │   ├── client.ts                   # Axios instance con interceptores JWT
│   │   ├── auth.api.ts
│   │   ├── circles.api.ts
│   │   ├── locations.api.ts
│   │   └── zones.api.ts
│   │
│   ├── i18n/                           # Internacionalización (i18next)
│   │   ├── index.ts
│   │   ├── locales/
│   │   │   ├── es.json
│   │   │   └── en.json
│   │
│   ├── router/
│   │   └── AppRouter.tsx               # React Router con lazy loading por ruta
│   │
│   ├── types/                          # Tipos TypeScript compartidos
│   │   ├── api.types.ts
│   │   ├── map.types.ts
│   │   └── domain.types.ts
│   │
│   ├── App.tsx
│   └── main.tsx
│
├── public/
│   ├── icons/
│   └── manifest.json
│
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

### 4.3 Raíz del Monorepo

```
FamilyLink/
├── backend/                            # Ver 4.1
├── frontend/                           # Ver 4.2
├── .github/
│   └── workflows/
│       ├── ci-backend.yml              # GitHub Actions: lint + test + build
│       └── ci-frontend.yml
├── docker-compose.yml                  # PostgreSQL + Redis local para desarrollo
├── .env.example
└── README.md
```

*Las secciones 5–10 se desarrollarán en las siguientes iteraciones del documento.*

---

## 5. Data Models

### 5.1 Diagrama Entidad-Relación

```mermaid
erDiagram
  users {
    uuid id PK
    varchar email UK
    varchar username
    varchar password_hash
    varchar language
    boolean privacy_mode_active
    timestamp privacy_mode_expires_at
    int privacy_mode_count_today
    timestamp created_at
    timestamp updated_at
  }

  circles {
    uuid id PK
    varchar name
    uuid created_by FK
    timestamp created_at
    timestamp updated_at
  }

  circle_members {
    uuid id PK
    uuid circle_id FK
    uuid user_id FK
    varchar role
    timestamp joined_at
  }

  zones {
    uuid id PK
    uuid circle_id FK
    uuid created_by FK
    varchar name
    varchar name_en
    varchar color_hex
    jsonb polygon_vertices
    float area_sqm
    boolean active
    timestamp created_at
    timestamp updated_at
  }

  location_updates {
    uuid id PK
    uuid user_id FK
    uuid circle_id FK
    float latitude
    float longitude
    timestamp captured_at
    timestamp created_at
  }

  invitations {
    uuid id PK
    uuid circle_id FK
    uuid invited_by FK
    varchar email
    varchar status
    timestamp expires_at
    timestamp created_at
  }

  daily_limits {
    uuid id PK
    uuid circle_id FK
    varchar role
    int max_updates
    timestamp updated_at
  }

  users ||--o{ circle_members : "pertenece a"
  circles ||--o{ circle_members : "tiene"
  circles ||--o{ zones : "define"
  circles ||--o{ location_updates : "recibe"
  circles ||--o{ invitations : "emite"
  circles ||--o{ daily_limits : "configura"
  users ||--o{ location_updates : "genera"
  users ||--o{ invitations : "invita"
  users ||--|| circles : "crea"
```

---

### 5.2 Tabla: `users`

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Identificador único |
| `email` | `VARCHAR(255)` | NOT NULL, UNIQUE | Correo electrónico |
| `username` | `VARCHAR(100)` | NOT NULL | Nombre de usuario |
| `password_hash` | `VARCHAR(255)` | NOT NULL | Hash bcrypt (coste ≥ 10) |
| `language` | `VARCHAR(5)` | NOT NULL, DEFAULT 'es' | Idioma preferido (es/en) |
| `privacy_mode_active` | `BOOLEAN` | NOT NULL, DEFAULT false | Estado del Modo Privacidad |
| `privacy_mode_expires_at` | `TIMESTAMP` | NULL | Expiración automática del modo privacidad |
| `privacy_mode_count_today` | `INTEGER` | NOT NULL, DEFAULT 0 | Activaciones hoy (máx. 5) |
| `privacy_mode_reset_date` | `DATE` | NULL | Fecha del último reset del contador |
| `created_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | Fecha de registro |
| `updated_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | Última modificación |

---

### 5.3 Tabla: `circles`

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `id` | `UUID` | PK | Identificador único |
| `name` | `VARCHAR(50)` | NOT NULL | Nombre del círculo (3–50 chars) |
| `created_by` | `UUID` | NOT NULL, FK → users.id | Usuario que creó el círculo |
| `created_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | Fecha de creación |
| `updated_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | Última modificación |

---

### 5.4 Tabla: `circle_members`

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `id` | `UUID` | PK | Identificador único |
| `circle_id` | `UUID` | NOT NULL, FK → circles.id ON DELETE CASCADE | Círculo al que pertenece |
| `user_id` | `UUID` | NOT NULL, FK → users.id ON DELETE CASCADE | Usuario miembro |
| `role` | `VARCHAR(20)` | NOT NULL, CHECK IN ('circle_admin','circle_member') | Rol dentro del círculo |
| `joined_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | Fecha de incorporación |

**Índices:** `UNIQUE(circle_id, user_id)` — un usuario no puede estar dos veces en el mismo círculo.

---

### 5.5 Tabla: `zones`

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `id` | `UUID` | PK | Identificador único |
| `circle_id` | `UUID` | NOT NULL, FK → circles.id ON DELETE CASCADE | Círculo propietario |
| `created_by` | `UUID` | NOT NULL, FK → users.id | Admin que creó la zona |
| `name` | `VARCHAR(100)` | NOT NULL | Nombre en idioma principal |
| `name_en` | `VARCHAR(100)` | NULL | Nombre en inglés (i18n fallback) |
| `color_hex` | `VARCHAR(7)` | NOT NULL, CHECK ~ '^#[0-9A-Fa-f]{6}$' | Color en formato #RRGGBB |
| `polygon_vertices` | `JSONB` | NOT NULL | Array de {lat, lng} (3–50 vértices) |
| `area_sqm` | `FLOAT` | NOT NULL, CHECK > 100 | Área calculada en m² |
| `active` | `BOOLEAN` | NOT NULL, DEFAULT true | Si la zona está activa |
| `created_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | Fecha de creación |
| `updated_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | Última modificación |

**Índices:** `INDEX(circle_id)` — búsquedas de zonas por círculo.

---

### 5.6 Tabla: `location_updates`

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `id` | `UUID` | PK | Identificador único |
| `user_id` | `UUID` | NOT NULL, FK → users.id ON DELETE CASCADE | Usuario que compartió |
| `circle_id` | `UUID` | NOT NULL, FK → circles.id ON DELETE CASCADE | Círculo destinatario |
| `latitude` | `FLOAT` | NOT NULL, CHECK BETWEEN -90 AND 90 | Latitud GPS |
| `longitude` | `FLOAT` | NOT NULL, CHECK BETWEEN -180 AND 180 | Longitud GPS |
| `captured_at` | `TIMESTAMP` | NOT NULL | Momento de captura en el dispositivo |
| `created_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | Momento de inserción en BD |

**Índices:** `INDEX(circle_id, captured_at DESC)` — consultas de ubicaciones recientes por círculo. `INDEX(user_id, captured_at DESC)` — historial por usuario y conteo diario.

---

### 5.7 Tabla: `invitations`

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `id` | `UUID` | PK | Identificador único |
| `circle_id` | `UUID` | NOT NULL, FK → circles.id ON DELETE CASCADE | Círculo al que se invita |
| `invited_by` | `UUID` | NOT NULL, FK → users.id | Admin que emitió la invitación |
| `email` | `VARCHAR(255)` | NOT NULL | Email del invitado |
| `status` | `VARCHAR(20)` | NOT NULL, DEFAULT 'pending', CHECK IN ('pending','accepted','expired','revoked') | Estado de la invitación |
| `expires_at` | `TIMESTAMP` | NOT NULL | Expiración (created_at + 7 días) |
| `created_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | Fecha de emisión |

**Índices:** `INDEX(email, status)` — búsqueda de invitaciones pendientes por email.

---

### 5.8 Tabla: `daily_limits`

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `id` | `UUID` | PK | Identificador único |
| `circle_id` | `UUID` | NOT NULL, FK → circles.id ON DELETE CASCADE | Círculo al que aplica |
| `role` | `VARCHAR(20)` | NOT NULL, CHECK IN ('circle_admin','circle_member') | Rol al que aplica el límite |
| `max_updates` | `INTEGER` | NOT NULL, CHECK BETWEEN 1 AND 500 | Máximo de actualizaciones/día |
| `updated_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | Última modificación |

**Índices:** `UNIQUE(circle_id, role)` — un límite por rol por círculo.

**Valores por defecto:** `circle_member` → 50, `circle_admin` → 200 (insertados al crear el círculo).

---

### 5.9 Estrategia de limpieza automática

- `location_updates` con `captured_at < NOW() - INTERVAL '30 days'` se eliminan mediante un job programado (cron diario a las 02:00 UTC).
- `invitations` con `status = 'pending'` y `expires_at < NOW()` se marcan como `'expired'` en el mismo job.
- El contador `privacy_mode_count_today` se resetea a 0 cuando `privacy_mode_reset_date < CURRENT_DATE`.

---

## 6. API Endpoints

Todos los endpoints están bajo el prefijo `/api/v1`. Los endpoints protegidos requieren el header `Authorization: Bearer <JWT>`. Los errores siguen siempre el formato:

```typescript
type ErrorResponse = {
  error: string;   // código de error legible por máquina
  message: string; // descripción legible por humano
  statusCode: number;
};
```

---

### 6.1 Auth (`/api/v1/auth`)

#### `POST /auth/register`

| Campo | Valor |
|-------|-------|
| **Auth** | No requerida |
| **Códigos** | 201, 400, 409, 429, 500 |

```typescript
// Request body
type RegisterDTO = {
  email: string;       // formato válido de email
  username: string;    // 3–100 caracteres
  password: string;    // mínimo 8 caracteres
};

// Response 201
type RegisterResponse = {
  user: { id: string; email: string; username: string };
  accessToken: string;   // JWT, expira en 24h
  refreshToken: string;  // expira en 30 días
};
```

---

#### `POST /auth/login`

| Campo | Valor |
|-------|-------|
| **Auth** | No requerida |
| **Códigos** | 200, 400, 401, 423 (cuenta bloqueada), 429, 500 |

```typescript
// Request body
type LoginDTO = {
  email: string;
  password: string;
};

// Response 200
type LoginResponse = {
  user: { id: string; email: string; username: string };
  accessToken: string;
  refreshToken: string;
};
```

---

#### `POST /auth/refresh`

| Campo | Valor |
|-------|-------|
| **Auth** | No requerida |
| **Códigos** | 200, 401, 500 |

```typescript
// Request body
type RefreshDTO = { refreshToken: string };

// Response 200
type RefreshResponse = { accessToken: string };
```

---

#### `POST /auth/logout`

| Campo | Valor |
|-------|-------|
| **Auth** | `Authorization: Bearer <JWT>` |
| **Códigos** | 204, 401, 500 |

```typescript
// Request body
type LogoutDTO = { refreshToken: string };

// Response 204 — sin body
```

---

### 6.2 Circles (`/api/v1/circles`)

#### `POST /circles`

| Campo | Valor |
|-------|-------|
| **Auth** | Requerida |
| **Códigos** | 201, 400, 401, 429, 500 |

```typescript
// Request body
type CreateCircleDTO = {
  name: string; // 3–50 caracteres
};

// Response 201
type CircleResponse = {
  id: string;
  name: string;
  createdBy: string;
  role: 'circle_admin';
  createdAt: string; // ISO 8601
};
```

---

#### `GET /circles`

| Campo | Valor |
|-------|-------|
| **Auth** | Requerida |
| **Códigos** | 200, 401, 500 |

```typescript
// Response 200
type GetCirclesResponse = {
  circles: Array<{
    id: string;
    name: string;
    role: 'circle_admin' | 'circle_member';
    memberCount: number;
  }>;
};
```

---

#### `GET /circles/:circleId`

| Campo | Valor |
|-------|-------|
| **Auth** | Requerida |
| **Códigos** | 200, 401, 403, 404, 500 |

```typescript
// Response 200
type CircleDetailResponse = {
  id: string;
  name: string;
  members: Array<{
    userId: string;
    username: string;
    role: 'circle_admin' | 'circle_member';
    privacyModeActive: boolean;
  }>;
  dailyLimits: {
    circle_admin: number;
    circle_member: number;
  };
};
```

---

#### `DELETE /circles/:circleId`

| Campo | Valor |
|-------|-------|
| **Auth** | Requerida (Circle_Admin) |
| **Códigos** | 204, 401, 403, 404, 500 |

```typescript
// Response 204 — sin body
```

---

#### `POST /circles/:circleId/invitations`

| Campo | Valor |
|-------|-------|
| **Auth** | Requerida (Circle_Admin) |
| **Códigos** | 201, 400, 401, 403, 404, 409, 500 |

```typescript
// Request body
type InviteMemberDTO = { email: string };

// Response 201
type InvitationResponse = {
  id: string;
  email: string;
  status: 'pending';
  expiresAt: string; // ISO 8601
};
```

---

#### `POST /circles/:circleId/invitations/:invitationId/accept`

| Campo | Valor |
|-------|-------|
| **Auth** | Requerida |
| **Códigos** | 200, 401, 403, 404, 410 (expirada), 500 |

```typescript
// Response 200
type AcceptInvitationResponse = {
  circleId: string;
  role: 'circle_member';
  joinedAt: string;
};
```

---

#### `PATCH /circles/:circleId/members/:userId/role`

| Campo | Valor |
|-------|-------|
| **Auth** | Requerida (Circle_Admin) |
| **Códigos** | 200, 400, 401, 403, 404, 500 |

```typescript
// Request body
type UpdateRoleDTO = { role: 'circle_admin' | 'circle_member' };

// Response 200
type UpdateRoleResponse = {
  userId: string;
  role: 'circle_admin' | 'circle_member';
  updatedAt: string;
};
```

---

#### `DELETE /circles/:circleId/members/:userId`

| Campo | Valor |
|-------|-------|
| **Auth** | Requerida (Circle_Admin) |
| **Códigos** | 204, 401, 403, 404, 500 |

```typescript
// Response 204 — sin body
```

---

#### `PATCH /circles/:circleId/daily-limits`

| Campo | Valor |
|-------|-------|
| **Auth** | Requerida (Circle_Admin) |
| **Códigos** | 200, 400, 401, 403, 404, 500 |

```typescript
// Request body
type UpdateDailyLimitsDTO = {
  circle_admin?: number;   // 1–500
  circle_member?: number;  // 1–500
};

// Response 200
type DailyLimitsResponse = {
  circle_admin: number;
  circle_member: number;
  updatedAt: string;
};
```

---

### 6.3 Locations (`/api/v1/locations`)

#### `POST /locations`

| Campo | Valor |
|-------|-------|
| **Auth** | Requerida |
| **Códigos** | 201, 400, 401, 403 (Privacy_Mode activo), 429 (Daily_Limit), 500 |

```typescript
// Request body
type ShareLocationDTO = {
  circleId: string;
  latitude: number;   // [-90, 90]
  longitude: number;  // [-180, 180]
  capturedAt: string; // ISO 8601 — timestamp del dispositivo
};

// Response 201
type LocationUpdateResponse = {
  id: string;
  userId: string;
  circleId: string;
  latitude: number;
  longitude: number;
  capturedAt: string;
};
```

---

#### `GET /locations/circles/:circleId`

| Campo | Valor |
|-------|-------|
| **Auth** | Requerida (miembro del círculo) |
| **Códigos** | 200, 401, 403, 404, 500 |

```typescript
// Query params: ?since=ISO8601 (opcional)

// Response 200
type CircleLocationsResponse = {
  locations: Array<{
    userId: string;
    username: string;
    latitude: number;
    longitude: number;
    capturedAt: string;
    privacyModeActive: boolean;
  }>;
};
```

---

### 6.4 Zones (`/api/v1/zones`)

#### `POST /zones`

| Campo | Valor |
|-------|-------|
| **Auth** | Requerida (Circle_Admin) |
| **Códigos** | 201, 400, 401, 403, 404, 422 (polígono inválido), 500 |

```typescript
// Request body
type CreateZoneDTO = {
  circleId: string;
  name: string;       // 1–100 caracteres
  nameEn?: string;    // opcional, para i18n
  colorHex: string;   // #RRGGBB
  vertices: Array<{ lat: number; lng: number }>; // 3–50 vértices
};

// Response 201
type ZoneResponse = {
  id: string;
  circleId: string;
  name: string;
  nameEn: string | null;
  colorHex: string;
  vertices: Array<{ lat: number; lng: number }>;
  areaSqm: number;
  active: boolean;
  createdAt: string;
};
```

---

#### `GET /zones/circles/:circleId`

| Campo | Valor |
|-------|-------|
| **Auth** | Requerida (miembro del círculo) |
| **Códigos** | 200, 401, 403, 404, 500 |

```typescript
// Response 200
type GetZonesResponse = {
  zones: ZoneResponse[];
};
```

---

#### `PATCH /zones/:zoneId`

| Campo | Valor |
|-------|-------|
| **Auth** | Requerida (Circle_Admin) |
| **Códigos** | 200, 400, 401, 403, 404, 500 |

```typescript
// Request body (todos los campos opcionales)
type UpdateZoneDTO = {
  name?: string;
  nameEn?: string;
  colorHex?: string;
  vertices?: Array<{ lat: number; lng: number }>;
};

// Response 200 — ZoneResponse completo
```

---

#### `DELETE /zones/:zoneId`

| Campo | Valor |
|-------|-------|
| **Auth** | Requerida (Circle_Admin) |
| **Códigos** | 204, 401, 403, 404, 500 |

```typescript
// Response 204 — sin body
```

---

### 6.5 Privacy Mode (`/api/v1/privacy`)

#### `POST /privacy/activate`

| Campo | Valor |
|-------|-------|
| **Auth** | Requerida |
| **Códigos** | 200, 400, 401, 429 (límite 5/día), 500 |

```typescript
// Request body
type ActivatePrivacyDTO = {
  circleId: string;
  durationMinutes: number; // 15–480 (8 horas)
};

// Response 200
type PrivacyModeResponse = {
  active: boolean;
  activatedAt: string;
  expiresAt: string;
  countToday: number; // cuántas veces se ha activado hoy
};
```

---

#### `POST /privacy/deactivate`

| Campo | Valor |
|-------|-------|
| **Auth** | Requerida |
| **Códigos** | 200, 401, 500 |

```typescript
// Request body
type DeactivatePrivacyDTO = { circleId: string };

// Response 200
type PrivacyModeResponse = {
  active: false;
  deactivatedAt: string;
};
```

---

### 6.6 WebSocket Events (`/ws`)

La conexión WebSocket se establece con Socket.IO. El cliente debe enviar el JWT en el handshake:

```typescript
const socket = io(WS_URL, {
  auth: { token: accessToken }
});
```

#### Eventos emitidos por el servidor → cliente

| Evento | Payload | Descripción |
|--------|---------|-------------|
| `location:updated` | `{ userId, circleId, latitude, longitude, capturedAt }` | Nueva ubicación compartida |
| `zone:entered` | `{ userId, circleId, zoneId, zoneName, timestamp }` | Usuario entró en una zona |
| `zone:exited` | `{ userId, circleId, zoneId, zoneName, timestamp }` | Usuario salió de una zona |
| `privacy:activated` | `{ userId, circleId, expiresAt }` | Miembro activó Modo Privacidad |
| `privacy:deactivated` | `{ userId, circleId, timestamp }` | Miembro desactivó Modo Privacidad |
| `member:joined` | `{ userId, username, circleId }` | Nuevo miembro aceptó invitación |
| `member:removed` | `{ userId, circleId }` | Miembro eliminado del círculo |

#### Eventos emitidos por el cliente → servidor

| Evento | Payload | Descripción |
|--------|---------|-------------|
| `circle:join` | `{ circleId }` | Suscribirse a eventos de un círculo |
| `circle:leave` | `{ circleId }` | Desuscribirse de eventos de un círculo |

---

## 7. Security Design

### 7.1 Autenticación JWT

FamilyLink usa un esquema de doble token: **access token** de vida corta para autenticar peticiones y **refresh token** de vida larga para renovarlo sin requerir credenciales.

#### Estructura del JWT

```typescript
// Payload del accessToken
{
  "sub": "user-id",            // subject (id del usuario)
  "email": "user@mail.com",
  "roles": ["circle_admin", "circle_member"],
  "iat": 1647123456,           // issued at
  "exp": 1647209856            // expires (24 horas)
}
```

#### Flujo de autenticación

1. Usuario envía email/contraseña → servidor valida con bcrypt
2. Servidor emite `accessToken` (expira en 24h) y `refreshToken` (expira en 30 días)
3. Cliente envía `accessToken` en header `Authorization: Bearer <token>`
4. Al expirar `accessToken`, cliente envía `refreshToken` a `POST /auth/refresh`
5. Servidor invalida `refreshToken` en logout

#### Generación

```typescript
// src/infrastructure/http/middleware/authMiddleware.ts
import jwt from 'jsonwebtoken';

const ACCESS_TOKEN_SECRET  = env.JWT_ACCESS_SECRET;   // mínimo 256 bits
const REFRESH_TOKEN_SECRET = env.JWT_REFRESH_SECRET;  // diferente del access

function generateAccessToken(userId: string): string {
  return jwt.sign({ sub: userId, type: 'access' }, ACCESS_TOKEN_SECRET, {
    expiresIn: '24h',
    algorithm: 'HS256',
  });
}

function generateRefreshToken(userId: string): string {
  return jwt.sign({ sub: userId, type: 'refresh' }, REFRESH_TOKEN_SECRET, {
    expiresIn: '30d',
    algorithm: 'HS256',
  });
}
```

#### Validación (middleware)

```typescript
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'MISSING_TOKEN' });

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, ACCESS_TOKEN_SECRET) as JwtPayload;
    if (payload.type !== 'access') throw new Error('wrong token type');
    req.userId = payload.sub as string;
    next();
  } catch {
    return res.status(401).json({ error: 'INVALID_TOKEN' });
  }
}
```

#### Flujo de refresco

```mermaid
sequenceDiagram
  participant C as Cliente
  participant API as API Gateway
  participant DB as PostgreSQL

  C->>API: POST /auth/refresh { refreshToken }
  API->>API: Verifica firma con REFRESH_TOKEN_SECRET
  API->>DB: SELECT refresh_tokens WHERE token = hash(refreshToken) AND revoked = false
  DB-->>API: token válido
  API->>API: Genera nuevo accessToken
  API-->>C: 200 { accessToken }

  note over API,DB: Al hacer logout, se marca revoked = true
```

Los refresh tokens se almacenan en la tabla `refresh_tokens` como hash SHA-256 (nunca en texto plano). Al revocar sesión o detectar uso de un token ya revocado (reuse detection), se invalidan **todos** los refresh tokens del usuario.

---

### 7.2 Autorización por Roles

El middleware de roles se aplica después del `authMiddleware` y verifica el rol del usuario dentro del círculo específico de la petición.

#### Middleware de autorización

```typescript
// src/infrastructure/http/middleware/authorize.ts
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user.role;
    if (!roles.includes(userRole)) {
      throw new UnauthorizedError('Insufficient permissions');
    }
    next();
  };
};

// Uso en rutas
router.post('/circles/:circleId/invitations',
  authenticate,           // 1. Verifica JWT
  requireCircleAdmin,     // 2. Verifica que es admin del círculo
  validate(InviteSchema), // 3. Valida body
  inviteMemberController  // 4. Ejecuta use case
);
```

```typescript
// src/infrastructure/http/middleware/requireRole.ts
export function requireCircleRole(...roles: CircleRole[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { circleId } = req.params;
    const userId = req.userId;

    const member = await circleRepo.findMembership(circleId, userId);

    if (!member) {
      return res.status(403).json({ error: 'NOT_A_MEMBER' });
    }
    if (!roles.includes(member.role)) {
      return res.status(403).json({ error: 'INSUFFICIENT_ROLE' });
    }

    req.circleRole = member.role;
    next();
  };
}

// Uso en rutas:
router.delete('/:circleId',
  authMiddleware,
  requireCircleRole('circle_admin'),
  dissolveCircleController
);
```

**Matriz de permisos:**

| Operación | circle_admin | circle_member |
|-----------|:---:|:---:|
| Crear círculo | ✅ | ✅ |
| Invitar miembros | ✅ | ❌ |
| Eliminar miembros | ✅ | ❌ |
| Cambiar roles | ✅ | ❌ |
| Disolver círculo | ✅ | ❌ |
| Crear/editar zonas | ✅ | ❌ |
| Eliminar zonas | ✅ | ❌ |
| Configurar daily limits | ✅ | ❌ |
| Compartir ubicación | ✅ | ✅ |
| Activar Privacy Mode | ✅ | ✅ |
| Ver mapa del círculo | ✅ | ✅ |

---

### 7.3 Rate Limiting

Se aplican dos niveles de rate limiting usando `express-rate-limit` (gratuito, sin dependencias externas):

```typescript
import rateLimit from 'express-rate-limit';

// Nivel 1: por IP — endpoints no autenticados (NFR-7)
export const publicRateLimit = rateLimit({
  windowMs: 60 * 1000,   // 1 minuto
  max: 100,
  message: { error: 'RATE_LIMIT_EXCEEDED', message: 'Demasiadas peticiones' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Nivel 2: anti-brute-force en login (Req 2.3)
export const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutos
  max: 5,
  skipSuccessfulRequests: true,
  keyGenerator: (req) => req.body.email ?? req.ip,
  handler: async (req, res) => {
    await notifyAccountLockout(req.body.email); // email de aviso
    res.status(429).json({ error: 'ACCOUNT_TEMPORARILY_LOCKED' });
  },
});

// Nivel 3: por usuario autenticado — endpoints de ubicación
export const locationRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  keyGenerator: (req) => req.userId,
  message: { error: 'LOCATION_RATE_LIMIT' },
});
```

---

### 7.4 Cifrado de Datos Sensibles

#### Contraseñas (bcrypt)

```typescript
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12; // factor de coste ≥ 10 (Req 1.5)

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
```

#### Coordenadas en reposo (Req 11.4)

Las coordenadas se cifran con AES-256-GCM antes de persistirlas en PostgreSQL:

```typescript
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ENCRYPTION_KEY = Buffer.from(env.COORDINATES_ENCRYPTION_KEY, 'hex'); // 32 bytes

export function encryptCoordinates(lat: number, lng: number): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
  const plain = JSON.stringify({ lat, lng });
  const encrypted = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString('base64');
}

export function decryptCoordinates(data: string): { lat: number; lng: number } {
  const buf = Buffer.from(data, 'base64');
  const iv  = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const enc = buf.subarray(28);
  const decipher = createDecipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
  decipher.setAuthTag(tag);
  const plain = decipher.update(enc) + decipher.final('utf8');
  return JSON.parse(plain);
}
```

---

### 7.5 Política de Retención de Datos

Alineada con principios GDPR (Req 11.5, Location_Service):

| Dato | Retención | Mecanismo de eliminación |
|------|-----------|--------------------------|
| `location_updates` | 30 días | Cron job diario 02:00 UTC — DELETE WHERE captured_at < NOW() - 30d |
| `invitations` expiradas | 90 días | Cron job diario — DELETE WHERE status IN ('expired','revoked') AND created_at < NOW() - 90d |
| `refresh_tokens` revocados | 7 días | Cron job diario — DELETE WHERE revoked = true AND revoked_at < NOW() - 7d |
| Cuenta de usuario | Inmediato + 30d para ubicaciones | DELETE en cascada al solicitar baja; ubicaciones en job asíncrono |
| Logs de aplicación | 30 días | Rotación automática configurada en el proveedor de logs |

Al solicitar eliminación de cuenta, el sistema:
1. Marca la cuenta como `pending_deletion`
2. Revoca todos los tokens activos inmediatamente
3. Elimina datos personales identificables en el mismo request
4. Encola job asíncrono para eliminar `location_updates` (puede tardar hasta 30 días)
5. Envía email de confirmación cuando el job completa (Req 11.5)

---

### 7.6 Logs Seguros (NFR-8)

El logger usa `pino` (JSON estructurado, alto rendimiento) con un serializador que redacta campos sensibles:

```typescript
import pino from 'pino';

const REDACTED_FIELDS = [
  'password', 'passwordHash', 'password_hash',
  'token', 'accessToken', 'refreshToken', 'authorization',
  'latitude', 'longitude',   // coordenadas exactas no se loguean
  'email',                   // se loguea solo el hash en auditoría
];

export const logger = pino({
  level: env.LOG_LEVEL ?? 'info',
  redact: { paths: REDACTED_FIELDS, censor: '[REDACTED]' },
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      userId: req.userId ?? 'anonymous',
    }),
    err: pino.stdSerializers.err,
  },
});
```

Los logs de auditoría de geocercas (OBS-2) usan un logger separado que sí registra `zone_id` y tipo de operación, pero nunca coordenadas exactas ni tokens.

---

### 7.7 HTTPS y Headers de Seguridad

En producción, todo el tráfico va sobre HTTPS (TLS 1.2+, Req 11.3). En desarrollo local se usa HTTP; el proxy de Render/Railway gestiona la terminación TLS.

```typescript
import helmet from 'helmet';
import cors from 'cors';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"], // necesario para Leaflet
      imgSrc: ["'self'", 'data:', 'https://*.tile.openstreetmap.org'],
      connectSrc: ["'self'", env.WS_URL],
    },
  },
  hsts: { maxAge: 31536000, includeSubDomains: true },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));

app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
}));
```

**Headers resultantes en producción:**

| Header | Valor |
|--------|-------|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` |
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `Content-Security-Policy` | Ver configuración arriba |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `X-Powered-By` | *(eliminado por Helmet)* |

---

## 8. Testing Strategy

### 8.1 Estrategia por Capas

```mermaid
graph TB
  subgraph E2E["🎭 E2E (Playwright)"]
    E[Flujo crítico completo<br/>registro → círculo → invitación → ubicación → notificación]
  end
  subgraph INT["🔗 Integración (Supertest + Vitest)"]
    I1[Use Cases con DB real<br/>ShareLocationUseCase]
    I2[API endpoints HTTP<br/>POST /locations, POST /circles...]
  end
  subgraph UNIT["⚡ Unitarios (Vitest)"]
    U1[Value Objects<br/>Coordinates, Email, ColorHex, ZonePolygon]
    U2[Aggregates<br/>Circle, User]
    U3[Domain Services<br/>ZoneEvaluationService, DailyLimitService]
    U4[Frontend Components<br/>React Testing Library]
  end

  E --> INT --> UNIT
```

| Capa | Herramienta | Velocidad | Cobertura objetivo | Aislamiento |
|------|-------------|-----------|-------------------|-------------|
| Unitarios (dominio) | Vitest | ~50ms/test | **100%** en Value Objects y Aggregates | Sin DB, sin HTTP |
| Integración (use cases) | Vitest + Supertest | ~500ms/test | **90%** en use cases críticos | DB real en Docker |
| Frontend (componentes) | Vitest + RTL | ~100ms/test | **80%** en componentes | Sin servidor |
| E2E | Playwright | ~5s/test | Flujo crítico completo | Stack completo |

---

### 8.2 Librerías y Configuración

#### Backend — `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
      include: ['src/**/*.ts'],
      exclude: ['src/infrastructure/http/server.ts', 'src/**/*.d.ts'],
    },
    include: ['tests/unit/**/*.test.ts', 'tests/integration/**/*.test.ts'],
  },
});
```

#### Frontend — `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      thresholds: { lines: 80 },
      include: ['src/components/**', 'src/hooks/**'],
    },
  },
});
```

#### E2E — `playwright.config.ts`

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
  },
});
```

---

### 8.3 Ejemplo: Test Unitario — `Coordinates` Value Object

```typescript
// tests/unit/value-objects/Coordinates.test.ts
import { describe, it, expect } from 'vitest';
import { Coordinates } from '../../../src/domain/value-objects/Coordinates';

describe('Coordinates', () => {
  describe('construcción válida', () => {
    it('acepta coordenadas en los límites exactos', () => {
      expect(() => new Coordinates(90, 180)).not.toThrow();
      expect(() => new Coordinates(-90, -180)).not.toThrow();
      expect(() => new Coordinates(0, 0)).not.toThrow();
    });

    it('expone lat y lng como propiedades inmutables', () => {
      const coords = new Coordinates(40.4168, -3.7038);
      expect(coords.lat).toBe(40.4168);
      expect(coords.lng).toBe(-3.7038);
    });

    it('dos instancias con mismos valores son iguales (value equality)', () => {
      const a = new Coordinates(40.4168, -3.7038);
      const b = new Coordinates(40.4168, -3.7038);
      expect(a.equals(b)).toBe(true);
    });
  });

  describe('validación — latitud inválida (Req AC-5.7)', () => {
    it('rechaza latitud > 90', () => {
      expect(() => new Coordinates(90.0001, 0)).toThrow('Latitud fuera de rango');
    });

    it('rechaza latitud < -90', () => {
      expect(() => new Coordinates(-91, 0)).toThrow('Latitud fuera de rango');
    });

    it('rechaza NaN como latitud', () => {
      expect(() => new Coordinates(NaN, 0)).toThrow();
    });
  });

  describe('validación — longitud inválida (Req AC-5.7)', () => {
    it('rechaza longitud > 180', () => {
      expect(() => new Coordinates(0, 180.0001)).toThrow('Longitud fuera de rango');
    });

    it('rechaza longitud < -180', () => {
      expect(() => new Coordinates(0, -181)).toThrow('Longitud fuera de rango');
    });
  });

  describe('inmutabilidad', () => {
    it('no permite modificar lat después de la construcción', () => {
      const coords = new Coordinates(40.4168, -3.7038);
      expect(() => { (coords as any).lat = 0; }).toThrow();
    });
  });
});
```

---

### 8.4 Ejemplo: Test de Integración — `ShareLocationUseCase`

```typescript
// tests/integration/location/ShareLocationUseCase.test.ts
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { ShareLocationUseCase } from '../../../src/application/use-cases/location/ShareLocationUseCase';
import { PostgresLocationRepository } from '../../../src/infrastructure/persistence/PostgresLocationRepository';
import { PostgresUserRepository } from '../../../src/infrastructure/persistence/PostgresUserRepository';
import { PostgresCircleRepository } from '../../../src/infrastructure/persistence/PostgresCircleRepository';
import { InMemoryLocationCache } from '../../helpers/InMemoryLocationCache';
import { InMemoryEventPublisher } from '../../helpers/InMemoryEventPublisher';
import { InMemoryNotificationService } from '../../helpers/InMemoryNotificationService';
import { testDb, seedUser, seedCircle, seedMembership } from '../../helpers/testDb';

describe('ShareLocationUseCase (integración)', () => {
  let useCase: ShareLocationUseCase;
  let eventPublisher: InMemoryEventPublisher;
  let userId: string;
  let circleId: string;

  beforeAll(async () => {
    await testDb.migrate();
  });

  afterAll(async () => {
    await testDb.teardown();
  });

  beforeEach(async () => {
    await testDb.clean();
    userId   = await seedUser({ email: 'test@example.com' });
    circleId = await seedCircle({ name: 'Familia Test' });
    await seedMembership({ userId, circleId, role: 'circle_member' });

    eventPublisher = new InMemoryEventPublisher();

    useCase = new ShareLocationUseCase(
      new PostgresUserRepository(testDb.prisma),
      new PostgresLocationRepository(testDb.prisma),
      new InMemoryLocationCache(),
      eventPublisher,
      new InMemoryNotificationService(),
    );
  });

  it('persiste la ubicación y emite LocationShared event', async () => {
    await useCase.execute({
      userId,
      circleId,
      latitude: 40.4168,
      longitude: -3.7038,
      capturedAt: new Date(),
    });

    const saved = await testDb.prisma.locationUpdate.findFirst({
      where: { userId, circleId },
    });

    expect(saved).not.toBeNull();
    expect(saved!.latitude).toBeCloseTo(40.4168);
    expect(eventPublisher.events).toHaveLength(1);
    expect(eventPublisher.events[0].type).toBe('LocationShared');
  });

  it('rechaza si Privacy_Mode está activo (Req AC-5.4)', async () => {
    await testDb.prisma.user.update({
      where: { id: userId },
      data: { privacyModeActive: true },
    });

    await expect(useCase.execute({
      userId, circleId,
      latitude: 40.4168, longitude: -3.7038,
      capturedAt: new Date(),
    })).rejects.toThrow('PRIVACY_MODE_ACTIVE');
  });

  it('rechaza si se alcanza el Daily_Limit (Req AC-6.4)', async () => {
    // Simular que el usuario ya alcanzó el límite diario
    await testDb.prisma.user.update({
      where: { id: userId },
      data: { locationCountToday: 50 }, // límite por defecto de circle_member
    });

    await expect(useCase.execute({
      userId, circleId,
      latitude: 40.4168, longitude: -3.7038,
      capturedAt: new Date(),
    })).rejects.toThrow('DAILY_LIMIT_REACHED');
  });

  it('rechaza coordenadas inválidas (Req AC-5.7)', async () => {
    await expect(useCase.execute({
      userId, circleId,
      latitude: 999,   // inválido
      longitude: -3.7038,
      capturedAt: new Date(),
    })).rejects.toThrow('INVALID_COORDINATES');
  });
});
```

---

### 8.5 Test E2E — Flujo Crítico (TST-1)

```typescript
// tests/e2e/critical-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Flujo crítico: registro → círculo → invitación → ubicación → notificación', () => {
  test('usuario completo end-to-end', async ({ page, context }) => {
    // 1. Registro
    await page.goto('/register');
    await page.fill('[name=email]', 'admin@familylink.test');
    await page.fill('[name=username]', 'AdminTest');
    await page.fill('[name=password]', 'SecurePass123');
    await page.click('[type=submit]');
    await expect(page).toHaveURL('/dashboard');

    // 2. Crear círculo
    await page.click('[data-testid=create-circle-btn]');
    await page.fill('[name=circleName]', 'Familia Test');
    await page.click('[data-testid=confirm-create-circle]');
    await expect(page.locator('[data-testid=circle-card]')).toContainText('Familia Test');

    // 3. Invitar miembro (segunda pestaña simula otro usuario)
    const memberPage = await context.newPage();
    await memberPage.goto('/register');
    await memberPage.fill('[name=email]', 'member@familylink.test');
    await memberPage.fill('[name=username]', 'MemberTest');
    await memberPage.fill('[name=password]', 'SecurePass123');
    await memberPage.click('[type=submit]');

    // Admin invita al miembro
    await page.click('[data-testid=invite-member-btn]');
    await page.fill('[name=inviteEmail]', 'member@familylink.test');
    await page.click('[data-testid=send-invitation]');
    await expect(page.locator('[data-testid=invitation-sent]')).toBeVisible();

    // 4. Compartir ubicación
    await page.goto('/map');
    // Mock de geolocalización
    await page.context().setGeolocation({ latitude: 40.4168, longitude: -3.7038 });
    await page.click('[data-testid=share-location-btn]');
    await expect(page.locator('[data-testid=location-shared-toast]')).toBeVisible();

    // 5. Verificar marcador en mapa
    await expect(page.locator('[data-testid=member-marker]')).toBeVisible();
  });
});
```

---

### 8.6 Cobertura Objetivo

| Módulo | Cobertura líneas | Cobertura ramas | Obligatorio |
|--------|-----------------|-----------------|-------------|
| `domain/value-objects/` | **100%** | **100%** | ✅ Sí (TST-1) |
| `domain/aggregates/` | **100%** | **95%** | ✅ Sí (TST-1) |
| `domain/services/` | **100%** | **100%** | ✅ Sí |
| `application/use-cases/` | **90%** | **85%** | ✅ Sí (NFR-14) |
| `infrastructure/persistence/` | **70%** | **65%** | Recomendado |
| `infrastructure/http/routes/` | **80%** | **75%** | ✅ Sí (NFR-13) |
| `frontend/components/` | **80%** | **75%** | ✅ Sí (NFR-13) |
| `frontend/hooks/` | **80%** | **75%** | ✅ Sí |

---

### 8.7 Comandos de Ejecución

```bash
# Backend — tests unitarios
npm test

# Backend — tests con cobertura
npm run test:cov

# Backend — tests de integración (requiere Docker para PostgreSQL)
npm run test:integration

# Frontend — tests de componentes
npm run test:frontend

# E2E — flujo crítico completo (requiere stack levantado)
npm run test:e2e

# E2E — modo UI interactivo (Playwright UI)
npm run test:e2e:ui

# Todos los tests en CI
npm run test:all
```

**`package.json` (scripts relevantes):**

```json
{
  "scripts": {
    "test":              "vitest run --config vitest.config.ts",
    "test:cov":          "vitest run --coverage --config vitest.config.ts",
    "test:integration":  "vitest run --config vitest.integration.config.ts",
    "test:frontend":     "vitest run --config frontend/vitest.config.ts",
    "test:e2e":          "playwright test",
    "test:e2e:ui":       "playwright test --ui",
    "test:all":          "npm run test:cov && npm run test:integration && npm run test:e2e"
  }
}
```

---

## 9. Deployment & CI/CD

### 9.1 Entornos

| Entorno | Frontend | Backend | Base de datos | Propósito |
|---------|----------|---------|---------------|-----------|
| **Local** | `localhost:5173` (Vite dev) | `localhost:3000` (ts-node-dev) | Docker Compose (PostgreSQL + Redis) | Desarrollo diario |
| **Preview** | Vercel preview URL (por PR) | Render preview service | Railway (misma instancia) | Revisión de PRs |
| **Producción** | Vercel production URL | Render production service | Railway production | Demo TFG / evaluación |

Todos los entornos cumplen **COST-1**: Vercel free tier, Render free tier, Railway free tier ($5 crédito inicial cubre el TFG completo).

---

### 9.2 Pipeline CI/CD

```mermaid
flowchart TD
  A[Push / PR a main] --> B[GitHub Actions trigger]
  B --> C{Lint}
  C -->|❌ falla| FAIL1[❌ Pipeline detenido<br/>notifica al autor]
  C -->|✅ pasa| D{Tests unitarios<br/>Vitest}
  D -->|❌ falla| FAIL2[❌ Pipeline detenido]
  D -->|✅ pasa| E{Tests integración<br/>Vitest + DB}
  E -->|❌ falla| FAIL3[❌ Pipeline detenido]
  E -->|✅ pasa| F{Build<br/>tsc + vite build}
  F -->|❌ falla| FAIL4[❌ Pipeline detenido]
  F -->|✅ pasa| G{¿Es push a main?}
  G -->|No — es PR| H[✅ PR checks verdes<br/>listo para merge]
  G -->|Sí — es merge| I[Deploy Frontend<br/>Vercel CLI]
  I --> J[Deploy Backend<br/>Render deploy hook]
  J --> K[Smoke test<br/>GET /health]
  K -->|❌ falla| L[🔄 Rollback automático<br/>Render redeploy anterior]
  K -->|✅ pasa| M[✅ Deploy completado<br/>notificación Slack/email]
```

---

### 9.3 GitHub Actions — Backend

```yaml
# .github/workflows/ci-backend.yml
name: CI Backend

on:
  push:
    branches: [main]
    paths: ['backend/**']
  pull_request:
    branches: [main]
    paths: ['backend/**']

jobs:
  ci:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: familylink_test
        ports: ['5432:5432']
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: backend/package-lock.json

      - name: Install dependencies
        run: npm ci
        working-directory: backend

      - name: Lint
        run: npm run lint
        working-directory: backend

      - name: Type check
        run: npm run typecheck
        working-directory: backend

      - name: Unit tests
        run: npm test
        working-directory: backend

      - name: Integration tests
        run: npm run test:integration
        working-directory: backend
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/familylink_test
          JWT_ACCESS_SECRET: test-access-secret-256bits
          JWT_REFRESH_SECRET: test-refresh-secret-256bits
          COORDINATES_ENCRYPTION_KEY: ${{ secrets.TEST_ENCRYPTION_KEY }}

      - name: Coverage report
        run: npm run test:cov
        working-directory: backend

      - name: Build
        run: npm run build
        working-directory: backend

  deploy:
    needs: ci
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'

    steps:
      - name: Deploy to Render
        run: |
          curl -X POST "${{ secrets.RENDER_DEPLOY_HOOK_URL }}"

      - name: Smoke test
        run: |
          sleep 30
          curl --fail "${{ secrets.BACKEND_PRODUCTION_URL }}/health" || exit 1
```

---

### 9.4 GitHub Actions — Frontend

```yaml
# .github/workflows/ci-frontend.yml
name: CI Frontend

on:
  push:
    branches: [main]
    paths: ['frontend/**']
  pull_request:
    branches: [main]
    paths: ['frontend/**']

jobs:
  ci:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json

      - name: Install dependencies
        run: npm ci
        working-directory: frontend

      - name: Lint
        run: npm run lint
        working-directory: frontend

      - name: Type check
        run: npm run typecheck
        working-directory: frontend

      - name: Unit + component tests
        run: npm run test:frontend
        working-directory: frontend

      - name: Build
        run: npm run build
        working-directory: frontend
        env:
          VITE_API_URL: ${{ secrets.VITE_API_URL_PREVIEW }}
          VITE_WS_URL: ${{ secrets.VITE_WS_URL_PREVIEW }}

  deploy:
    needs: ci
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'

    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: frontend
          vercel-args: '--prod'
```

---

### 9.5 Variables de Entorno

#### Backend — `.env.example`

```bash
# ── Servidor ──────────────────────────────────────────
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173

# ── Base de datos (Railway PostgreSQL) ────────────────
DATABASE_URL=postgresql://user:password@host:5432/familylink

# ── Autenticación JWT ─────────────────────────────────
JWT_ACCESS_SECRET=cambia-esto-por-256-bits-aleatorios
JWT_REFRESH_SECRET=cambia-esto-por-otro-secreto-diferente
JWT_ACCESS_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=30d

# ── Cifrado de coordenadas (AES-256-GCM) ──────────────
# Genera con: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
COORDINATES_ENCRYPTION_KEY=hex-de-64-caracteres-aqui

# ── Redis (Upstash) ───────────────────────────────────
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=tu-token-upstash

# ── Firebase FCM ──────────────────────────────────────
FIREBASE_PROJECT_ID=tu-proyecto-firebase
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@tu-proyecto.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# ── Email (Resend — free tier 3k/mes) ─────────────────
RESEND_API_KEY=re_xxxxxxxxxxxx
EMAIL_FROM=noreply@familylink.app

# ── Logs ──────────────────────────────────────────────
LOG_LEVEL=info
```

#### Frontend — `.env.example`

```bash
# ── API ───────────────────────────────────────────────
VITE_API_URL=http://localhost:3000/api/v1
VITE_WS_URL=http://localhost:3000

# ── Firebase (cliente — solo para FCM web push) ───────
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123

# ── Feature flags ─────────────────────────────────────
VITE_ENABLE_WEBVIEW_MODE=false
```

---

### 9.6 Desarrollo Local con Docker Compose

```yaml
# docker-compose.yml (raíz del monorepo)
version: '3.9'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: familylink
      POSTGRES_PASSWORD: familylink
      POSTGRES_DB: familylink_dev
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'
    command: redis-server --maxmemory 50mb --maxmemory-policy allkeys-lru

volumes:
  postgres_data:
```

```bash
# Levantar servicios locales
docker compose up -d

# Ejecutar migraciones
cd backend && npx prisma migrate dev

# Arrancar backend en modo watch
cd backend && npm run dev

# Arrancar frontend en modo watch
cd frontend && npm run dev
```

---

### 9.7 Estrategia de Rollback

| Servicio | Mecanismo | Tiempo estimado |
|---------|-----------|-----------------|
| **Frontend (Vercel)** | Vercel mantiene historial de deployments. Rollback desde dashboard en 1 clic o via CLI: `vercel rollback` | < 1 min |
| **Backend (Render)** | Render guarda las últimas 5 versiones desplegadas. Rollback desde dashboard o redeploy del commit anterior | 2–3 min |
| **Base de datos (Railway)** | Prisma migrations son reversibles con `prisma migrate resolve --rolled-back`. Backups automáticos diarios en Railway | Depende de la migración |

**Política de rollback automático:**
Si el smoke test (`GET /health`) falla tras el deploy del backend, el workflow de GitHub Actions ejecuta automáticamente un redeploy del commit anterior via el deploy hook de Render. El frontend no se despliega si el backend falla, gracias al orden de jobs en el pipeline.

```bash
# Rollback manual de emergencia
# Frontend
vercel rollback --token $VERCEL_TOKEN

# Backend — redeploy del commit anterior
git revert HEAD --no-edit
git push origin main
```

---

## 10. Zero-Cost Compliance (COST-1)

### 10.1 Tabla de Verificación de Servicios

| Servicio | Plan | Límite del plan | Consumo estimado TFG | Riesgo | Mitigación |
|---------|------|----------------|----------------------|--------|------------|
| **Render** (backend) | Free | 750h/mes, 15GB ancho de banda, sleep tras 15min inactividad | ~600h, ~5GB | Bajo | Si se excede, reportar logs localmente; usar `UptimeRobot` para mantener el servicio activo |
| **Vercel** (frontend) | Free | 100GB ancho de banda/mes, 100 deployments/día | ~10GB, ~50 deployments | Muy bajo | — |
| **Railway** (PostgreSQL) | Free | $5 crédito inicial, ~1GB RAM, 100GB almacenamiento | ~500MB almacenamiento | Bajo | Usar índices eficientes, limpieza automática de `location_updates` a 30 días |
| **Upstash Redis** | Free | 10.000 req/día, 256MB | <5.000 req/día | Bajo | TTL de 5 minutos en caché de ubicaciones; no cachear datos no críticos |
| **Firebase FCM** | Free | Sin límite práctico (mensajes push) | <1.000 notificaciones/día | Muy bajo | — |
| **GitHub Actions** | Free | 2.000 min/mes (repositorios públicos: ilimitado) | <500 min/mes | Muy bajo | Mantener repositorio público; optimizar workflows con `paths` filters |
| **Leaflet + OSM** | Free | Sin límite (tiles OSM: uso razonable) | Ilimitado | Ninguno | Respetar [Tile Usage Policy](https://operations.osmfoundation.org/policies/tiles/) de OSM |
| **Resend** (email) | Free | 3.000 emails/mes, 100/día | <200 emails/mes | Muy bajo | Solo emails transaccionales (registro, invitaciones, alertas) |
| **Vitest / Playwright** | Free (OSS) | Sin límite | — | Ninguno | — |
| **Prisma ORM** | Free (OSS) | Sin límite | — | Ninguno | — |

**Estado global COST-1: ✅ Todos los servicios cumplen la restricción de coste cero para el TFG.**

---

### 10.2 Riesgos Detallados y Mitigaciones

#### Render — Sleep en Free Tier
El servicio de Render en plan gratuito entra en modo sleep tras 15 minutos de inactividad, lo que causa un cold start de ~30 segundos en la primera petición.

**Mitigación:** Configurar un ping periódico con UptimeRobot (gratuito, 50 monitores) cada 14 minutos para mantener el servicio activo durante la demo del TFG.

```bash
# UptimeRobot monitoriza: GET https://familylink-api.onrender.com/health
# Intervalo: 5 minutos (suficiente para evitar sleep)
```

#### Railway — Crédito Inicial
Railway ofrece $5 de crédito inicial. Un servicio PostgreSQL básico consume aproximadamente $0.01–0.05/hora según el uso.

**Estimación:** Para un TFG con uso moderado (~4 meses de desarrollo + demo), el consumo estimado es $3–4, dentro del crédito gratuito.

#### Upstash Redis — Límite Diario
10.000 requests/día equivalen a ~7 req/minuto. Con el patrón de uso de FamilyLink (ubicaciones bajo demanda, no continuas), el consumo real será muy inferior.

**Mitigación:** TTL de 5 minutos en todas las entradas de caché. No usar Redis para datos que no requieran acceso frecuente.

---

### 10.3 Script de Verificación: `npm run check-costs`

El script consulta las APIs de cada servicio para reportar el consumo actual y alertar si se acerca a los límites.

```typescript
// backend/scripts/check-costs.ts
import { Redis } from '@upstash/redis';

interface ServiceStatus {
  service: string;
  limit: string;
  current: string;
  percentage: number;
  status: '✅ OK' | '⚠️ Atención' | '🚨 Crítico';
}

async function checkUpstashUsage(): Promise<ServiceStatus> {
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });

  const info = await redis.info('stats');
  const totalCommands = parseInt(
    info.split('\n').find(l => l.startsWith('total_commands_processed'))?.split(':')[1] ?? '0'
  );

  const dailyEstimate = Math.round(totalCommands / 30); // estimación diaria
  const percentage = Math.round((dailyEstimate / 10000) * 100);

  return {
    service: 'Upstash Redis',
    limit: '10.000 req/día',
    current: `~${dailyEstimate} req/día`,
    percentage,
    status: percentage < 70 ? '✅ OK' : percentage < 90 ? '⚠️ Atención' : '🚨 Crítico',
  };
}

async function checkDatabaseSize(): Promise<ServiceStatus> {
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();

  const result = await prisma.$queryRaw<[{ size: string }]>`
    SELECT pg_size_pretty(pg_database_size(current_database())) as size
  `;
  const sizeStr = result[0].size;
  const sizeMB = parseFloat(sizeStr); // aproximación

  await prisma.$disconnect();

  const percentage = Math.round((sizeMB / 1024) * 100); // sobre 1GB

  return {
    service: 'Railway PostgreSQL',
    limit: '1GB almacenamiento',
    current: sizeStr,
    percentage,
    status: percentage < 70 ? '✅ OK' : percentage < 90 ? '⚠️ Atención' : '🚨 Crítico',
  };
}

async function checkGitHubActionsMinutes(): Promise<ServiceStatus> {
  // Requiere GITHUB_TOKEN con permisos de lectura
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return {
      service: 'GitHub Actions',
      limit: '2.000 min/mes',
      current: 'N/A (sin GITHUB_TOKEN)',
      percentage: 0,
      status: '✅ OK',
    };
  }

  const res = await fetch(
    'https://api.github.com/repos/OWNER/familylink/actions/billing/usage',
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const data = await res.json();
  const used = data.total_minutes_used ?? 0;
  const percentage = Math.round((used / 2000) * 100);

  return {
    service: 'GitHub Actions',
    limit: '2.000 min/mes',
    current: `${used} min`,
    percentage,
    status: percentage < 70 ? '✅ OK' : percentage < 90 ? '⚠️ Atención' : '🚨 Crítico',
  };
}

async function main() {
  console.log('\n🔍 FamilyLink — Zero-Cost Compliance Check');
  console.log('==========================================\n');

  const checks = await Promise.allSettled([
    checkUpstashUsage(),
    checkDatabaseSize(),
    checkGitHubActionsMinutes(),
  ]);

  const results: ServiceStatus[] = checks.map((r, i) =>
    r.status === 'fulfilled'
      ? r.value
      : { service: `Check ${i}`, limit: '—', current: 'Error', percentage: 0, status: '⚠️ Atención' as const }
  );

  // Tabla de resultados
  console.log('Servicio'.padEnd(25) + 'Límite'.padEnd(20) + 'Actual'.padEnd(20) + 'Uso%'.padEnd(8) + 'Estado');
  console.log('─'.repeat(85));
  for (const r of results) {
    const bar = '█'.repeat(Math.round(r.percentage / 10)).padEnd(10, '░');
    console.log(
      r.service.padEnd(25) +
      r.limit.padEnd(20) +
      r.current.padEnd(20) +
      `${r.percentage}%`.padEnd(8) +
      `${bar} ${r.status}`
    );
  }

  // Servicios manuales (sin API de consumo)
  console.log('\n📋 Servicios sin API de consumo (verificación manual):');
  console.log('  • Render (backend):  https://dashboard.render.com → Usage');
  console.log('  • Vercel (frontend): https://vercel.com/dashboard → Usage');
  console.log('  • Firebase FCM:      https://console.firebase.google.com → Usage');

  const hasCritical = results.some(r => r.status === '🚨 Crítico');
  const hasWarning  = results.some(r => r.status === '⚠️ Atención');

  if (hasCritical) {
    console.log('\n🚨 ALERTA: Uno o más servicios están cerca del límite gratuito.');
    process.exit(1);
  } else if (hasWarning) {
    console.log('\n⚠️  AVISO: Algunos servicios superan el 70% de uso. Monitorizar.');
  } else {
    console.log('\n✅ Todos los servicios dentro de los límites gratuitos.');
  }
}

main().catch(console.error);
```

**Añadir al `package.json` del backend:**

```json
{
  "scripts": {
    "check-costs": "ts-node --esm scripts/check-costs.ts"
  }
}
```

**Uso:**

```bash
# Verificación manual
cd backend && npm run check-costs

# Salida esperada:
# 🔍 FamilyLink — Zero-Cost Compliance Check
# ==========================================
#
# Servicio                 Límite              Actual              Uso%    Estado
# ─────────────────────────────────────────────────────────────────────────────────
# Upstash Redis            10.000 req/día      ~3.200 req/día      32%     ██████░░░░ ✅ OK
# Railway PostgreSQL       1GB almacenamiento  245 MB              24%     ████░░░░░░ ✅ OK
# GitHub Actions           2.000 min/mes       187 min             9%      █░░░░░░░░░ ✅ OK
#
# ✅ Todos los servicios dentro de los límites gratuitos.
```
