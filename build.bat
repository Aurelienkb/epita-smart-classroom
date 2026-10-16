@echo off
set "PATH=C:\Users\aurel\.gemini\antigravity\scratch\tools\node;C:\Users\aurel\.gemini\antigravity\scratch\tools\git\cmd;%PATH%"
cd /d "%~dp0"
echo ===================================================
echo   Compilation de production (Build dist)
echo ===================================================
npm run build
echo ===================================================
echo   Build termine avec succes dans le dossier dist/ !
echo ===================================================
pause
