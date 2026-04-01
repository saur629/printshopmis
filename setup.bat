@echo off
echo =====================================================
echo   PrintFlow MIS - Windows Setup Script
echo =====================================================
echo.

echo [1/4] Copying .env file...
if not exist .env (
  copy .env.example .env
  echo .env created. Edit it if needed.
) else (
  echo .env already exists, skipping.
)

echo.
echo [2/4] Installing dependencies...
call npm install

echo.
echo [3/4] Setting up database...
call npx prisma generate
call npx prisma db push

echo.
echo [4/4] Seeding sample data...
call node prisma/seed.js

echo.
echo =====================================================
echo   Setup complete!
echo   Run:  npm run dev
echo   Open: http://localhost:3000
echo   Login: admin / admin123
echo =====================================================
pause
