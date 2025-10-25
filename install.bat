@echo off
echo Installing Font Converter Backend...
echo =====================================
echo.

:: Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed!
    echo Please install Node.js from: https://nodejs.org
    echo.
    pause
    exit /b 1
)

:: Show Node.js version
echo Node.js version:
node --version
echo.
echo NPM version:
npm --version
echo.

:: Install dependencies
echo Installing dependencies...
call npm install

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Installation successful!
    echo.
    echo To start the server:
    echo   npm start
    echo.
    echo or for development with auto-reload:
    echo   npm run dev
    echo.
    timeout /t 3 /nobreak >nul
    exit
) else (
    echo.
    echo ❌ Installation failed!
    echo.
    pause
)