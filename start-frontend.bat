@echo off
echo ========================================================
echo Starting Student Placement Segregation Frontend (Vite)
echo ========================================================
cd /d "%~dp0frontend"

echo Starting Vite Dev Server on http://localhost:5173 ...
call npm run dev
pause
