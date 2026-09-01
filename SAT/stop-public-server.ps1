[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"
$statePath = Join-Path $PSScriptRoot ".sat-public-server-state.json"

if (-not (Test-Path -LiteralPath $statePath)) {
    Write-Host "No server state created by start-public-server.cmd was found." -ForegroundColor Yellow
    exit 0
}

$state = Get-Content -LiteralPath $statePath -Raw | ConvertFrom-Json
$services = @(
    @{ Name = "Frontend"; ProcessId = [int]$state.frontend_pid; Expected = "node" },
    @{ Name = "Cloudflare Tunnel"; ProcessId = [int]$state.tunnel_pid; Expected = "cloudflared" },
    @{ Name = "Backend"; ProcessId = [int]$state.backend_pid; Expected = "python" }
)

foreach ($service in $services) {
    $process = Get-Process -Id $service.ProcessId -ErrorAction SilentlyContinue
    if (-not $process) {
        Write-Host "$($service.Name): already stopped"
        continue
    }

    if ($process.ProcessName -ne $service.Expected) {
        Write-Warning "PID $($service.ProcessId) was not stopped because its process name does not match $($service.Expected)."
        continue
    }

    Stop-Process -Id $service.ProcessId -Force
    Write-Host "$($service.Name): stopped" -ForegroundColor Green
}

Remove-Item -LiteralPath $statePath -Force
Write-Host "SAT public server stopped successfully." -ForegroundColor Green
