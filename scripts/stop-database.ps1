param([string]$PostgresBin = 'C:\Program Files\PostgreSQL\18\bin')

$ErrorActionPreference = 'Stop'
$workspaceRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$dataDirectory = Join-Path $workspaceRoot '.local\postgres'
$pgControl = Join-Path $PostgresBin 'pg_ctl.exe'
if (-not (Test-Path -LiteralPath (Join-Path $dataDirectory 'PG_VERSION'))) {
  Write-Output 'There is no initialized project database.'
  exit 0
}
& $pgControl status -D $dataDirectory 2>$null | Out-Null
if ($LASTEXITCODE -ne 0) {
  Write-Output 'The project database is already stopped.'
  exit 0
}
$arguments = @('-D', ('"' + $dataDirectory + '"'), '-m', 'fast', '-w', 'stop')
$process = Start-Process -FilePath $pgControl -ArgumentList $arguments -WindowStyle Hidden -PassThru
$process.WaitForExit()
if ($process.ExitCode -ne 0) { throw 'Could not stop the project database.' }
Write-Output 'Project database stopped. System database services were not changed.'
