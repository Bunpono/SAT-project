@echo off
setlocal

echo Starting the Syntactic Analysis Tool...
start "SAT Backend" cmd /k "cd /d %~dp0backend && call venv\Scripts\activate.bat && python -m uvicorn main:app --reload"
start "SAT Frontend" cmd /k "cd /d %~dp0frontend && npm.cmd run dev"

echo.
echo Keep both windows open. Open the Local URL shown in the SAT Frontend window.
