@echo off
cd /d "%~dp0"
echo ===================================================
echo [LIFEIFY] Syncing all changes to GitHub...
echo ===================================================
git add .
git commit -m "chore: sync latest updates"
git push origin main
echo.
echo ===================================================
echo [LIFEIFY] Successfully synced to GitHub!
echo Repository: https://github.com/OMM-PRIYANSHU-PATI/lifeify
echo ===================================================
pause
