# Run from project folder — works when "node" is not on PATH (e.g. Cursor terminal)
Set-Location $PSScriptRoot
$node = Join-Path ${env:ProgramFiles} "nodejs\node.exe"
if (-not (Test-Path $node)) {
    Write-Host "Node.js not found at $node — install from https://nodejs.org" -ForegroundColor Red
    exit 1
}
Write-Host "Starting http://localhost:3000 — press Ctrl+C to stop`n" -ForegroundColor Green
& $node server.js
