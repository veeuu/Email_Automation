# Installation & Setup Guide

## Option 1: Docker (Recommended - Easiest)

### Prerequisites
- Docker Desktop (includes Docker & Docker Compose)
  - Windows: https://www.docker.com/products/docker-desktop
  - Mac: https://www.docker.com/products/docker-desktop
  - Linux: `sudo apt-get install docker.io docker-compose`

### Step 1: Clone Repository
```bash
git clone <your-repo-url>
cd email-marketing
```

### Step 2: Setup Environment
```bash
cp .env.example .env
```

Edit `.env` if needed (defaults work for local dev):
```
DATABASE_URL=postgresql://user:password@postgres:5432/email_marketing
REDIS_URL=redis://redis:6379/0
SMTP_HOST=mailhog
SMTP_PORT=1025
```

### Step 3: Start All Services
```bash
docker-compose up
```

First run takes 2-3 minutes to build images and start services.

### Step 4: Create Admin User
Open a new terminal and run:
```bash
docker exec backend python -c "
from db.session import SessionLocal
from db.models import User
from api.auth import get_password_hash
from uuid import uuid4

db = SessionLocal()
user = User(
    id=uuid4(),
    email='admin@example.com',
    hashed_password=get_password_hash('password123'),
    full_name='Admin User',
    role='admin'
)
db.add(user)
db.commit()
print('✓ Admin user created: admin@example.com / password123')
"
```

### Step 5: Access Application
- **Frontend**: http://localhost:3000
- **API**: http://localhost:8000
- **MailHog**: http://localhost:8025
- **API Docs**: http://localhost:8000/docs

### Step 6: Login
- Email: `admin@example.com`
- Password: `password123`

### Verify Everything Works
```bash
# Check all services running
docker-compose ps

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Restart services
docker-compose restart
```

---

## Option 2: Local Development (Manual Setup)

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 15+
- Redis 7+

### Windows Installation

#### 1. Install Python
```bash
# Download from https://www.python.org/downloads/
# Or use Chocolatey:
choco install python nodejs postgresql redis
```

#### 2. Install PostgreSQL
```bash
# Download from https://www.postgresql.org/download/windows/
# Or use Chocolatey:
choco install postgresql
```

#### 3. Install Redis
```bash
# Download from https://github.com/microsoftarchive/redis/releases
# Or use Chocolatey:
choco install redis
```

#### 4. Start Services
```bash
# PostgreSQL (should auto-start)
# Redis
redis-server

# Create database
psql -U postgres -c "CREATE DATABASE email_marketing;"
```

### Mac Installation

```bash
# Install Homebrew if not installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install dependencies
brew install python@3.11 node postgresql redis

# Start services
brew services start postgresql
brew services start redis

# Create database
createdb email_marketing
```

### Linux Installation (Ubuntu/Debian)

```bash
# Update package manager
sudo apt-get update

# Install dependencies
sudo apt-get install -y python3.11 python3.11-venv python3-pip \
  nodejs npm postgresql postgresql-contrib redis-server

# Start services
sudo systemctl start postgresql
sudo systemctl start redis-server

# Create database
sudo -u postgres createdb email_marketing
```

### Setup Backend

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp ../.env.example .env

# Edit .env for local setup
# DATABASE_URL=postgresql://postgres:password@localhost:5432/email_marketing
# REDIS_URL=redis://localhost:6379/0
```

### Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
echo "REACT_APP_API_URL=http://localhost:8000" > .env
```

### Run Services

#### Terminal 1: Backend API
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
uvicorn app:app --reload
```

#### Terminal 2: Celery Worker
```bash
cd backend
source venv/bin/activate
celery -A workers.worker worker --loglevel=info
```

#### Terminal 3: Scheduler
```bash
cd backend
source venv/bin/activate
python -c "
from scheduler.scheduler import start_scheduler
import time
start_scheduler()
print('Scheduler started. Press Ctrl+C to stop.')
try:
    while True:
        time.sleep(1)
except KeyboardInterrupt:
    print('Scheduler stopped.')
"
```

#### Terminal 4: Frontend
```bash
cd frontend
npm run dev
```

#### Terminal 5: MailHog (Optional - for testing emails)
```bash
# Download from https://github.com/mailhog/MailHog/releases
# Or use Docker:
docker run -p 1025:1025 -p 8025:8025 mailhog/mailhog
```

### Create Admin User (Local)

```bash
cd backend
source venv/bin/activate
python -c "
from db.session import SessionLocal
from db.models import Base, User
from db.session import engine
from api.auth import get_password_hash
from uuid import uuid4

# Create tables
Base.metadata.create_all(bind=engine)

db = SessionLocal()
user = User(
    id=uuid4(),
    email='admin@example.com',
    hashed_password=get_password_hash('password123'),
    full_name='Admin User',
    role='admin'
)
db.add(user)
db.commit()
print('✓ Admin user created: admin@example.com / password123')
"
```

### Access Application
- **Frontend**: http://localhost:3000
- **API**: http://localhost:8000
- **MailHog**: http://localhost:8025
- **API Docs**: http://localhost:8000/docs

---

## Troubleshooting

### Docker Issues

#### Port Already in Use
```bash
# Find process using port
# Windows:
netstat -ano | findstr :8000

# Mac/Linux:
lsof -i :8000

# Kill process
# Windows:
taskkill /PID <PID> /F

# Mac/Linux:
kill -9 <PID>

# Or change ports in docker-compose.yml
```

#### Database Connection Error
```bash
# Reset database
docker-compose down
docker volume rm email-marketing_postgres_data
docker-compose up
```

#### Services Not Starting
```bash
# Check logs
docker-compose logs backend
docker-compose logs worker
docker-compose logs frontend

# Rebuild images
docker-compose build --no-cache
docker-compose up
```

### Local Development Issues

#### Python Virtual Environment Issues
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Mac/Linux
python3 -m venv venv
source venv/bin/activate
```

#### PostgreSQL Connection Error
```bash
# Check if PostgreSQL is running
# Windows:
Get-Service postgresql-x64-15

# Mac:
brew services list

# Linux:
sudo systemctl status postgresql

# Test connection
psql -U postgres -d email_marketing
```

#### Redis Connection Error
```bash
# Check if Redis is running
# Windows:
Get-Service Redis

# Mac:
brew services list

# Linux:
sudo systemctl status redis-server

# Test connection
redis-cli ping
```

#### Module Not Found Errors
```bash
# Reinstall dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Clear cache
pip cache purge
```

#### Frontend Build Issues
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear npm cache
npm cache clean --force
```

---

## Verification Checklist

After installation, verify everything works:

### Docker Setup
- [ ] `docker-compose ps` shows all services running
- [ ] Frontend loads at http://localhost:3000
- [ ] API responds at http://localhost:8000/health
- [ ] Can login with admin@example.com / password123
- [ ] MailHog shows at http://localhost:8025

### Local Setup
- [ ] Backend running: `curl http://localhost:8000/health`
- [ ] Frontend running: http://localhost:3000
- [ ] Worker processing jobs: `celery -A workers.worker inspect active`
- [ ] Scheduler running: Check logs for "Scheduler started"
- [ ] Database connected: `psql -U postgres -d email_marketing -c "SELECT 1;"`
- [ ] Redis connected: `redis-cli ping` returns PONG

### Functional Tests
- [ ] Login works
- [ ] Can create template
- [ ] Can import CSV
- [ ] Can create campaign
- [ ] Can send test email
- [ ] Email appears in MailHog

---

## Next Steps

1. **Configure SMTP**: Update `.env` with your SMTP server
2. **Set DKIM**: Generate DKIM keys and configure domain
3. **Create Templates**: Build email templates
4. **Import Subscribers**: Upload subscriber lists
5. **Create Campaigns**: Build and schedule campaigns
6. **Monitor**: Check dashboard and analytics

See QUICKSTART.md for common tasks.
