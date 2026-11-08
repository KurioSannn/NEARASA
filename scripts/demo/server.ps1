param([int]$Port = 8789)
$ErrorActionPreference = 'Stop'
$taskRoot = (Resolve-Path (Join-Path $PSScriptRoot '../..')).Path
$taskParent = [IO.Path]::GetFullPath((Join-Path $taskRoot 'storage/shared-demo'))
$taskConfig = Get-Content -LiteralPath (Join-Path $taskParent 'active.json') -Raw | ConvertFrom-Json
foreach ($taskPath in @($taskConfig.storage, $taskConfig.database)) {
    if (-not [IO.Path]::GetFullPath($taskPath).StartsWith($taskParent + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) { throw 'Lokasi uji berada di luar folder yang diizinkan.' }
}
$env:LARAVEL_STORAGE_PATH = $taskConfig.storage
$env:DB_DATABASE = $taskConfig.database
$env:APP_KEY = $taskConfig.key
$env:APP_ENV = 'demo'
$env:APP_DEBUG = 'false'
$env:APP_CONFIG_CACHE = Join-Path $taskConfig.storage 'framework/cache/demo-config.php'
$env:APP_ROUTES_CACHE = Join-Path $taskConfig.storage 'framework/cache/demo-routes.php'
$env:APP_URL = "http://127.0.0.1:$Port"
$env:NEARASA_DEMO_AUTH = 'false'
$env:SESSION_DRIVER = 'file'
$env:SESSION_COOKIE = 'nearasa_shared_session'
$env:SESSION_SECURE_COOKIE = 'true'
$env:SESSION_DOMAIN = ''
$env:CACHE_STORE = 'file'
$env:LOG_LEVEL = 'error'
$taskWrapper = Join-Path $taskRoot 'scripts/php.ps1'
Push-Location $taskRoot
try {
    & $taskWrapper artisan migrate --force
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    if (-not (Test-Path -LiteralPath (Join-Path $taskParent 'accounts.json'))) {
        & $taskWrapper artisan db:seed --class=CatalogSeeder --force
        if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    }
    & $taskWrapper (Join-Path $PSScriptRoot 'seed.php')
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    & $taskWrapper artisan serve --host=127.0.0.1 "--port=$Port"
    exit $LASTEXITCODE
} finally { Pop-Location }
