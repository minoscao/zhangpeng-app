$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$bundledPython = 'C:\Users\Altair\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe'

if (Test-Path -LiteralPath $bundledPython) {
    & $bundledPython (Join-Path $projectRoot 'server.py')
} elseif (Get-Command python -ErrorAction SilentlyContinue) {
    python (Join-Path $projectRoot 'server.py')
} elseif (Get-Command py -ErrorAction SilentlyContinue) {
    py -3 (Join-Path $projectRoot 'server.py')
} else {
    Write-Error '未找到 Python 3。请安装 Python 3.10 或更高版本后重试。'
}
