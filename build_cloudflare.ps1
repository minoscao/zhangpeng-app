$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$publicDir = Join-Path $projectRoot 'cloudflare\public'
$appDir = Join-Path $projectRoot 'app'

New-Item -ItemType Directory -Force -Path $publicDir | Out-Null

foreach ($file in 'index.html', 'styles.css', 'core.js', 'export.js', 'app-v2.js') {
    Copy-Item -LiteralPath (Join-Path $appDir $file) -Destination (Join-Path $publicDir $file) -Force
}
$obsoleteClient = Join-Path $publicDir 'app.js'
if (Test-Path -LiteralPath $obsoleteClient) {
    Remove-Item -LiteralPath $obsoleteClient -Force
}
$assetDir = Join-Path $publicDir 'assets'
New-Item -ItemType Directory -Force -Path $assetDir | Out-Null
Copy-Item -Path (Join-Path $appDir 'assets\*') -Destination $assetDir -Recurse -Force

Write-Host "Cloudflare 静态资源已准备：$publicDir"
