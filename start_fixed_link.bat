@echo off
title MediGuide AI - Permanent / Fixed Link Launcher
color 0A
echo ========================================================
echo       MediGuide AI - Fixed Link Tunnel Launcher
echo ========================================================
echo.
echo Starting MediGuide AI backend on port 5050...
start "MediGuide Server" /min cmd /c "python app.py"

echo Waiting 3 seconds for server to initialize...
timeout /t 3 /nobreak >nul

echo.
echo Starting Fixed Tunnel on https://mediguide-ai-saidh.loca.lt ...
echo.
echo ========================================================
echo  Your Fixed Link: https://mediguide-ai-saidh.loca.lt
echo ========================================================
echo.
echo NOTE: First time phone/browser lo open chesinappudu
echo tunnel password adigithe mee laptop public IP enter cheyali.
echo (Mee IP password check cheyadaniki: https://loca.lt/mytunnelpassword)
echo.

lt --port 5050 --subdomain mediguide-ai-saidh
pause
