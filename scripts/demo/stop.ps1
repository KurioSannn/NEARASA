$ErrorActionPreference = 'Stop'
$taskRoot = (Resolve-Path (Join-Path $PSScriptRoot '../..')).Path
$taskPidFile = Join-Path $taskRoot 'storage/shared-demo/processes.json'
if (-not (Test-Path -LiteralPath $taskPidFile)) { Write-Output 'Tidak ada proses uji tercatat.'; exit 0 }
$taskPids = Get-Content -LiteralPath $taskPidFile -Raw | ConvertFrom-Json
foreach ($taskRole in @('tunnel', 'server')) {
    if (-not $taskPids.$taskRole) { continue }
    $taskProcess = Get-Process -Id $taskPids.$taskRole -ErrorAction SilentlyContinue
    $taskStarted = $taskPids.($taskRole + 'Started')
    if ($taskProcess -and $taskStarted -and $taskProcess.StartTime.ToUniversalTime().Ticks -eq ([DateTimeOffset]$taskStarted).UtcTicks) {
        $taskChildren = Get-CimInstance Win32_Process -Filter "ParentProcessId=$($taskProcess.Id)"
        foreach ($taskChild in $taskChildren) {
            if ($taskChild.Name -match '^(php|pwsh|powershell)(\.exe)?$') {
                Get-CimInstance Win32_Process -Filter "ParentProcessId=$($taskChild.ProcessId)" | Where-Object Name -EQ 'php.exe' | ForEach-Object { Stop-Process -Id $_.ProcessId -ErrorAction SilentlyContinue }
                Stop-Process -Id $taskChild.ProcessId -ErrorAction SilentlyContinue
            }
        }
        Stop-Process -Id $taskProcess.Id -ErrorAction SilentlyContinue
    }
}
Remove-Item -LiteralPath $taskPidFile
Write-Output 'Proses uji dihentikan. Data contoh dan akun tetap disimpan.'
