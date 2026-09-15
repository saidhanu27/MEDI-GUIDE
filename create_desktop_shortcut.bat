@echo off
title Create MediGuide AI Shortcut
echo Creating Desktop Shortcut for MediGuide AI...

set SCRIPT="%TEMP%\%RANDOM%-%RANDOM%_create_shortcut.vbs"
set TARGET=%CD%\start_app.bat
set ICON=%CD%\assets\icon-192.png

echo Set oWS = WScript.CreateObject("WScript.Shell") >> %SCRIPT%
echo sLinkFile = oWS.SpecialFolders("Desktop") ^& "\MediGuide AI.lnk" >> %SCRIPT%
echo Set oLink = oWS.CreateShortcut(sLinkFile) >> %SCRIPT%
echo oLink.TargetPath = "%TARGET%" >> %SCRIPT%
echo oLink.WorkingDirectory = "%CD%" >> %SCRIPT%
echo oLink.Description = "MediGuide AI - Smart Health Assistant" >> %SCRIPT%
echo oLink.Save >> %SCRIPT%

cscript /nologo %SCRIPT%
del %SCRIPT%

echo.
echo [SUCCESS] MediGuide AI Desktop Shortcut created on your Desktop!
echo You can now open MediGuide AI directly from your Desktop anytime.
pause
