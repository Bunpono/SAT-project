@echo off
setlocal

if not exist "%~dp0backend\venv\Scripts\python.exe" (
  echo Creating the backend environment...
  cd /d "%~dp0backend"
  python -m venv venv
  call venv\Scripts\activate.bat
  python -m pip install -r requirements.txt
)

if not exist "%~dp0frontend\node_modules" (
  echo Installing frontend packages...
  cd /d "%~dp0frontend"
  npm.cmd install
)

call "%~dp0run-local.cmd"
