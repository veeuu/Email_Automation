# Quick Start Guide

## Prerequisites
- Docker & Docker Compose
- Git
- Node.js 18+ (for local frontend dev)
- Python 3.11+ (for local backend dev)

## Local Development (Docker)

### 1. Clone and Setup
```bash
git clone <repo>
cd email-marketing
cp .env.example .env
```

### 2. Start Services
```bash
docker-compose up
```

Services will be available at:
- Frontend: http://localhost:3000
- API: http://localhost:8000
- MailHog: http://localhost:8025
- Postgres: localhost:5432
- Redis: localhost:6379

### 3. Create Admin User
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
print('Admin user created')
"
```

### 4. Login
- Go to http://localhost:3000
- Email: admin@example.com
- Password: password123

## Local Development (Native)

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn app:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Workers
```bash
cd backend
celery -A workers.worker worker --loglevel=info
```

### Scheduler
```bash
cd backend
python -c "from scheduler.scheduler import start_scheduler; start_scheduler(); import time; time.sleep(999999)"
```

## Testing

### Run Tests
```bash
cd backend
pytest tests/
```

### Test Coverage
```bash
pytest --cov=. tests/
```

## Common Tasks

### Import Subscribers
1. Go to Subscribers page
2. Click "Import CSV"
3. Upload CSV with columns: email, name
4. Review import report

### Create Campaign
1. Go to Templates
2. Create template with subject and HTML
3. Go to Campaigns
4. Create campaign, select template
5. Schedule or send immediately

### Monitor Sends
1. Go to Dashboard
2. View campaign metrics
3. Check MailHog for test emails

### Check Logs
```bash
docker logs backend
docker logs worker
```

## Troubleshooting

### Database Connection Error
```bash
docker-compose down
docker volume rm email-marketing_postgres_data
docker-compose up
```

### Port Already in Use
Change ports in docker-compose.yml or kill existing process

### Worker Not Processing Jobs
```bash
docker logs worker
docker exec redis redis-cli LLEN celery
```

### Frontend Not Loading
```bash
docker logs frontend
npm install  # in frontend directory
```

## Next Steps

1. Configure SMTP server
2. Set up DKIM/SPF records
3. Create templates
4. Import subscriber list
5. Create and schedule campaigns
6. Monitor analytics
7. Set up automations
