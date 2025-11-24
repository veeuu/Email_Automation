# Complete Setup Guide - Step by Step

## 🚀 Quick Start (5 minutes)

### For Windows Users
1. Download and install Docker Desktop: https://www.docker.com/products/docker-desktop
2. Open Command Prompt or PowerShell
3. Navigate to project folder: `cd email-marketing`
4. Run: `start.bat`
5. Wait 2-3 minutes for services to start
6. Open http://localhost:3000
7. Login with: `admin@example.com` / `password123`

### For Mac/Linux Users
1. Download and install Docker Desktop: https://www.docker.com/products/docker-desktop
2. Open Terminal
3. Navigate to project folder: `cd email-marketing`
4. Run: `bash start.sh`
5. Wait 2-3 minutes for services to start
6. Open http://localhost:3000
7. Login with: `admin@example.com` / `password123`

---

## 📋 Detailed Installation

### Step 1: Install Docker

#### Windows
1. Go to https://www.docker.com/products/docker-desktop
2. Click "Download for Windows"
3. Run the installer
4. Follow installation wizard
5. Restart computer
6. Open PowerShell and verify: `docker --version`

#### Mac
1. Go to https://www.docker.com/products/docker-desktop
2. Choose your chip (Intel or Apple Silicon)
3. Run the installer
4. Drag Docker to Applications
5. Open Terminal and verify: `docker --version`

#### Linux (Ubuntu/Debian)
```bash
sudo apt-get update
sudo apt-get install -y docker.io docker-compose
sudo usermod -aG docker $USER
newgrp docker
docker --version
```

### Step 2: Clone Project

```bash
# Using Git
git clone <your-repo-url>
cd email-marketing

# Or download ZIP and extract
# Then open folder in terminal
```

### Step 3: Configure Environment

```bash
# Copy template
cp .env.example .env

# Edit .env (optional - defaults work for local dev)
# Windows: notepad .env
# Mac/Linux: nano .env
```

### Step 4: Start Services

#### Option A: Using Startup Script (Easiest)

**Windows:**
```bash
start.bat
```

**Mac/Linux:**
```bash
bash start.sh
```

#### Option B: Manual Docker Compose

```bash
docker-compose up
```

### Step 5: Wait for Services

Services take 2-3 minutes to start on first run. You'll see:
```
✓ Services started successfully!

📍 Access points:
   Frontend:  http://localhost:3000
   API:       http://localhost:8000
   API Docs:  http://localhost:8000/docs
   MailHog:   http://localhost:8025
```

### Step 6: Login

1. Open http://localhost:3000
2. Email: `admin@example.com`
3. Password: `password123`
4. Click Login

---

## 🔧 Manual Local Development Setup

Use this if you want to run services locally without Docker.

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 15+
- Redis 7+

### Windows Setup

#### 1. Install Python
```bash
# Download from https://www.python.org/downloads/
# Or use Chocolatey:
choco install python
```

#### 2. Install Node.js
```bash
# Download from https://nodejs.org/
# Or use Chocolatey:
choco install nodejs
```

#### 3. Install PostgreSQL
```bash
# Download from https://www.postgresql.org/download/windows/
# Or use Chocolatey:
choco install postgresql
```

#### 4. Install Redis
```bash
# Download from https://github.com/microsoftarchive/redis/releases
# Or use Chocolatey:
choco install redis
```

#### 5. Create Database
```bash
# Open Command Prompt as Administrator
psql -U postgres
CREATE DATABASE email_marketing;
\q
```

### Mac Setup

```bash
# Install Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install dependencies
brew install python@3.11 node postgresql redis

# Start services
brew services start postgresql
brew services start redis

# Create database
createdb email_marketing
```

### Linux Setup (Ubuntu/Debian)

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

# Create .env
cp ../.env.example .env

# Edit .env for local setup
# DATABASE_URL=postgresql://postgres:password@localhost:5432/email_marketing
# REDIS_URL=redis://localhost:6379/0
# CELERY_BROKER_URL=redis://localhost:6379/1
# CELERY_RESULT_BACKEND=redis://localhost:6379/2
```

### Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Create .env
echo "REACT_APP_API_URL=http://localhost:8000" > .env
```

### Run Services

Open 4-5 terminal windows and run each command:

**Terminal 1: Backend API**
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
uvicorn app:app --reload
```

**Terminal 2: Celery Worker**
```bash
cd backend
source venv/bin/activate
celery -A workers.worker worker --loglevel=info
```

**Terminal 3: Scheduler**
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

**Terminal 4: Frontend**
```bash
cd frontend
npm run dev
```

**Terminal 5: MailHog (Optional)**
```bash
# Download from https://github.com/mailhog/MailHog/releases
# Or use Docker:
docker run -p 1025:1025 -p 8025:8025 mailhog/mailhog
```

### Create Admin User

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
print('✓ Admin user created')
"
```

---

## ✅ Verification

### Docker Setup
```bash
# Check all services running
docker-compose ps

# Should show:
# postgres    Up
# redis       Up
# mailhog     Up
# api         Up
# worker      Up
# frontend    Up
```

### Local Setup
```bash
# Backend
curl http://localhost:8000/health
# Should return: {"status":"ok"}

# Frontend
# Should load at http://localhost:3000

# Worker
celery -A workers.worker inspect active
# Should show worker status

# Database
psql -U postgres -d email_marketing -c "SELECT 1;"
# Should return: 1

# Redis
redis-cli ping
# Should return: PONG
```

---

## 🌐 Access Points

After successful setup:

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:3000 | Web interface |
| API | http://localhost:8000 | REST API |
| API Docs | http://localhost:8000/docs | Interactive API docs |
| MailHog | http://localhost:8025 | Email testing |
| Postgres | localhost:5432 | Database |
| Redis | localhost:6379 | Cache/Queue |

---

## 🆘 Troubleshooting

### Docker Won't Start
```bash
# Check Docker is running
docker ps

# If error, restart Docker Desktop
# Windows/Mac: Restart Docker Desktop app
# Linux: sudo systemctl restart docker
```

### Port Already in Use
```bash
# Find process using port 8000
# Windows:
netstat -ano | findstr :8000

# Mac/Linux:
lsof -i :8000

# Kill process
# Windows:
taskkill /PID <PID> /F

# Mac/Linux:
kill -9 <PID>
```

### Database Connection Error
```bash
# Reset database
docker-compose down
docker volume rm email-marketing_postgres_data
docker-compose up
```

### Can't Login
```bash
# Recreate admin user
docker exec backend python -c "
from db.session import SessionLocal
from db.models import User
from api.auth import get_password_hash
from uuid import uuid4

db = SessionLocal()
db.query(User).delete()
db.commit()

user = User(
    id=uuid4(),
    email='admin@example.com',
    hashed_password=get_password_hash('password123'),
    full_name='Admin User',
    role='admin'
)
db.add(user)
db.commit()
print('✓ Admin user recreated')
"
```

### Services Not Responding
```bash
# Check logs
docker-compose logs backend
docker-compose logs worker
docker-compose logs frontend

# Restart services
docker-compose restart

# Full reset
docker-compose down
docker-compose up
```

---

## 📚 Next Steps

1. **Read QUICKSTART.md** - Common tasks
2. **Read API.md** - API reference
3. **Create Templates** - Build email templates
4. **Import Subscribers** - Upload subscriber lists
5. **Create Campaigns** - Build and schedule campaigns

---

## 💡 Tips

- **Keep terminal open** - Shows logs and errors
- **Check MailHog** - See test emails at http://localhost:8025
- **API Docs** - Interactive docs at http://localhost:8000/docs
- **Restart services** - `docker-compose restart` if something breaks
- **View logs** - `docker-compose logs -f` to see what's happening

---

## 🎯 You're Ready!

Your email marketing system is now running. Start by:
1. Creating a template
2. Importing subscribers
3. Creating a campaign
4. Sending a test email

See QUICKSTART.md for detailed instructions.
