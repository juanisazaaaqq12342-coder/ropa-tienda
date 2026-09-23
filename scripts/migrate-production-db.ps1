<#
.SYNOPSIS
  Aplica las migraciones de Prisma y opcionalmente aprovisiona el administrador en una base de datos remota o de producción.
.EXAMPLE
  powershell -ExecutionPolicy Bypass -File scripts/migrate-production-db.ps1 -DatabaseUrl "postgresql://usuario:pass@ep-xyz.neon.tech/neondb?sslmode=require" -AdminEmail "admin@tudominio.com" -AdminPassword "ClaveSegura123!"
#>
param(
  [Parameter(Mandatory=$false)]
  [string]$DatabaseUrl,

  [Parameter(Mandatory=$false)]
  [string]$AdminEmail,

  [Parameter(Mandatory=$false)]
  [string]$AdminPassword,

  [switch]$SeedCategoriesAndProducts
)

$ErrorActionPreference = 'Stop'
$workspaceRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))

if (-not $DatabaseUrl) {
  $DatabaseUrl = Read-Host "Ingresa la DATABASE_URL de produccion (PostgreSQL de Neon, Supabase, Render o VPS)"
}

if (-not $DatabaseUrl) {
  Write-Error "Se requiere una DATABASE_URL valida."
  exit 1
}

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  LUXE WOMAN - MIGRACION DE PRODUCCION" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Conectando a la base de datos remota..." -ForegroundColor Yellow

$env:DATABASE_URL = $DatabaseUrl

# 1. Generar cliente Prisma
Write-Host "`n1. Generando cliente Prisma..." -ForegroundColor Cyan
Push-Location (Join-Path $workspaceRoot 'apps/api')
try {
  & npx prisma generate
  if ($LASTEXITCODE -ne 0) { throw "Fallo la generacion de Prisma." }

  # 2. Aplicar migraciones
  Write-Host "`n2. Aplicando migraciones pendientes (prisma migrate deploy)..." -ForegroundColor Cyan
  & npx prisma migrate deploy
  if ($LASTEXITCODE -ne 0) { throw "Fallo la aplicacion de migraciones." }
  Write-Host "✓ Migraciones aplicadas con exito." -ForegroundColor Green

  # 3. Opcional: Aprovisionar administrador
  if ($AdminEmail -and $AdminPassword) {
    Write-Host "`n3. Creando usuario administrador inicial ($AdminEmail)..." -ForegroundColor Cyan
    $env:SEED_ADMIN_EMAIL = $AdminEmail
    $env:SEED_ADMIN_PASSWORD = $AdminPassword
    $env:NODE_ENV = "development" # Permite ejecutar el script de seed
    & npx tsx prisma/seed.ts
    Write-Host "✓ Usuario administrador aprovisionado." -ForegroundColor Green
  } elseif ($SeedCategoriesAndProducts) {
    Write-Host "`n3. Cargando categorias y catalogo base..." -ForegroundColor Cyan
    $env:NODE_ENV = "development"
    & npx tsx prisma/seed.ts
    Write-Host "✓ Catalogo base cargado." -ForegroundColor Green
  }
}
finally {
  Pop-Location
}

Write-Host "`n=========================================" -ForegroundColor Green
Write-Host "  BASE DE DATOS LISTA PARA PRODUCCION" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host "Siguiente paso: Desplegar el Backend API (Render/Railway) y Frontend (Vercel)." -ForegroundColor White
