@echo off
echo ========================================================
echo Starting Student Placement Segregation Backend (FastAPI)
echo ========================================================
cd /d "%~dp0backend"

if not exist "venv\Scripts\python.exe" (
    echo Error: Python virtual environment not found in backend\venv.
    pause
    exit /b 1
)

echo Starting Uvicorn Server on http://127.0.0.1:8000 ...
"venv\Scripts\python.exe" -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
pause
