@echo off
REM Email Marketing Automation - Startup Script for Windows

setlocal enabledelayedexpansion

echo ================================
echo Email Marketing Automation
echo ================================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not installed. Please install Docker Desktop.
    echo    https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker Compose is not installed.
    pause
    exit /b 1
)

REM Check if .env exists
if not exist .env (
    echo 📝 Creating .env file from template...
    copy .env.example .env
    echo ✓ .env created. Edit if needed.
)

echo.
echo 🚀 Starting services...
echo.

REM Start services
docker-compose up -d

REM Wait for services to be ready
echo ⏳ Waiting for services to start...
timeout /t 10 /nobreak

REM Check if services are running
docker-compose ps | findstr "Up" >nul
if errorlevel 0 (
    echo.
    echo ✓ Services started successfully!
    echo.
    echo 📍 Access points:
    echo    Frontend:  http://localhost:3000
    echo    API:       http://localhost:8000
    echo    API Docs:  http://localhost:8000/docs
    echo    MailHog:   http://localhost:8025
    echo.
    
    echo 🔐 Creating admin user...
    docker exec backend python -c "from db.session import SessionLocal; from db.models import User; from api.auth import get_password_hash; from uuid import uuid4; db = SessionLocal(); existing = db.query(User).filter(User.email == 'admin@example.com').first(); user = User(id=uuid4(), email='admin@example.com', hashed_password=get_password_hash('password123'), full_name='Admin User', role='admin') if not existing else None; db.add(user) if user else None; db.commit() if user else None; print('✓ Admin user created' if user else '✓ Admin user already exists')" 2>nul || echo ⚠ Could not create admin user
    
    echo.
    echo 🔑 Login credentials:
    echo    Email:    admin@example.com
    echo    Password: password123
    echo.
    echo 📚 Documentation:
    echo    Quick Start:  QUICKSTART.md
    echo    Installation: INSTALL.md
    echo    API Docs:     API.md
    echo.
    echo 💡 Useful commands:
    echo    View logs:    docker-compose logs -f
    echo    Stop:         docker-compose down
    echo    Restart:      docker-compose restart
    echo.
) else (
    echo ❌ Services failed to start. Check logs:
    docker-compose logs
    pause
    exit /b 1
)

pause
