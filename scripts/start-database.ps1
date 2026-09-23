param(
  [string]$PostgresBin = 'C:\Program Files\PostgreSQL\18\bin',
  [int]$Port = 5433
)

$ErrorActionPreference = 'Stop'
$workspaceRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$localDirectory = Join-Path $workspaceRoot '.local'
$dataDirectory = Join-Path $localDirectory 'postgres'
$envFile = Join-Path $workspaceRoot '.env'
$pgControl = Join-Path $PostgresBin 'pg_ctl.exe'
$initDatabase = Join-Path $PostgresBin 'initdb.exe'
$sqlClient = Join-Path $PostgresBin 'psql.exe'

if (-not (Test-Path -LiteralPath $pgControl)) {
  throw "PostgreSQL binaries not found at $PostgresBin. Pass -PostgresBin or use Docker Compose."
}
if ($Port -eq 5432) {
  throw 'This script reserves a separate cluster. Use a port other than 5432.'
}
New-Item -ItemType Directory -Path $localDirectory -Force | Out-Null

function New-LocalSecret {
  $bytes = New-Object byte[] 48
  $generator = [Security.Cryptography.RandomNumberGenerator]::Create()
  try { $generator.GetBytes($bytes) } finally { $generator.Dispose() }
  return ([Convert]::ToBase64String($bytes) -replace '[+/=]', '')
}

$existingEnvironment = @{}
if (Test-Path -LiteralPath $envFile) {
  foreach ($line in [IO.File]::ReadAllLines($envFile)) {
    if ($line -match '^([A-Z][A-Z0-9_]*)=(.*)$') {
      $existingEnvironment[$matches[1]] = $matches[2].Trim('"')
    }
  }
}

$alreadyRunning = $false
if (Test-Path -LiteralPath (Join-Path $dataDirectory 'PG_VERSION')) {
  & $pgControl status -D $dataDirectory 2>$null | Out-Null
  if ($LASTEXITCODE -eq 0) {
    $alreadyRunning = $true
  }
}

$listener = Get-NetTCPConnection -State Listen -LocalPort $Port -ErrorAction SilentlyContinue
if ($listener -and -not $alreadyRunning) {
  throw "Port $Port is already in use. This script will not touch the existing service."
}

if (-not (Test-Path -LiteralPath (Join-Path $dataDirectory 'PG_VERSION'))) {
  if ($existingEnvironment.ContainsKey('DATABASE_URL')) {
    throw 'An existing .env DATABASE_URL was found without a local database. Preserve it and configure the database manually, or move that file before local initialization.'
  }
  $databasePassword = New-LocalSecret
  $passwordFile = [IO.Path]::GetFullPath((Join-Path $localDirectory 'initdb-password.tmp'))
  if (-not $passwordFile.StartsWith($localDirectory + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) {
    throw 'Invalid temporary password path.'
  }
  try {
    [IO.File]::WriteAllText($passwordFile, $databasePassword, (New-Object Text.UTF8Encoding($false)))
    & $initDatabase -D $dataDirectory -U luxe --auth=scram-sha-256 --encoding=UTF8 --locale=C --pwfile=$passwordFile
    if ($LASTEXITCODE -ne 0) { throw 'PostgreSQL initialization failed.' }
  } finally {
    if (Test-Path -LiteralPath $passwordFile) { Remove-Item -LiteralPath $passwordFile -Force }
  }
  $configuration = "`n# Workspace-local database. Never binds external interfaces.`nlisten_addresses = '127.0.0.1'`nport = $Port`n"
  [IO.File]::AppendAllText((Join-Path $dataDirectory 'postgresql.conf'), $configuration)
  $environmentLines = @(
    '# Local development only. Generated secrets; never commit this file.',
    "DATABASE_URL=postgresql://luxe:$databasePassword@127.0.0.1:$Port/luxe_woman?schema=public",
    'APP_URL=http://localhost:3000',
    'API_URL=http://127.0.0.1:4000',
    'NEXT_PUBLIC_APP_URL=http://localhost:3000',
    'API_PORT=4000',
    'PRIVATE_STORAGE_PATH=../../.local/uploads',
    'SEED_ADMIN_EMAIL=admin@luxewoman.local',
    ('SEED_ADMIN_PASSWORD=' + (New-LocalSecret)),
    'DEMO_MODE=true',
    'SMTP_FROM=LUXE WOMAN <no-reply@localhost>',
    'GOOGLE_CLIENT_ID=',
    'GOOGLE_CLIENT_SECRET='
  )
  if (Test-Path -LiteralPath $envFile) {
    [IO.File]::AppendAllText($envFile, "`n" + ($environmentLines -join "`n") + "`n", (New-Object Text.UTF8Encoding($false)))
  } else {
    [IO.File]::WriteAllText($envFile, ($environmentLines -join "`n") + "`n", (New-Object Text.UTF8Encoding($false)))
  }
  $existingEnvironment['DATABASE_URL'] = "postgresql://luxe:$databasePassword@127.0.0.1:$Port/luxe_woman?schema=public"
}

if (-not $alreadyRunning) {
  $startArguments = @('-D', ('"' + $dataDirectory + '"'), '-l', ('"' + (Join-Path $localDirectory 'postgres.log') + '"'), '-w', 'start')
  $process = Start-Process -FilePath $pgControl -ArgumentList $startArguments -WindowStyle Hidden -PassThru
  $process.WaitForExit()
  if ($process.ExitCode -ne 0) { throw "PostgreSQL failed to start. Inspect $localDirectory\postgres.log." }
}

$databaseUri = [Uri]$existingEnvironment['DATABASE_URL']
$env:PGPASSWORD = [Uri]::UnescapeDataString(($databaseUri.UserInfo -split ':', 2)[1])
try {
  $databaseExists = & $sqlClient -h 127.0.0.1 -p $Port -U luxe -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='luxe_woman'"
  if ($LASTEXITCODE -ne 0) { throw 'Failed to connect to the isolated database.' }
  if (([string]$databaseExists).Trim() -ne '1') {
    & $sqlClient -h 127.0.0.1 -p $Port -U luxe -d postgres -v ON_ERROR_STOP=1 -c 'CREATE DATABASE luxe_woman'
    if ($LASTEXITCODE -ne 0) { throw 'Failed to create luxe_woman database.' }
  }
} finally { Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue }
Write-Output "Database ready at 127.0.0.1:$Port. Credentials are in the ignored .env file."
