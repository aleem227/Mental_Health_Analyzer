@echo off
echo ================================================
echo Mental Health Analyzer - Backend Setup
echo ================================================
echo.

REM Check if virtual environment exists
if not exist "venv\" (
    echo Creating virtual environment...
    python -m venv venv
    echo Virtual environment created!
    echo.
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Install/upgrade dependencies
echo.
echo Installing dependencies...
pip install -r api\requirements.txt

REM Start the backend
echo.
echo ================================================
echo Starting FastAPI backend...
echo API will be available at: http://localhost:8000
echo API Docs available at: http://localhost:8000/docs
echo ================================================
echo.
uvicorn api.index:app --reload --host 0.0.0.0 --port 8000
