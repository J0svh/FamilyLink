# Tasks — FamilyLink

> Tareas ordenadas por dependencia. Cada tarea depende de las anteriores salvo indicación contraria.
> Restricción global activa: **COST-1** — todo el stack debe ser gratuito.

---

## Task 1: Setup del proyecto

- [ ] 1.1 Inicializar monorepo con estructura `backend/` y `frontend/` en la raíz
- [ ] 1.2 Inicializar backend con Node.js 20 + TypeScript 5 + Express 4
  - `npm init`, `tsconfig.json`, `ts-node-dev` para desarrollo
  - Estructura de carpetas hexagonal: `domain/`, `application/`, `infrastructure/`, `shared/`
- [ ] 1.3 Configurar Prisma con PostgreSQL
  - Instalar `prisma` y `@prisma/client`
  - Crear `schema.prisma` con los modelos: `User`, `Circle`, `CircleMember`, `Zone`, `LocationUpdate`, `Invitation`, `DailyLimit`, `RefreshToken`
  - Configurar `DATABASE_URL` en `.env`
- [ ] 1.4 Inicializar frontend con Vite + React 18 + TypeScript 5
  - `npm create vite@latest frontend -- --template react-ts`
  - Instalar dependencias: `react-router-dom`, `zustand`, `@tanstack/react-query`, `axios`, `i18next`, `react-i18next`
- [ ] 1.5 Configurar ESLint + Prettier en backend y frontend
  - Reglas: `@typescript-eslint`, `eslint-plugin-import`, `prettier`
  - Scripts: `npm run lint`, `npm run lint:fix`
- [ ] 1.6 Configurar Vitest para tests unitarios e integración (backend)
  - `vitest.config.ts` con coverage provider `v8`, thresholds 80%
  - `vitest.integration.config.ts` para tests con DB real
- [ ] 1.7 Configurar Vitest + React Testing Library para tests de frontend
  - `jsdom` environment, `@testing-library/react`, `@testing-library/user-event`
- [ ] 1.8 Configurar Playwright para tests E2E
  - `playwright.config.ts` apuntando a `localhost:5173`
- [ ] 1.9 Configurar Docker Compose para desarrollo local
  - Servicios: `postgres:16-alpine`, `redis:7-alpine`
  - Script `npm run dev:services` para levantar dependencias
- [ ] 1.10 Configurar GitHub Actions CI (lint + test + build)
  - `.github/workflows/ci-backend.yml`
  - `.github/workflows/ci-frontend.yml`

---

## Task 2: Domain Layer (núcleo de negocio)

> Depende de: Task 1
> Sin dependencias externas — código TypeScript puro.

- [ ] 2.1 Value Objects
  - `Email` — validación de formato RFC 5322
  - `Coordinates` — validación lat ∈ [-90,90], lng ∈ [-180,180], inmutable
  - `ColorHex` — validación formato `#RRGGBB`
  - `ZonePolygon` — validación 3–50 vértices, área mínima 100m², detección de auto-intersección
  - `DailyLimit` — validación entero 1–500
  - `UserId`, `CircleId`, `ZoneId`, `InvitationId` — branded types UUID
- [ ] 2.2 Entidades
  - `User` — id, email, username, passwordHash, language, privacyMode state
  - `Circle` — id, name, createdBy, members (colección)
  - `Zone` — id, circleId, name, nameEn, colorHex, polygon, areaSqm, active
  - `Invitation` — id, circleId, invitedBy, email, status, expiresAt
  - `LocationUpdate` — id, userId, circleId, coordinates, capturedAt
- [ ] 2.3 Aggregates
  - `Circle` (Aggregate Root) — encapsula miembros, zonas e invitaciones; invariantes: máx. 20 zonas, máx. 10 círculos por usuario, al menos 1 admin
  - `User` (Aggregate Root) — encapsula estado de Privacy_Mode; invariantes: máx. 5 activaciones/día, duración 15min–8h
- [ ] 2.4 Domain Events
  - `LocationShared` — userId, circleId, coordinates, capturedAt
  - `ZoneEntered` — userId, circleId, zoneId, timestamp
  - `ZoneExited` — userId, circleId, zoneId, timestamp
  - `PrivacyModeActivated` — userId, circleId, expiresAt
  - `PrivacyModeDeactivated` — userId, circleId, timestamp
  - `CircleCreated` — circleId, createdBy
  - `MemberInvited` — circleId, email, invitationId
- [ ] 2.5 Repository Ports (interfaces)
  - `IUserRepository` — findById, findByEmail, save, delete
  - `ICircleRepository` — findById, findByMemberId, save, delete
  - `IZoneRepository` — findById, findByCircleId, save, delete, countByCircleId
  - `ILocationRepository` — save, findLatestByUserId, findByCircleId, deleteOlderThan, countTodayByUserId
  - `IInvitationRepository` — findById, findPendingByCircleId, findPendingByEmail, save, invalidate
  - `INotificationService` — sendPushToCircle, sendEmailToUser
  - `ILocationCache` — setActiveLocation, getActiveLocation, removeActiveLocation
  - `IEventPublisher` — publish(event)
- [ ] 2.6 Domain Services
  - `ZoneEvaluationService` — algoritmo ray-casting para punto-en-polígono; evalúa si un `LocationUpdate` cruza el límite de alguna `Zone`
  - `DailyLimitService` — verifica si un usuario ha alcanzado su `DailyLimit` para el día actual (UTC)
- [ ] 2.7 Tests unitarios para todo el dominio (objetivo: 100% cobertura)
  - Tests para cada Value Object: casos válidos, límites exactos, casos inválidos, inmutabilidad, value equality
  - Tests para invariantes de Aggregates
  - Tests para `ZoneEvaluationService` con polígonos convexos, cóncavos y casos borde
  - Tests para `DailyLimitService`

---

## Task 3: Application Layer (use cases)

> Depende de: Task 2

- [ ] 3.1 Auth use cases
  - `RegisterUserUseCase` — valida email único, hashea contraseña, emite tokens
  - `LoginUserUseCase` — verifica credenciales, aplica rate limiting de intentos, emite tokens
  - `RefreshTokenUseCase` — valida refresh token, emite nuevo access token
  - `LogoutUseCase` — revoca refresh token activo
- [ ] 3.2 Circle use cases
  - `CreateCircleUseCase` — crea círculo, asigna rol Circle_Admin, verifica límite de 10 círculos
  - `InviteMemberUseCase` — verifica que el email no sea ya miembro, crea Invitation, emite MemberInvited event
  - `AcceptInvitationUseCase` — verifica que la invitación no haya expirado, añade miembro como Circle_Member
  - `DissolveCircleUseCase` — elimina zonas, ubicaciones e invitaciones, notifica a miembros
  - `RemoveMemberUseCase` — revoca acceso inmediato, verifica que no sea el único admin
  - `UpdateMemberRoleUseCase` — cambia rol, registra cambio con timestamp y actor
  - `UpdateDailyLimitsUseCase` — valida rango 1–500, persiste límites por rol
- [ ] 3.3 Location use cases
  - `ShareLocationUseCase` — verifica Privacy_Mode, verifica DailyLimit, valida coordenadas, persiste, emite LocationShared, evalúa zonas
  - `GetCircleLocationsUseCase` — devuelve última ubicación de cada miembro (excluyendo los en Privacy_Mode)
- [ ] 3.4 Zone use cases
  - `CreateZoneUseCase` — valida polígono (vértices, área, auto-intersección), verifica límite de 20 zonas, persiste
  - `UpdateZoneUseCase` — actualiza nombre, color o vértices; re-valida polígono si cambian vértices
  - `DeleteZoneUseCase` — elimina zona y cancela notificaciones pendientes asociadas
  - `GetZonesByCircleUseCase` — devuelve todas las zonas activas del círculo
- [ ] 3.5 Privacy use cases
  - `ActivatePrivacyModeUseCase` — verifica límite de 5 activaciones/día, valida duración 15–480 min, registra activación
  - `DeactivatePrivacyModeUseCase` — desactiva inmediatamente, emite PrivacyModeDeactivated event
- [ ] 3.6 DTOs para todos los use cases (input y output)
- [ ] 3.7 Tests de integración para todos los use cases
  - Usar mocks in-memory de los ports (InMemoryUserRepository, etc.)
  - Cubrir camino feliz + casos de error de cada use case

---

## Task 4: Infrastructure Layer (adapters)

> Depende de: Task 3

- [ ] 4.1 Persistence adapters (Prisma + PostgreSQL)
  - `PostgresUserRepository` implementa `IUserRepository`
  - `PostgresCircleRepository` implementa `ICircleRepository`
  - `PostgresZoneRepository` implementa `IZoneRepository`
  - `PostgresLocationRepository` implementa `ILocationRepository` (con cifrado AES-256-GCM de coordenadas)
  - `PostgresInvitationRepository` implementa `IInvitationRepository`
  - Migraciones Prisma para todas las tablas con índices definidos en el design
- [ ] 4.2 Cache adapter
  - `UpstashLocationCache` implementa `ILocationCache`
  - TTL de 5 minutos en todas las entradas
  - Fallback graceful si Redis no está disponible
- [ ] 4.3 Notification adapter
  - `FCMNotificationAdapter` implementa `INotificationService`
  - Push notifications para entrada/salida de zonas y expiración de Privacy_Mode
  - Email via Resend para: registro, invitaciones, bloqueo de cuenta, eliminación de cuenta
- [ ] 4.4 Event publisher
  - `SocketIOEventPublisher` implementa `IEventPublisher`
  - Emite eventos a rooms de Socket.IO por `circleId`
  - Eventos: `location:updated`, `zone:entered`, `zone:exited`, `privacy:activated`, `privacy:deactivated`, `member:joined`, `member:removed`
- [ ] 4.5 HTTP server con Express
  - Setup de `app.ts` con Helmet, CORS, body-parser, compression
  - Middleware JWT (`authMiddleware`)
  - Middleware de roles (`requireCircleRole`)
  - Middleware de validación con Zod (`validate`)
  - Rate limiting: público (100/min), login (5/15min), ubicaciones (30/min por usuario)
  - Error handler global con formato `{ error, message, statusCode }`
- [ ] 4.6 Routes y controllers
  - `authRoutes.ts` — POST /register, /login, /refresh, /logout
  - `circleRoutes.ts` — CRUD círculos, invitaciones, miembros, daily limits
  - `locationRoutes.ts` — POST /locations, GET /locations/circles/:id
  - `zoneRoutes.ts` — CRUD zonas
  - `privacyRoutes.ts` — POST /privacy/activate, /privacy/deactivate
  - Swagger UI en `/api/docs`
- [ ] 4.7 Composition root
  - `container.ts` — instancia y conecta todos los adapters con los use cases
  - Variables de entorno validadas con Zod en `config/env.ts`
- [ ] 4.8 Cron jobs
  - Purga de `location_updates` > 30 días (02:00 UTC diario)
  - Expiración de `invitations` pendientes > 7 días
  - Reset de contadores diarios de Privacy_Mode y DailyLimit (00:00 UTC)
- [ ] 4.9 Tests de integración para adapters
  - Tests de repositorios con DB real (PostgreSQL en Docker)
  - Tests de endpoints con Supertest

---

## Task 5: Frontend (React + TypeScript + Tailwind + MapLibre)

> Depende de: Task 1 (setup)
> Puede desarrollarse en paralelo con Tasks 3–4
> Diseño: estilo Apple minimalista (Inter, espaciado generoso, bordes redondeados, animaciones sutiles)
> Paleta: fondo #FAFAFA, cards #FFFFFF, acento #007AFF, texto #1D1D1F, secundario #86868B

- [ ] 5.1 Configuración base
  - Tailwind CSS 4 configurado con Vite (paleta custom, dark mode con `prefers-color-scheme`)
  - React Router con lazy loading por ruta
  - Zustand stores: `authStore`, `circleStore`, `mapStore`
  - API client con Axios: instancia con baseURL, interceptor para añadir JWT, interceptor para refresh automático
  - React Query: configuración global, invalidación de caché
  - Framer Motion para animaciones de transición entre páginas
- [ ] 5.2 Auth pages
  - `LoginPage` — formulario email/contraseña, estilo Apple (card centrada, sombra sutil, bordes 12px)
  - `RegisterPage` — formulario con validación client-side, feedback de errores del servidor
  - Protección de rutas privadas (`PrivateRoute`)
  - Logo tipográfico "FamilyLink" en Inter 600 con color acento
- [ ] 5.3 Dashboard
  - Lista de círculos del usuario con rol (cards con sombra, avatar circular)
  - Botón "Crear círculo" con modal animado (Framer Motion)
  - Navegación a vista de mapa por círculo
- [ ] 5.4 Map page (MapLibre GL)
  - Integración MapLibre GL JS via `react-map-gl` con teselas MapTiler (free tier)
  - Selector de estilos de mapa: Streets, Dark/Nocturno, Satellite (MapTiler free styles)
  - Vista 3D: edificios extruidos, pitch (inclinación) y bearing (rotación) habilitados
  - `MemberMarker` — marcador HTML custom con avatar circular, nombre y timestamp
  - Animación de pulso CSS en el marcador del usuario activo
  - `ZoneLayer` — renderizado de polígonos con color hexadecimal y opacidad
  - Botón "Compartir ubicación" con feedback de éxito/error (animación check)
  - Actualización en tiempo real via Socket.IO (sin recargar página)
  - Mensaje "Cargando ubicaciones..." con reintento cada 30s si falla la carga
- [ ] 5.5 Zone drawer
  - Herramienta de dibujo de polígonos con `@mapbox/mapbox-gl-draw` (compatible MapLibre)
  - `ZoneColorPicker` — selector de color hexadecimal
  - Formulario de nombre (con campo opcional en inglés para i18n)
  - Validación client-side: mínimo 3 vértices, área mínima
  - Preview del polígono con color seleccionado antes de guardar
  - `ZoneColorPicker` — selector de color hexadecimal
  - Formulario de nombre (con campo opcional en inglés para i18n)
  - Validación client-side: mínimo 3 vértices, área mínima
- [ ] 5.6 Circle management page
  - Lista de miembros con roles
  - Formulario de invitación por email
  - Cambio de rol (solo Circle_Admin)
  - Eliminar miembro
  - Configurar daily limits por rol
- [ ] 5.7 Privacy Mode toggle
  - Botón con estado visual (activo/inactivo)
  - Selector de duración (15min, 30min, 1h, 2h, 4h, 8h)
  - Contador de activaciones restantes del día (5 máx.)
  - Desactivación manual
- [ ] 5.8 WebSocket client
  - Hook `useSocket` — conexión Socket.IO con JWT en handshake
  - Suscripción a eventos del círculo activo
  - Actualización automática del mapa al recibir `location:updated`
  - Ocultación de marcador al recibir `privacy:activated`
- [ ] 5.9 Internacionalización (i18n)
  - Configuración i18next con detección automática del idioma del navegador
  - Archivos de traducción: `es.json`, `en.json`
  - Todos los textos de UI traducidos (labels, mensajes de error, notificaciones)
- [ ] 5.10 Accesibilidad y responsive
  - WCAG 2.1 nivel AA: contraste, tamaño de texto, navegación por teclado
  - Modo oscuro/claro adaptable al sistema operativo (`prefers-color-scheme`)
  - Layout responsive para móvil y escritorio
- [ ] 5.11 Tests de componentes
  - Tests con Vitest + React Testing Library para componentes críticos
  - Tests para hooks: `useAuth`, `useSocket`, `useLocation`
  - Objetivo: 80% cobertura en componentes
- [ ] 5.12 Chat del círculo (si hay tiempo)
  - Componente `CircleChat` con mensajes en tiempo real (Socket.IO)
  - Selector de emojis con `emoji-mart`
  - Integración Tenor API para GIFs (free, sin límite real)
  - Avatares de miembros junto a mensajes
  - Modelo `Message` en Prisma + use cases SendMessage, GetMessages
  - Rate limiting: máx. 30 mensajes/minuto por usuario

---

## Task 6: Integración y E2E

> Depende de: Tasks 4 y 5

- [ ] 6.1 Integración frontend ↔ backend
  - Verificar todos los endpoints desde el frontend
  - Probar flujo de refresh token automático
  - Probar reconexión de WebSocket tras pérdida de conexión
- [ ] 6.2 Pruebas de flujos completos en local
  - Flujo de registro y login
  - Crear círculo e invitar miembro
  - Compartir ubicación y ver en mapa en tiempo real
  - Crear zona y recibir notificación de entrada/salida
  - Activar y desactivar Privacy Mode
- [ ] 6.3 Test E2E con Playwright — flujo crítico (TST-1)
  - `critical-flow.spec.ts`: registro → crear círculo → invitar → aceptar invitación → compartir ubicación → verificar marcador en mapa → notificación
  - Mock de geolocalización del navegador
  - Verificación de actualizaciones en tiempo real
- [ ] 6.4 Tests E2E adicionales
  - Flujo de zonas: crear zona → compartir ubicación dentro → verificar notificación
  - Flujo de Privacy Mode: activar → verificar ocultación → desactivar
  - Flujo de daily limit: alcanzar límite → verificar rechazo
- [ ] 6.5 Corrección de bugs detectados en pruebas
- [ ] 6.6 Verificación de cobertura global
  - Ejecutar `npm run test:cov` y verificar thresholds
  - Añadir tests donde la cobertura esté por debajo del objetivo

---

## Task 7: Observabilidad y Monitorización

> Depende de: Task 4
> Requisitos: OBS-1 a OBS-4

- [ ] 7.1 Logger estructurado JSON con pino
  - Redacción automática de campos sensibles (passwords, tokens, coordenadas)
  - Logs de auditoría para operaciones de zonas (OBS-2): user_id, circle_id, zone_id, operación, timestamp
- [ ] 7.2 Métricas de ubicación (OBS-1)
  - Contador `familylink_location_updates_total` por circle_id y minuto
  - Endpoint `/metrics` compatible con Prometheus (usando `prom-client`)
- [ ] 7.3 Health check endpoint
  - `GET /health` — verifica conectividad con PostgreSQL y Redis
  - Respuesta: `{ status: 'ok' | 'degraded', db: boolean, cache: boolean }`
- [ ] 7.4 Alertas de errores 5xx (OBS-3)
  - Middleware que cuenta errores 5xx en ventana de 5 minutos
  - Alerta via Discord webhook si supera el 1% de peticiones
- [ ] 7.5 Script `npm run check-costs`
  - Verificación de consumo de Upstash, PostgreSQL y GitHub Actions
  - Alerta si algún servicio supera el 70% del límite gratuito

---

## Task 8: Deployment

> Depende de: Tasks 6 y 7
> Todos los servicios cumplen COST-1 (gratuitos)

- [ ] 8.1 Configurar variables de entorno para producción
  - Generar secretos JWT (256 bits) y clave de cifrado AES-256
  - Configurar secrets en GitHub Actions
  - Crear `.env.production` (no commitear — solo documentar en `.env.example`)
- [ ] 8.2 Desplegar base de datos PostgreSQL en Railway
  - Crear proyecto en Railway, provisionar PostgreSQL
  - Ejecutar migraciones Prisma en producción: `prisma migrate deploy`
  - Verificar índices y datos iniciales (daily limits por defecto)
- [ ] 8.3 Desplegar backend en Render
  - Crear Web Service en Render conectado al repositorio GitHub
  - Configurar variables de entorno en el dashboard de Render
  - Configurar deploy hook para CI/CD
  - Configurar UptimeRobot para evitar sleep (ping cada 14 minutos)
- [ ] 8.4 Desplegar frontend en Vercel
  - Conectar repositorio GitHub a Vercel
  - Configurar variables de entorno (`VITE_API_URL`, `VITE_WS_URL`, Firebase config)
  - Verificar preview deployments en PRs
- [ ] 8.5 Configurar Upstash Redis para producción
  - Crear base de datos en Upstash (free tier)
  - Configurar `UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN`
- [ ] 8.6 Configurar Firebase FCM
  - Crear proyecto en Firebase Console
  - Descargar service account key para el backend
  - Configurar VAPID key para web push en el frontend
- [ ] 8.7 Smoke tests en producción
  - Verificar `GET /health` responde 200
  - Ejecutar flujo crítico manualmente en la URL de producción
  - Ejecutar `npm run check-costs` para verificar consumo inicial
- [ ] 8.8 Documentación de despliegue
  - Actualizar README con instrucciones de setup local y URLs de producción
  - Documentar proceso de rollback manual

---

## Dependencias entre Tasks

```
Task 1 (Setup)
    └── Task 2 (Domain)
            └── Task 3 (Application)
                    └── Task 4 (Infrastructure)
                            ├── Task 6 (Integración E2E)
                            ├── Task 7 (Observabilidad)
                            └── Task 8 (Deployment)
Task 1 (Setup)
    └── Task 5 (Frontend) ──► Task 6 (Integración E2E)
```

Tasks 2–5 pueden desarrollarse con cierto solapamiento:
- Task 5 puede empezar en paralelo con Tasks 3–4 (mockear la API)
- Task 7 puede desarrollarse en paralelo con Task 5
- Task 8 requiere Tasks 6 y 7 completas
