$ErrorActionPreference = 'Stop'
$workspaceRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
powershell -NoProfile -ExecutionPolicy Bypass -File "$workspaceRoot\scripts\start-database.ps1"
npm.cmd run dev
