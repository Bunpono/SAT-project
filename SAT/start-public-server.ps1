[CmdletBinding()]
param(
    [int]$StartupTimeoutSeconds = 180
)

$ErrorActionPreference = "Stop"

$satRoot = $PSScriptRoot
$backendDir = Join-Path $satRoot "backend"
$frontendDir = Join-Path $satRoot "frontend"
$venvPythonExe = Join-Path $backendDir "venv\Scripts\python.exe"
$venvConfig = Join-Path $backendDir "venv\pyvenv.cfg"
$viteEntry = Join-Path $frontendDir "node_modules\vite\bin\vite.js"
$statePath = Join-Path $satRoot ".sat-public-server-state.json"
$logDir = Join-Path $satRoot ".server-logs"

function Wait-Until {
    param(
        [scriptblock]$Condition,
        [string]$FailureMessage
    )

    $deadline = (Get-Date).AddSeconds($StartupTimeoutSeconds)
    while ((Get-Date) -lt $deadline) {
        if (& $Condition) {
            return
        }
        Start-Sleep -Seconds 2
    }
    throw $FailureMessage
}

function Stop-StartedProcesses {
    param([System.Collections.Generic.List[System.Diagnostics.Process]]$Processes)

    foreach ($process in $Processes) {
        if ($process -and -not $process.HasExited) {
            Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
        }
    }
}

if (Test-Path -LiteralPath $statePath) {
    throw "A server state already exists. Run stop-public-server.cmd before starting again."
}

if (-not (Test-Path -LiteralPath $venvPythonExe)) {
    throw "Python environment not found: $venvPythonExe. Run setup-local.cmd first."
}

$pythonExe = $venvPythonExe
if (Test-Path -LiteralPath $venvConfig) {
    $homeLine = Get-Content -LiteralPath $venvConfig | Where-Object { $_ -match '^home\s*=' } | Select-Object -First 1
    if ($homeLine) {
        $basePythonHome = ($homeLine -split '=', 2)[1].Trim()
        $basePythonExe = Join-Path $basePythonHome "python.exe"
        if (Test-Path -LiteralPath $basePythonExe) {
            $pythonExe = $basePythonExe
        }
    }
}

if (-not (Test-Path -LiteralPath $viteEntry)) {
    throw "Frontend dependencies not found. Run setup-local.cmd first."
}

$nodeExe = (Get-Command node.exe -ErrorAction Stop).Source
$cloudflaredExe = (Get-Command cloudflared.exe -ErrorAction Stop).Source

foreach ($port in 8000, 5173) {
    $portProbe = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $port)
    try {
        $portProbe.Start()
    }
    catch {
        throw "Port $port is already in use. Stop the existing server first."
    }
    finally {
        $portProbe.Stop()
    }
}

New-Item -ItemType Directory -Path $logDir -Force | Out-Null
$backendOut = Join-Path $logDir "backend.stdout.log"
$backendErr = Join-Path $logDir "backend.stderr.log"
$frontendOut = Join-Path $logDir "frontend.stdout.log"
$frontendErr = Join-Path $logDir "frontend.stderr.log"
$tunnelOut = Join-Path $logDir "cloudflared.stdout.log"
$tunnelErr = Join-Path $logDir "cloudflared.stderr.log"

Remove-Item -LiteralPath $backendOut, $backendErr, $frontendOut, $frontendErr, $tunnelOut, $tunnelErr -Force -ErrorAction SilentlyContinue

$startedProcesses = [System.Collections.Generic.List[System.Diagnostics.Process]]::new()

try {
    Write-Host "[1/4] Starting Backend and loading the P8 model..." -ForegroundColor Cyan
    $backendStart = @{
        FilePath = $pythonExe
        ArgumentList = @("-m", "uvicorn", "main:app", "--host", "127.0.0.1", "--port", "8000")
        WorkingDirectory = $backendDir
        RedirectStandardOutput = $backendOut
        RedirectStandardError = $backendErr
        WindowStyle = "Hidden"
        PassThru = $true
    }
    $backendProcess = Start-Process @backendStart
    $startedProcesses.Add($backendProcess)

    Wait-Until -FailureMessage "Backend did not start. Check $backendErr" -Condition {
        if ($backendProcess.HasExited) {
            throw "Backend exited before it became ready. Check $backendErr"
        }
        try {
            $health = Invoke-RestMethod -Uri "http://127.0.0.1:8000/health" -TimeoutSec 5
            return $health.status -eq "ok" -and $health.model.loaded
        }
        catch {
            return $false
        }
    }

    Write-Host "[2/4] Creating a Cloudflare Quick Tunnel..." -ForegroundColor Cyan
    $tunnelStart = @{
        FilePath = $cloudflaredExe
        ArgumentList = @("tunnel", "--url", "http://127.0.0.1:5173", "--no-autoupdate")
        WorkingDirectory = $satRoot
        RedirectStandardOutput = $tunnelOut
        RedirectStandardError = $tunnelErr
        WindowStyle = "Hidden"
        PassThru = $true
    }
    $tunnelProcess = Start-Process @tunnelStart
    $startedProcesses.Add($tunnelProcess)

    $publicUrl = $null
    Wait-Until -FailureMessage "Cloudflare Tunnel did not start. Check $tunnelErr" -Condition {
        if ($tunnelProcess.HasExited) {
            throw "Cloudflare Tunnel exited before creating a public URL. Check $tunnelErr"
        }
        $tunnelText = ""
        if (Test-Path -LiteralPath $tunnelOut) {
            $tunnelText += Get-Content -LiteralPath $tunnelOut -Raw -ErrorAction SilentlyContinue
        }
        if (Test-Path -LiteralPath $tunnelErr) {
            $tunnelText += Get-Content -LiteralPath $tunnelErr -Raw -ErrorAction SilentlyContinue
        }
        $match = [regex]::Match($tunnelText, "https://(?!api\.)[a-z0-9-]+\.trycloudflare\.com")
        if ($match.Success) {
            $script:publicUrl = $match.Value
            return $true
        }
        return $false
    }

    $publicHost = ([uri]$publicUrl).Host
    Write-Host "[3/4] Starting Frontend for host $publicHost..." -ForegroundColor Cyan
    $previousAllowedHost = $env:__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS
    try {
        $env:__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS = $publicHost
        $frontendStart = @{
            FilePath = $nodeExe
            ArgumentList = @($viteEntry, "--host", "127.0.0.1", "--port", "5173", "--strictPort")
            WorkingDirectory = $frontendDir
            RedirectStandardOutput = $frontendOut
            RedirectStandardError = $frontendErr
            WindowStyle = "Hidden"
            PassThru = $true
        }
        $frontendProcess = Start-Process @frontendStart
    }
    finally {
        $env:__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS = $previousAllowedHost
    }
    $startedProcesses.Add($frontendProcess)

    Wait-Until -FailureMessage "Frontend did not start. Check $frontendErr" -Condition {
        if ($frontendProcess.HasExited) {
            throw "Frontend exited before it became ready. Check $frontendErr"
        }
        try {
            $response = Invoke-WebRequest -Uri "http://127.0.0.1:5173" -UseBasicParsing -TimeoutSec 5
            return $response.StatusCode -eq 200
        }
        catch {
            return $false
        }
    }

    Write-Host "[4/4] Checking the public URL..." -ForegroundColor Cyan
    Wait-Until -FailureMessage "The tunnel exists, but the public website is not reachable. Check $tunnelErr" -Condition {
        try {
            $response = Invoke-WebRequest -Uri $publicUrl -UseBasicParsing -TimeoutSec 10
            return $response.StatusCode -eq 200
        }
        catch {
            return $false
        }
    }

    $state = [ordered]@{
        started_at = (Get-Date).ToString("o")
        public_url = $publicUrl
        backend_pid = $backendProcess.Id
        tunnel_pid = $tunnelProcess.Id
        frontend_pid = $frontendProcess.Id
        backend_log = $backendErr
        tunnel_log = $tunnelErr
        frontend_log = $frontendErr
    }
    $state | ConvertTo-Json | Set-Content -LiteralPath $statePath -Encoding UTF8

    Write-Host ""
    Write-Host "SAT public server started successfully." -ForegroundColor Green
    Write-Host "Public URL: $publicUrl" -ForegroundColor Yellow
    Write-Host "Keep this computer awake, connected to power, and online."
    Write-Host "To stop the server, double-click stop-public-server.cmd."
}
catch {
    Stop-StartedProcesses -Processes $startedProcesses
    Remove-Item -LiteralPath $statePath -Force -ErrorAction SilentlyContinue
    throw
}
