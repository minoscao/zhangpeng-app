$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$publicDir = Join-Path $projectRoot 'cloudflare\public'
$studioDir = Join-Path $publicDir 'assets\studio'

New-Item -ItemType Directory -Force -Path $publicDir, $studioDir | Out-Null

Copy-Item -LiteralPath (Join-Path $projectRoot 'app\index.html') -Destination (Join-Path $publicDir 'index.html') -Force
Copy-Item -LiteralPath (Join-Path $projectRoot 'app\styles.css') -Destination (Join-Path $publicDir 'styles.css') -Force
Copy-Item -LiteralPath (Join-Path $projectRoot 'app\app.js') -Destination (Join-Path $publicDir 'app.js') -Force
Copy-Item -LiteralPath (Join-Path $projectRoot 'assets\studio\tent-hero.png') -Destination (Join-Path $studioDir 'tent-hero.png') -Force
Copy-Item -LiteralPath (Join-Path $projectRoot 'assets\studio\tent-variant-a.png') -Destination (Join-Path $studioDir 'tent-variant-a.png') -Force
Copy-Item -LiteralPath (Join-Path $projectRoot 'assets\studio\tent-variant-b.png') -Destination (Join-Path $studioDir 'tent-variant-b.png') -Force

Write-Host "Cloudflare 静态资源已准备：$publicDir"
