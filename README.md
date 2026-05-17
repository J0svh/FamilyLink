# FamilyLink

Aplicación de localización familiar con arquitectura hexagonal y DDD.

## Stack

- **Backend:** Node.js 20 + TypeScript + Express
- **Frontend:** React 18 + TypeScript + Vite
- **Base de datos:** PostgreSQL 16 + Prisma ORM
- **Cache:** Redis (Upstash)
- **Push notifications:** Firebase FCM

## Setup local

```bash
# 1. Instalar dependencias
npm install

# 2. Levantar PostgreSQL y Redis
npm run dev:services

# 3. Ejecutar migraciones
cd backend && npx prisma migrate dev

# 4. Arrancar todo
npm run dev
```

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Arranca backend + frontend + servicios |
| `npm run dev:backend` | Solo backend |
| `npm run dev:frontend` | Solo frontend |
| `npm run dev:services` | Solo Docker (PostgreSQL + Redis) |
| `npm run build` | Build de producción |
| `npm run lint` | Lint en ambos proyectos |
| `npm run test` | Tests unitarios backend |
| `npm run test:e2e` | Tests E2E con Playwright |

## Arquitectura

```
FamilyLink/
├── backend/          # Node.js + Express + DDD Hexagonal
├── frontend/         # React + Vite
├── docker-compose.yml
└── .github/workflows/
```
