$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$backendDir = Join-Path $projectRoot "SAT\backend"
$frontendDir = Join-Path $projectRoot "SAT\frontend"
$pythonPath = Join-Path $backendDir "venv\Scripts\python.exe"
$vitePath = Join-Path $frontendDir "node_modules\vite\bin\vite.js"
$nodePath = (Get-Command node.exe -ErrorAction Stop).Source
$cloudflaredPath = (Get-Command cloudflared.exe -ErrorAction SilentlyContinue).Source
if (-not $cloudflaredPath) {
    $cloudflaredPath = "C:\Program Files (x86)\cloudflared\cloudflared.exe"
}

foreach ($requiredPath in @($pythonPath, $vitePath, $cloudflaredPath)) {
    if (-not (Test-Path -LiteralPath $requiredPath)) {
        throw "Required program was not found: $requiredPath"
    }
}

$busyPorts = @(8000, 5173) | Where-Object {
    Get-NetTCPConnection -State Listen -LocalPort $_ -ErrorAction SilentlyContinue
}
if ($busyPorts.Count -gt 0) {
    throw "Port(s) $($busyPorts -join ', ') are already in use. Run stop-cloudflare-demo.ps1 first."
}

$runtimeDir = Join-Path $env:LOCALAPPDATA "Temp\sat-project-cloudflare"
New-Item -ItemType Directory -Force -Path $runtimeDir | Out-Null
$statePath = Join-Path $runtimeDir "state.json"
$sessionDir = Join-Path $runtimeDir (Get-Date -Format "yyyyMMdd-HHmmss-fff")
New-Item -ItemType Directory -Force -Path $sessionDir | Out-Null
$backendOut = Join-Path $sessionDir "backend.out.log"
$backendErr = Join-Path $sessionDir "backend.err.log"
$frontendOut = Join-Path $sessionDir "frontend.out.log"
$frontendErr = Join-Path $sessionDir "frontend.err.log"
$tunnelOut = Join-Path $sessionDir "cloudflared.out.log"
$tunnelErr = Join-Path $sessionDir "cloudflared.err.log"
Remove-Item -LiteralPath $statePath -Force -ErrorAction SilentlyContinue

$started = @()
try {
    $backend = Start-Process -FilePath $pythonPath `
        -ArgumentList @("-m", "uvicorn", "main:app", "--host", "127.0.0.1", "--port", "8000") `
        -WorkingDirectory $backendDir -WindowStyle Hidden `
        -RedirectStandardOutput $backendOut -RedirectStandardError $backendErr -PassThru
    $started += $backend

    $backendReady = $false
    for ($attempt = 0; $attempt -lt 120; $attempt++) {
        Start-Sleep -Seconds 1
        try {
            $health = Invoke-RestMethod -Uri "http://127.0.0.1:8000/health" -TimeoutSec 3
            if ($health.status -eq "ok") {
                $backendReady = $true
                break
            }
        } catch {}
        if ($backend.HasExited) {
            throw "Backend stopped during startup. See $backendErr"
        }
    }
    if (-not $backendReady) {
        throw "Backend did not become ready within 120 seconds. See $backendErr"
    }

    $tunnel = Start-Process -FilePath $cloudflaredPath `
        -ArgumentList @("tunnel", "--url", "http://127.0.0.1:5173", "--no-autoupdate") `
        -WorkingDirectory $projectRoot -WindowStyle Hidden `
        -RedirectStandardOutput $tunnelOut -RedirectStandardError $tunnelErr -PassThru
    $started += $tunnel

    $publicUrl = $null
    for ($attempt = 0; $attempt -lt 45; $attempt++) {
        Start-Sleep -Seconds 1
        $tunnelLog = Get-Content -LiteralPath $tunnelErr -Raw -ErrorAction SilentlyContinue
        $match = [regex]::Match($tunnelLog, "https://[a-z0-9-]+\.trycloudflare\.com")
        if ($match.Success) {
            $publicUrl = $match.Value
            break
        }
        if ($tunnel.HasExited) {
            throw "Cloudflare Tunnel stopped during startup. See $tunnelErr"
        }
    }
    if (-not $publicUrl) {
        throw "Cloudflare did not provide a public URL within 45 seconds. See $tunnelErr"
    }

    $publicHost = ([uri]$publicUrl).Host
    $previousAllowedHost = $env:__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS
    $env:__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS = $publicHost
    try {
        $frontend = Start-Process -FilePath $nodePath `
            -ArgumentList @($vitePath, "--host", "127.0.0.1", "--port", "5173", "--strictPort") `
            -WorkingDirectory $frontendDir -WindowStyle Hidden `
            -RedirectStandardOutput $frontendOut -RedirectStandardError $frontendErr -PassThru
    } finally {
        if ($null -eq $previousAllowedHost) {
            Remove-Item Env:\__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS -ErrorAction SilentlyContinue
        } else {
            $env:__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS = $previousAllowedHost
        }
    }
    $started += $frontend

    $frontendReady = $false
    for ($attempt = 0; $attempt -lt 30; $attempt++) {
        Start-Sleep -Seconds 1
        try {
            $page = Invoke-WebRequest -Uri $publicUrl -UseBasicParsing -TimeoutSec 5
            if ($page.StatusCode -eq 200) {
                $frontendReady = $true
                break
            }
        } catch {}
        if ($frontend.HasExited) {
            throw "Frontend stopped during startup. See $frontendErr"
        }
    }
    if (-not $frontendReady) {
        throw "Public website did not become ready within 30 seconds. See $frontendErr"
    }

    $state = [ordered]@{
        publicUrl = $publicUrl
        startedAt = (Get-Date).ToUniversalTime().ToString("o")
        logDirectory = $sessionDir
        processes = @(
            [ordered]@{ name = "backend"; id = $backend.Id; startedAt = $backend.StartTime.ToUniversalTime().ToString("o") }
            [ordered]@{ name = "cloudflared"; id = $tunnel.Id; startedAt = $tunnel.StartTime.ToUniversalTime().ToString("o") }
            [ordered]@{ name = "frontend"; id = $frontend.Id; startedAt = $frontend.StartTime.ToUniversalTime().ToString("o") }
        )
    }
    $state | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath $statePath -Encoding UTF8

    Write-Host ""
    Write-Host "SAT website is ready:" -ForegroundColor Green
    Write-Host $publicUrl -ForegroundColor Cyan
    Write-Host "Keep this computer awake and connected to the internet."
    Write-Host "Run scripts\stop-cloudflare-demo.ps1 to stop sharing."
} catch {
    foreach ($process in $started) {
        if (-not $process.HasExited) {
            Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
        }
    }
    throw
}
