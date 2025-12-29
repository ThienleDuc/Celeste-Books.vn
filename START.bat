@echo off
echo ========================================
echo   KHOI DONG CELESTE BOOKS SYSTEM
echo ========================================
echo.

echo [1/2] Starting Backend Laravel...
start "Backend Laravel" cmd /k "cd backend && php artisan serve"
timeout /t 3 /nobreak >nul

echo [2/2] Starting Frontend React...
start "Frontend React" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo   HE THONG DA KHOI DONG!
echo ========================================
echo Backend: http://localhost:8000
echo Frontend: http://localhost:5173
echo.
echo Nhan phim bat ky de dong cua so nay...
pause >nul
