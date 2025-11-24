# Common Commands Reference

## Docker Commands

### Start/Stop Services
```bash
# Start all services
docker-compose up

# Start in background
docker-compose up -d

# Stop all services
docker-compose down

# Restart services
docker-compose restart

# Restart specific service
docker-compose restart backend
docker-compose restart worker
docker-compose restart frontend
```

### View Logs
```bash
# View all logs
docker-compose logs

# Follow logs (live)
docker-compose logs -f

# View specific service logs
docker-compose logs backend
docker-compose logs worker
docker-compose logs frontend

# View last 100 lines
docker-compose logs --tail=100

# View logs with timestamps
docker-compose logs -t
```

### Check Status
```bash
# List all services and status
docker-compose ps

# Check specific service
docker-compose ps backend

# Get service details
docker inspect <container-id>
```

### Execute Commands
```bash
# Run command in backend container
docker exec backend python -c "print('hello')"

# Open shell in container
docker exec -it backend bash

# Run migrations
docker exec backend alembic upgrade head

# Create admin user
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
print('Admin user created')
"
```

### Database Commands
```bash
# Connect to database
docker exec -it postgres psql -U user -d email_marketing

# Backup database
docker exec postgres pg_dump -U user email_marketing > backup.sql

# Restore database
docker exec -i postgres psql -U user email_marketing < backup.sql

# Check database size
docker exec postgres psql -U user -d email_marketing -c "SELECT pg_size_pretty(pg_database_size('email_marketing'));"

# List tables
docker exec postgres psql -U user -d email_marketing -c "\dt"

# Count subscribers
docker exec postgres psql -U user -d email_marketing -c "SELECT COUNT(*) FROM subscribers;"
```

### Redis Commands
```bash
# Connect to Redis
docker exec -it redis redis-cli

# Check queue length
docker exec redis redis-cli LLEN celery

# Get all keys
docker exec redis redis-cli KEYS "*"

# Clear all data
docker exec redis redis-cli FLUSHALL

# Monitor Redis
docker exec redis redis-cli MONITOR
```

### Cleanup
```bash
# Remove stopped containers
docker-compose rm

# Remove volumes (WARNING: deletes data)
docker volume rm email-marketing_postgres_data
docker volume rm email-marketing_redis_data

# Full cleanup
docker-compose down -v

# Remove unused images
docker image prune

# Remove all unused resources
docker system prune -a
```

---

## Local Development Commands

### Backend

#### Setup
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Mac/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Upgrade pip
pip install --upgrade pip
```

#### Run
```bash
# Start API server
uvicorn app:app --reload

# Start with specific port
uvicorn app:app --reload --port 8001

# Start worker
celery -A workers.worker worker --loglevel=info

# Start scheduler
python -c "
from scheduler.scheduler import start_scheduler
import time
start_scheduler()
while True:
    time.sleep(1)
"
```

#### Database
```bash
# Create tables
python -c "
from db.models import Base
from db.session import engine
Base.metadata.create_all(bind=engine)
"

# Run migrations
alembic upgrade head

# Create migration
alembic revision --autogenerate -m "Add new column"

# Downgrade
alembic downgrade -1
```

#### Testing
```bash
# Run all tests
pytest

# Run specific test file
pytest tests/test_templates.py

# Run with coverage
pytest --cov=. tests/

# Run with verbose output
pytest -v

# Run specific test
pytest tests/test_templates.py::test_render_template_with_subscriber
```

### Frontend

#### Setup
```bash
cd frontend

# Install dependencies
npm install

# Update dependencies
npm update

# Clean install
rm -rf node_modules package-lock.json
npm install
```

#### Run
```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

#### Troubleshooting
```bash
# Clear npm cache
npm cache clean --force

# Clear node_modules
rm -rf node_modules
npm install

# Check for outdated packages
npm outdated

# Update packages
npm update
```

---

## Database Management

### PostgreSQL (Local)

```bash
# Connect to database
psql -U postgres -d email_marketing

# List databases
\l

# List tables
\dt

# Describe table
\d subscribers

# Run query
SELECT * FROM subscribers LIMIT 10;

# Count rows
SELECT COUNT(*) FROM subscribers;

# Export data
\copy subscribers TO 'subscribers.csv' WITH CSV HEADER

# Import data
\copy subscribers FROM 'subscribers.csv' WITH CSV HEADER

# Backup
pg_dump -U postgres email_marketing > backup.sql

# Restore
psql -U postgres email_marketing < backup.sql

# Exit
\q
```

### Redis (Local)

```bash
# Connect to Redis
redis-cli

# Check connection
PING

# Get all keys
KEYS *

# Get key value
GET key_name

# Set key value
SET key_name value

# Delete key
DEL key_name

# Clear all data
FLUSHALL

# Get database info
INFO

# Monitor commands
MONITOR

# Exit
EXIT
```

---

## API Testing

### Using curl

```bash
# Health check
curl http://localhost:8000/health

# Login
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'

# Get current user
curl -H "Authorization: Bearer <token>" \
  http://localhost:8000/auth/me

# List subscribers
curl -H "Authorization: Bearer <token>" \
  http://localhost:8000/subscribers

# Create template
curl -X POST http://localhost:8000/templates \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Test",
    "subject":"Hello",
    "html":"<p>Test</p>"
  }'
```

### Using Python

```python
import requests

BASE_URL = "http://localhost:8000"

# Login
response = requests.post(f"{BASE_URL}/auth/login", json={
    "email": "admin@example.com",
    "password": "password123"
})
token = response.json()["access_token"]

# Get current user
headers = {"Authorization": f"Bearer {token}"}
response = requests.get(f"{BASE_URL}/auth/me", headers=headers)
print(response.json())

# List subscribers
response = requests.get(f"{BASE_URL}/subscribers", headers=headers)
print(response.json())
```

---

## Monitoring

### Check System Health

```bash
# Docker
docker-compose ps

# Logs
docker-compose logs -f

# Resource usage
docker stats

# Network
docker network ls
docker network inspect email-marketing_default
```

### Check Services

```bash
# API health
curl http://localhost:8000/health

# Database
docker exec postgres psql -U user -d email_marketing -c "SELECT 1;"

# Redis
docker exec redis redis-cli ping

# Worker status
docker exec backend celery -A workers.worker inspect active
```

### Performance

```bash
# Database connections
docker exec postgres psql -U user -d email_marketing -c "SELECT count(*) FROM pg_stat_activity;"

# Queue length
docker exec redis redis-cli LLEN celery

# Memory usage
docker stats --no-stream
```

---

## Debugging

### Enable Debug Logging

```bash
# Backend
# Edit config.py:
# logging.basicConfig(level=logging.DEBUG)

# Worker
celery -A workers.worker worker --loglevel=debug

# Frontend
# Check browser console (F12)
```

### Database Debugging

```bash
# Enable query logging
# In app.py:
from sqlalchemy import event
from sqlalchemy.engine import Engine

@event.listens_for(Engine, "before_cursor_execute")
def receive_before_cursor_execute(conn, cursor, statement, params, context, executemany):
    print(statement)
```

### API Debugging

```bash
# Interactive API docs
http://localhost:8000/docs

# Alternative API docs
http://localhost:8000/redoc

# Check request/response
# Use browser DevTools (F12) Network tab
```

---

## Useful Aliases

Add to `.bashrc` or `.zshrc` (Mac/Linux):

```bash
# Docker
alias dc='docker-compose'
alias dcup='docker-compose up -d'
alias dcdown='docker-compose down'
alias dclogs='docker-compose logs -f'
alias dcps='docker-compose ps'

# Backend
alias backend='cd backend && source venv/bin/activate'
alias api='uvicorn app:app --reload'
alias worker='celery -A workers.worker worker --loglevel=info'

# Frontend
alias frontend='cd frontend && npm run dev'

# Database
alias db='psql -U postgres -d email_marketing'
alias redis='redis-cli'
```

---

## Emergency Commands

### Reset Everything

```bash
# Stop all services
docker-compose down

# Remove all data
docker volume rm email-marketing_postgres_data
docker volume rm email-marketing_redis_data

# Rebuild images
docker-compose build --no-cache

# Start fresh
docker-compose up
```

### Fix Database Issues

```bash
# Backup current database
docker exec postgres pg_dump -U user email_marketing > backup_$(date +%s).sql

# Drop and recreate database
docker exec postgres psql -U user -c "DROP DATABASE email_marketing;"
docker exec postgres psql -U user -c "CREATE DATABASE email_marketing;"

# Restart backend
docker-compose restart backend
```

### Clear Cache

```bash
# Redis
docker exec redis redis-cli FLUSHALL

# Frontend
# Clear browser cache (Ctrl+Shift+Delete)
# Or: rm -rf frontend/node_modules/.cache
```

---

## Performance Tuning

### Database

```bash
# Vacuum and analyze
docker exec postgres psql -U user -d email_marketing -c "VACUUM ANALYZE;"

# Check indexes
docker exec postgres psql -U user -d email_marketing -c "SELECT * FROM pg_indexes WHERE tablename='subscribers';"

# Create index
docker exec postgres psql -U user -d email_marketing -c "CREATE INDEX idx_email ON subscribers(email);"
```

### Redis

```bash
# Check memory
docker exec redis redis-cli INFO memory

# Set max memory policy
docker exec redis redis-cli CONFIG SET maxmemory-policy allkeys-lru

# Monitor performance
docker exec redis redis-cli --latency
```

### Workers

```bash
# Increase worker concurrency
celery -A workers.worker worker --concurrency=4

# Use gevent
celery -A workers.worker worker -p gevent -c 1000
```
