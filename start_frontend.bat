@echo off
echo ================================================
echo Mental Health Analyzer - Frontend Setup
echo ================================================
echo.

REM Navigate to frontend directory
cd frontend

REM Check if node_modules exists
if not exist "node_modules\" (
    echo Installing frontend dependencies...
    call npm install
    echo Dependencies installed!
    echo.
)

REM Start the frontend
echo ================================================
echo Starting React frontend...
echo Frontend will be available at: http://localhost:5173
echo ================================================
echo.
call npm run dev
