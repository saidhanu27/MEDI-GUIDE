@echo off
title MediGuide AI - Launcher
color 0B
echo ========================================================
echo         MediGuide AI - Smart Health Assistant
echo ========================================================
echo.
echo Starting MediGuide AI server...
echo.

where python >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not added to PATH.
    echo Please install Python 3.10+ from https://python.org and ensure "Add Python to PATH" is checked.
    pause
    exit /b
)

echo Checking dependencies...
pip install -r requirements.txt >nul 2>nul

echo Starting application on http://127.0.0.1:5050 ...
start "" "http://127.0.0.1:5050"
python app.py

pause
