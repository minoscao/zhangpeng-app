$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$venvPython = Join-Path $projectRoot '.venv\Scripts\python.exe'
$outputDir = Join-Path $projectRoot 'dist'

if (-not (Test-Path -LiteralPath $venvPython)) {
    throw '缺少项目虚拟环境。请先安装构建依赖：.venv\Scripts\pip.exe install pyinstaller'
}

& $venvPython -m PyInstaller `
    --noconfirm `
    --clean `
    --onefile `
    --noconsole `
    --name 'DesignFlow Studio' `
    --icon (Join-Path $projectRoot 'assets\tentflow.ico') `
    --distpath $outputDir `
    --workpath (Join-Path $projectRoot 'build\pyinstaller') `
    --specpath (Join-Path $projectRoot 'build') `
    --add-data "$(Join-Path $projectRoot 'app');app" `
    --add-data "$(Join-Path $projectRoot 'assets');assets" `
    (Join-Path $projectRoot 'server.py')

if ($LASTEXITCODE -ne 0) {
    throw "PyInstaller 构建失败，退出码：$LASTEXITCODE"
}

Write-Host "构建完成：$(Join-Path $outputDir 'DesignFlow Studio.exe')"
