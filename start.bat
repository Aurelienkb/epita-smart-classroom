@echo off
set "PATH=C:\Users\aurel\.gemini\antigravity\scratch\tools\node;C:\Users\aurel\.gemini\antigravity\scratch\tools\git\cmd;%PATH%"
cd /d "%~dp0"
echo ===================================================
echo   Lancement de EPITA SmartScan (Serveur Dev Vite)
echo ===================================================
npm run dev
pause
