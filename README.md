# FamilyLink

Aplicacion de localizacion en tiempo real para familia y amigos. Comparte tu ubicacion de forma segura, crea circulos de confianza, chatea con tu grupo y gestiona zonas personalizadas en un mapa interactivo.

## Que es FamilyLink

FamilyLink es una plataforma que permite a grupos de familia y amigos compartir su ubicacion en tiempo real de forma voluntaria y segura. A diferencia de otras apps de localizacion, aqui el usuario decide cuando y con quien comparte su posicion.

### Funcionalidades principales

- **Circulos de familia/amigos** — Crea grupos privados e invita a personas por email
- **Mapa interactivo** — Visualiza la ubicacion de tu grupo en tiempo real con MapLibre GL
- **Chat integrado** — Mensajes de texto, emojis, GIFs (GIPHY), fotos, notas de voz y encuestas interactivas
- **Zonas personalizadas** — Crea zonas como "Casa", "Trabajo" o "Gym" con colores y radios configurables
- **Modo Fantasma** — Hazte invisible en el mapa sin que nadie lo sepa
- **Retos diarios** — Sistema de gamificacion con medallas y rachas
- **Login con Google** — Autenticacion social via OAuth 2.0
- **Presencia en tiempo real** — Ve quien esta online con indicadores verdes via WebSocket
- **Bandeja de invitaciones** — Acepta o rechaza invitaciones a circulos
- **Panel de miembros** — Visualiza los miembros de cada circulo con roles y estado
- **Tutorial interactivo** — Guia paso a paso para nuevos usuarios (se repite cada 3 semanas)
- **Llegue bien** — Notifica a tu grupo que has llegado a tu destino con un solo toque

## Tecnologias

### Backend
| Tecnologia | Uso |
|------------|-----|
| Node.js 20 | Runtime |
| TypeScript | Lenguaje |
| Express | Framework HTTP |
| Prisma ORM | Acceso a base de datos |
| PostgreSQL (Neon) | Base de datos relacional |
| Socket.IO | Comunicacion en tiempo real |
| Passport.js | Autenticacion OAuth (Google) |
| JWT | Tokens de sesion |
| Bcrypt | Hash de contrasenas |
| Zod | Validacion de datos |

### Frontend
| Tecnologia | Uso |
|------------|-----|
| React 18 | UI Framework |
| TypeScript | Lenguaje |
| Vite | Build tool |
| Tailwind CSS 4 | Estilos |
| Zustand | Estado global |
| Framer Motion | Animaciones |
| MapLibre GL | Mapa interactivo |
| React Router | Navegacion SPA |
| Axios | Cliente HTTP |
| i18next | Internacionalizacion |

### Infraestructura
| Servicio | Uso |
|----------|-----|
| Vercel | Hosting frontend |
| Render | Hosting backend |
| Neon | Base de datos PostgreSQL en la nube |
| GitHub | Repositorio y CI/CD |
| Capacitor | Wrapper nativo Android (APK) |

### APIs externas
| API | Uso |
|-----|-----|
| MapTiler | Estilos de mapa (callejero, nocturno, satelite, toner) |
| Google OAuth | Login social |
| GIPHY | GIFs en el chat |
| OpenWeather | Badge de clima en el mapa |

## Arquitectura

El proyecto sigue una **arquitectura hexagonal (puertos y adaptadores)** con principios de **Domain-Driven Design (DDD)**:

```
backend/
├── src/
│   ├── domain/              # Entidades, Value Objects, Puertos (interfaces)
│   │   ├── aggregates/      # Circle, User
│   │   ├── entities/        # Zone, Location
│   │   ├── value-objects/   # CircleId, UserId, ColorHex, ZonePolygon
│   │   ├── ports/           # ICircleRepository, IUserRepository, etc.
│   │   └── services/        # Servicios de dominio
│   ├── application/         # Casos de uso (logica de aplicacion)
│   │   ├── use-cases/       # CreateCircle, ShareLocation, SendMessage, etc.
│   │   └── dtos/            # Data Transfer Objects
│   ├── infrastructure/      # Implementaciones concretas
│   │   ├── http/            # Express server, routes, middleware
│   │   ├── persistence/     # Prisma repositories
│   │   ├── auth/            # JWT, Bcrypt, Passport
│   │   ├── realtime/        # Socket.IO, OnlineTracker
│   │   └── cron/            # Tareas programadas
│   └── shared/              # Utilidades compartidas (logger, errors)
├── prisma/
│   └── schema.prisma        # Modelo de datos
└── package.json

frontend/
├── src/
│   ├── components/          # 30+ componentes reutilizables
│   ├── pages/               # LoginPage, DashboardPage, MapPage, ProfilePage
│   ├── stores/              # Zustand (authStore, circleStore, mapStore)
│   ├── hooks/               # useSocket (WebSocket)
│   ├── lib/                 # API client, mapStyles, challenges, avatars
│   └── i18n/                # Traducciones
├── android/                 # Proyecto nativo Android (Capacitor)
└── package.json
```

## Modelo de datos

```
Users ──┬── CircleMembers ──── Circles
        ├── SocialAccounts          │
        ├── RefreshTokens           ├── Zones
        ├── LocationUpdates         ├── Invitations
        └── Messages ───────────────┘
```

## Despliegue

La aplicacion esta desplegada y accesible en:

- **Web:** https://family-link-rosy.vercel.app
- **Backend API:** https://familylink-kj8i.onrender.com
- **APK Android:** Disponible en `/frontend/android/app/build/outputs/apk/debug/`

### Variables de entorno necesarias

**Backend (Render):**
- `DATABASE_URL` — URL de PostgreSQL (Neon)
- `JWT_SECRET`, `JWT_REFRESH_SECRET` — Secretos para tokens
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` — OAuth Google
- `FRONTEND_URL` — URL del frontend para redirects OAuth

**Frontend (Vercel):**
- `VITE_API_URL` — URL del backend
- `VITE_MAPTILER_KEY` — Clave de MapTiler
- `VITE_GIPHY_KEY` — Clave de GIPHY
- `VITE_OPENWEATHER_KEY` — Clave de OpenWeather

## Setup local

```bash
# Clonar repositorio
git clone https://github.com/J0svh/FamilyLink.git
cd FamilyLink

# Backend
cd backend
cp .env.example .env  # Configurar variables
npm install
npx prisma migrate dev
npm run dev

# Frontend (en otra terminal)
cd frontend
cp .env.example .env  # Configurar variables
npm install
npm run dev
```

## Generar APK Android

```bash
cd frontend
npm run build
npx cap sync android
cd android
export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64
export ANDROID_SDK_ROOT=$HOME/android-sdk
./gradlew assembleDebug
# APK en: app/build/outputs/apk/debug/app-debug.apk
```

## Autor

**Jose Velasquez** — Proyecto Intermodular de Desarrollo de Aplicaciones Multiplataforma (DAM)

---

*Desarrollado con TypeScript, arquitectura hexagonal y DDD. Desplegado en Vercel + Render + Neon.*
