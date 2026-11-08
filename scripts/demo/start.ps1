param([int]$Port = 8789)
$ErrorActionPreference = 'Stop'
$taskRoot = (Resolve-Path (Join-Path $PSScriptRoot '../..')).Path
$taskParent = Join-Path $taskRoot 'storage/shared-demo'
$taskCloudflared = Join-Path $taskRoot 'storage/tools/cloudflared.exe'
if (-not (Test-Path -LiteralPath $taskCloudflared)) { throw 'cloudflared belum tersedia. Baca docs/shared-demo.md untuk sumber unduhan resmi.' }
if ((Get-AuthenticodeSignature -LiteralPath $taskCloudflared).Status -ne 'Valid') { throw 'Tanda tangan alat tunnel tidak valid.' }
& (Join-Path $taskRoot 'scripts/php.ps1') (Join-Path $PSScriptRoot 'prepare.php')
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
$taskPidFile = Join-Path $taskParent 'processes.json'
if (Test-Path -LiteralPath $taskPidFile) {
    $taskOld = Get-Content -LiteralPath $taskPidFile -Raw | ConvertFrom-Json
    if (Get-Process -Id $taskOld.server -ErrorAction SilentlyContinue) { throw 'Server uji masih aktif; hentikan dengan scripts/demo/stop.ps1 sebelum menjalankan kembali.' }
}
$taskServer = Start-Process -FilePath (Get-Command pwsh).Source -ArgumentList @('-NoProfile', '-File', ('"' + (Join-Path $PSScriptRoot 'server.ps1') + '"'), '-Port', $Port) -WorkingDirectory $taskRoot -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $taskParent 'server.log') -RedirectStandardError (Join-Path $taskParent 'server-error.log')
@{ server = $taskServer.Id; serverStarted = $taskServer.StartTime.ToUniversalTime().ToString('o'); tunnel = $null } | ConvertTo-Json | Set-Content -LiteralPath $taskPidFile
$taskReady = $false
for ($taskAttempt = 0; $taskAttempt -lt 25; $taskAttempt++) {
    if ($taskServer.HasExited) { throw 'Server uji berhenti. Periksa server-error.log.' }
    try { $taskResponse = Invoke-WebRequest -Uri "http://127.0.0.1:$Port/up" -TimeoutSec 2; if ($taskResponse.StatusCode -eq 200) { $taskReady = $true; break } } catch { }
    Start-Sleep -Milliseconds 400
}
if (-not $taskReady) { throw 'Server uji belum siap. Periksa log sebelum memulai tunnel.' }
$taskTunnel = Start-Process -FilePath $taskCloudflared -ArgumentList @('tunnel', '--url', "http://127.0.0.1:$Port", '--protocol', 'http2', '--no-autoupdate', '--metrics', '127.0.0.1:20242') -WorkingDirectory $taskRoot -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $taskParent 'tunnel.log') -RedirectStandardError (Join-Path $taskParent 'tunnel-error.log')
@{ server = $taskServer.Id; serverStarted = $taskServer.StartTime.ToUniversalTime().ToString('o'); tunnel = $taskTunnel.Id; tunnelStarted = $taskTunnel.StartTime.ToUniversalTime().ToString('o') } | ConvertTo-Json | Set-Content -LiteralPath $taskPidFile
for ($taskAttempt = 0; $taskAttempt -lt 40; $taskAttempt++) {
    $taskLogPath = Join-Path $taskParent 'tunnel-error.log'
    $taskLog = if (Test-Path -LiteralPath $taskLogPath) { @(Get-Content -LiteralPath $taskLogPath -ErrorAction SilentlyContinue) -join [Environment]::NewLine } else { '' }
    if ([string]::IsNullOrEmpty($taskLog)) { Start-Sleep -Milliseconds 500; continue }
    $taskMatch = [regex]::Match($taskLog, 'https://[a-z0-9-]+\.trycloudflare\.com')
    if ($taskMatch.Success) {
        Set-Content -LiteralPath (Join-Path $taskParent 'url.txt') -Value $taskMatch.Value
        Write-Output $taskMatch.Value
        exit 0
    }
    if ($taskTunnel.HasExited) { throw 'Tunnel berhenti. Periksa tunnel-error.log.' }
    Start-Sleep -Milliseconds 500
}
throw 'Tunnel belum memberikan URL. Periksa log; jangan menganggap link sudah tersedia.'
