@echo off
echo Starting Font Converter Backend Server...
echo ==========================================
echo.

:: Check if node_modules exists
if not exist "node_modules\" (
    echo ❌ Dependencies not installed!
    echo Please run install.bat first
    echo.
    pause
    exit /b 1
)

:: Start the server
echo 🚀 Starting server on http://localhost:3000
echo 🌐 Management UI will be available at http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.

node server.js