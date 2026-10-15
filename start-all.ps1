# Student Placement Segregation - One-Click Launcher for Windows
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   Student Placement Segregation System - Full Stack Start" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan

$RootPath = Split-Path -Parent $MyInvocation.MyCommand.Path

# 1. Start Backend in new process
Write-Host "[1/2] Launching Backend (FastAPI on http://127.0.0.1:8000)..." -ForegroundColor Yellow
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd '$RootPath\backend'; & '.\venv\Scripts\python.exe' -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"

# 2. Start Frontend in new process
Write-Host "[2/2] Launching Frontend (Vite on http://localhost:5173)..." -ForegroundColor Yellow
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd '$RootPath\frontend'; npm run dev"

Write-Host "`n✓ Both services launched successfully!" -ForegroundColor Green
Write-Host "  Backend API:  http://127.0.0.1:8000/docs" -ForegroundColor Cyan
Write-Host "  Frontend App: http://localhost:5173" -ForegroundColor Cyan
