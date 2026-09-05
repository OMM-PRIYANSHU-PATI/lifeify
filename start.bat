@echo off
cd /d "%~dp0"
echo ===================================================
echo [LIFEIFY] Starting Personal Health OS...
echo URL: http://localhost:3000
echo ===================================================
timeout /t 2 /nobreak >nul
start http://localhost:3000
npm run dev
