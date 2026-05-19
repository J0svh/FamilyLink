# FamilyLink

> Aplicación de localización familiar con compartición de ubicación bajo demanda, zonas dibujables y modo privacidad.

## 🚀 Quick Start (Desarrollo Local)

### Requisitos
- Node.js 20+
- Docker & Docker Compose
- Git

### Setup

```bash
# 1. Clonar repositorio
git clone https://github.com/YOUR_USER/FamilyLink.git
cd FamilyLink

# 2. Levantar servicios (PostgreSQL + Redis)
docker compose up -d

# 3. Instalar dependencias
cd backend && npm install
cd ../frontend && npm install

# 4. Configurar variables de entorno
cp backend/.env.production.example backend/.env
# Editar backend/.env con valores de desarrollo (ya tiene defaults)

# 5. Ejecutar migraciones
cd backend && npx prisma migrate dev

# 6. Iniciar backend
npm run dev

# 7. Iniciar frontend (en otra terminal)
cd frontend && npm run dev
```

La app estará disponible en:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- Health check: http://localhost:3000/health

## 🏗️ Arquitectura

```
FamilyLink/
├── backend/          # Node.js + Express + TypeScript (DDD Hexagonal)
│   ├── src/
│   │   ├── domain/           # Núcleo puro (Value Objects, Entities, Aggregates)
│   │   ├── application/      # Use Cases + DTOs
│   │   ├── infrastructure/   # Adapters (Prisma, Express, Socket.IO)
│   │   └── shared/           # Logger, AppError, env
│   └── tests/
├── frontend/         # React 18 + Vite + Tailwind CSS 4 + MapLibre GL
│   ├── src/
│   │   ├── pages/            # Login, Register, Dashboard, Map
│   │   ├── components/       # ZoneDrawer, PrivacyModeToggle
│   │   ├── stores/           # Zustand (auth, circle, map)
│   │   ├── hooks/            # useSocket, useMediaQuery
│   │   └── lib/              # API client, map styles
│   └── e2e/
├── docker-compose.yml
├── .github/workflows/
└── scripts/
```

## 📡 API Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | /api/v1/auth/register | Registro de usuario |
| POST | /api/v1/auth/login | Login |
| POST | /api/v1/auth/refresh | Refresh token |
| POST | /api/v1/auth/logout | Logout |
| POST | /api/v1/circles | Crear círculo |
| POST | /api/v1/circles/:id/invitations | Invitar miembro |
| POST | /api/v1/locations | Compartir ubicación |
| GET | /api/v1/locations/circles/:id | Obtener ubicaciones |
| POST | /api/v1/zones/circles/:id | Crear zona |
| POST | /api/v1/privacy/activate | Activar modo privacidad |
| GET | /health | Health check |
| GET | /metrics | Métricas Prometheus |

## 🧪 Testing

```bash
# Backend unit tests
cd backend && npm test

# Backend integration tests
cd backend && npm run test:integration

# Frontend unit tests
cd frontend && npm test

# E2E tests (requiere backend + frontend corriendo)
cd frontend && npx playwright test

# Coverage
./scripts/verify-coverage.sh
```

## 🚢 Deployment

| Servicio | Plataforma | URL |
|----------|-----------|-----|
| Frontend | Vercel | https://familylink.vercel.app |
| Backend | Render | https://familylink-api.onrender.com |
| Database | Railway | (internal) |
| Cache | Upstash | (internal) |

### Deploy manual

1. Push a `main` → CI/CD automático via GitHub Actions
2. Backend se despliega en Render (auto-deploy on push)
3. Frontend se despliega en Vercel (auto-deploy on push)

### Rollback

```bash
# Backend: revert en Render dashboard o:
git revert HEAD && git push

# Frontend: revert en Vercel dashboard
```

## 💰 Costes

**Total: €0.00/mes** (restricción COST-1)

Verificar consumo: `./scripts/check-costs.sh`

## 📄 Licencia

MIT
