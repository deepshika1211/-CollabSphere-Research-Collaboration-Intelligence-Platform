@echo off
echo ===================================================
echo   Launching CollabSphere (Backend + Frontend)
echo ===================================================
start "CollabSphere Backend (Port 8000)" cmd /k "run_backend.bat"
start "CollabSphere Frontend (Port 5173)" cmd /k "run_frontend.bat"
echo.
echo [OK] Both servers started in independent terminal windows:
echo - Frontend UI : http://localhost:5173
echo - Backend API : http://localhost:8000
echo - Swagger Docs: http://localhost:8000/docs
echo.
