$env:Path = "C:\Users\aurel\.gemini\antigravity\scratch\tools\node;C:\Users\aurel\.gemini\antigravity\scratch\tools\git\cmd;" + $env:Path
Set-Location $PSScriptRoot
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "  Lancement de EPITA SmartScan (Serveur Dev Vite)  " -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Cyan
npm run dev
