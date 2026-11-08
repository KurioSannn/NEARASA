param([int]$Port = 8787)
& (Join-Path $PSScriptRoot 'php.ps1') artisan serve --host=127.0.0.1 "--port=$Port"
exit $LASTEXITCODE
