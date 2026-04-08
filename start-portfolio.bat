@echo off
title James Portfolio Server
cd /d "%~dp0"

set "NODE=%ProgramFiles%\nodejs\node.exe"
if not exist "%NODE%" (
  echo Node.js not found. Install from https://nodejs.org
  pause
  exit /b 1
)

echo.
echo  Starting site at http://localhost:3000
echo  Press Ctrl+C here to stop the server, then close this window.
echo.
"%NODE%" server.js
pause
