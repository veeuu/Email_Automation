# Deployment Guide

## Local Development

1. Copy `.env.example` to `.env` and update values
2. Run `docker-compose up`
3. Access frontend at http://localhost:3000
4. Access API at http://localhost:8000
5. Access MailHog at http://localhost:8025

## Production Deployment

### Prerequisites
- Docker & Docker Compose
- PostgreSQL 15+ (managed service recommended)
- Redis (managed service recommended)
- SMTP server (self-hosted or commercial)

### Environment Setup
1. Create `.env` with production values
2. Set strong `SECRET_KEY` and `TRACKING_TOKEN_SECRET`
3. Configure DKIM keys and domain settings
4. Set up SSL certificates

### Database Migrations
```bash
docker exec backend alembic upgrade head
```

### Initial Admin User
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
    hashed_password=get_password_hash('secure_password'),
    full_name='Admin',
    role='admin'
)
db.add(user)
db.commit()
"
```

### Scaling Workers
Increase worker replicas in docker-compose or Kubernetes:
```yaml
worker:
  deploy:
    replicas: 5
```

### Monitoring
- Check logs: `docker logs backend`
- Monitor queue: `docker exec redis redis-cli LLEN celery`
- Check metrics: `GET /health`

### Backup
```bash
python backend/scripts/db_backup.py backup backup_$(date +%Y%m%d).sql
```

### Restore
```bash
python backend/scripts/db_backup.py restore backup_20240101.sql
```
