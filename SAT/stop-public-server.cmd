@echo off
title SAT Public Server Stopper
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0stop-public-server.ps1"
echo.
pause
