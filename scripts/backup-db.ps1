<#
.SYNOPSIS
  Genera un respaldo (.sql) completo de la base de datos PostgreSQL remota (Supabase, Neon, etc.) o local.
.EXAMPLE
  powershell -ExecutionPolicy Bypass -File scripts/backup-db.ps1
#>
param(
  [Parameter(Mandatory=$false)]
  [string]$DatabaseUrl
)

$ErrorActionPreference = 'Stop'
$workspaceRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))

if (-not $DatabaseUrl) {
  # Intentar leer DATABASE_URL del archivo .env
  $envPath = Join-Path $workspaceRoot '.env'
  if (Test-Path $envPath) {
    $match = Get-Content $envPath | Where-Object { $_ -match '^DATABASE_URL\s*=\s*(.+)$' }
    if ($match) {
      $DatabaseUrl = $matches[1].Trim('"').Trim("'")
    }
  }
}

if (-not $DatabaseUrl) {
  $DatabaseUrl = Read-Host "Ingresa la DATABASE_URL de la que deseas hacer el backup"
}

if (-not $DatabaseUrl) {
  Write-Error "Se requiere una DATABASE_URL valida."
  exit 1
}

$backupsDir = Join-Path $workspaceRoot 'backups'
if (-not (Test-Path $backupsDir)) {
  New-Item -ItemType Directory -Path $backupsDir | Out-Null
}

$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$backupFile = Join-Path $backupsDir "luxe_woman_backup_$timestamp.sql"

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  LUXE WOMAN - RESPALDO DE BASE DE DATOS" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Conectando y exportando datos..." -ForegroundColor Yellow

try {
  & pg_dump --clean --if-exists --no-owner --no-privileges "$DatabaseUrl" -f "$backupFile"
  if ($LASTEXITCODE -ne 0) {
    throw "pg_dump fallo con codigo de salida $LASTEXITCODE"
  }
  Write-Host "✓ Respaldo completado exitosamente:" -ForegroundColor Green
  Write-Host "  $backupFile" -ForegroundColor White
}
catch {
  Write-Warning "Si pg_dump no esta en el PATH del sistema, puedes usar la herramienta de exportacion directa desde el panel de Supabase."
  Write-Error $_.Exception.Message
}
