$ErrorActionPreference = "Stop"

$runtimeDir = Join-Path $env:LOCALAPPDATA "Temp\sat-project-cloudflare"
$statePath = Join-Path $runtimeDir "state.json"
if (-not (Test-Path -LiteralPath $statePath)) {
    Write-Host "No SAT Cloudflare session is recorded."
    exit 0
}

$state = Get-Content -LiteralPath $statePath -Raw | ConvertFrom-Json
foreach ($saved in @($state.processes)) {
    $process = Get-Process -Id $saved.id -ErrorAction SilentlyContinue
    if (-not $process) {
        continue
    }

    $actualStart = $process.StartTime.ToUniversalTime()
    $savedStart = [datetime]::Parse($saved.startedAt).ToUniversalTime()
    if ([math]::Abs(($actualStart - $savedStart).TotalSeconds) -gt 5) {
        Write-Warning "Skipped PID $($saved.id): it has been reused by another process."
        continue
    }
    Stop-Process -Id $process.Id -Force
    Write-Host "Stopped $($saved.name)."
}

Remove-Item -LiteralPath $statePath -Force
Write-Host "SAT Cloudflare sharing is stopped." -ForegroundColor Green
