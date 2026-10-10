@echo off
title SmartDorm Launcher

echo ===================================
echo     Starting SmartDorm System
echo ===================================
echo.

:: 1. Navigate to the script's directory
cd /d "%~dp0"

:: 2. Seed the SQLite Database
echo [1/2] Seeding local SQLite database...
call npx prisma db seed
if %errorlevel% neq 0 (
    echo [ERROR] Failed to seed database.
    pause
    exit /b %errorlevel%
)
echo Database seeded successfully!
echo.

:: 3. Start the Next.js Local Server
echo [2/2] Starting local web server...
echo Access the app at: http://localhost:3000
echo.
call npm run dev

pause