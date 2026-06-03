# FamilyLink — Arranque local completo
# Ejecutar desde la raiz del proyecto: .\start-local.ps1

Write-Host "=== FamilyLink Local Setup ===" -ForegroundColor Cyan

# 1. Levantar PostgreSQL con Docker
Write-Host "`n[1/4] Levantando PostgreSQL con Docker..." -ForegroundColor Yellow
docker compose up -d postgres
Start-Sleep -Seconds 3

# 2. Instalar dependencias backend
Write-Host "`n[2/4] Instalando dependencias del backend..." -ForegroundColor Yellow
Set-Location backend
npm install
npx prisma generate
npx prisma migrate deploy
Set-Location ..

# 3. Instalar dependencias frontend
Write-Host "`n[3/4] Instalando dependencias del frontend..." -ForegroundColor Yellow
Set-Location frontend
npm install
Set-Location ..

Write-Host "`n[4/4] Todo listo. Abre DOS terminales y ejecuta:" -ForegroundColor Green
Write-Host "  Terminal 1 (backend):  cd backend  ;  npm run dev" -ForegroundColor White
Write-Host "  Terminal 2 (frontend): cd frontend ;  npm run dev" -ForegroundColor White
Write-Host "`n  Backend:  http://localhost:3000/health" -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost:5173" -ForegroundColor Cyan
