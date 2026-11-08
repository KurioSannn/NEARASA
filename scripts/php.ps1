param([Parameter(ValueFromRemainingArguments = $true)][string[]]$PhpArguments)
$ErrorActionPreference = 'Stop'
$taskPhp = if ($env:NEARASA_PHP) { $env:NEARASA_PHP } else { 'C:\laragon\bin\php\php-8.4.25-Win32-vs17-x64\php.exe' }
if (-not (Test-Path -LiteralPath $taskPhp)) { throw 'PHP tidak ditemukan. Atur NEARASA_PHP ke path php.exe.' }
$env:PHP_INI_SCAN_DIR = Join-Path $PSScriptRoot 'php-config'
Push-Location (Split-Path $PSScriptRoot -Parent)
try { & $taskPhp @PhpArguments; $taskCode = $LASTEXITCODE } finally { Pop-Location }
exit $taskCode
