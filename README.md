# Email Marketing Automation System

A complete, self-hosted email marketing platform with subscriber management, campaign scheduling, template rendering, and analytics.

## 🎯 Features

- **Subscriber Management**: Import, manage, and segment subscribers
- **Email Templates**: WYSIWYG editor with Jinja2 rendering
- **Campaign Builder**: Create, schedule, and send campaigns
- **Automation Workflows**: Drag-and-drop workflow builder with conditions
- **Email Tracking**: Open/click tracking with analytics
- **Bounce Handling**: Automatic bounce processing and suppression
- **DKIM Signing**: Email authentication and deliverability
- **Analytics Dashboard**: Real-time metrics and reporting
- **Role-Based Access**: Admin and user roles with audit logging
- **Scalable Architecture**: Queue-based processing with horizontal scaling

## 🚀 Quick Start

### Using Docker (Recommended)

```bash
# Clone repository
git clone <repo-url>
cd email-marketing

# Start services
docker-compose up

# Or use startup script
# Windows: start.bat
# Mac/Linux: bash start.sh
```

Access at:
- Frontend: http://localhost:3000
- API: http://localhost:8000
- MailHog: http://localhost:8025

Login: `admin@example.com` / `password123`

### Local Development

See [SETUP.md](SETUP.md) for detailed local installation instructions.

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [SETUP.md](SETUP.md) | Complete installation guide |
| [QUICKSTART.md](QUICKSTART.md) | Common tasks and workflows |
| [API.md](API.md) | REST API reference |
| [ARCHITECTURE.md](ARCHITECTURE.md) | System design and components |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Production deployment |
| [OPERATIONS.md](OPERATIONS.md) | Monitoring and maintenance |
| [SECURITY.md](SECURITY.md) | Security and compliance |
| [TESTING.md](TESTING.md) | Testing strategies |
| [COMMANDS.md](COMMANDS.md) | Common commands reference |
| [INSTALL.md](INSTALL.md) | Detailed installation steps |

## 🏗️ Architecture

### Components

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
│  Dashboard | Subscribers | Templates | Campaigns        │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                  API (FastAPI)                          │
│  Auth | Subscribers | Templates | Campaigns | Tracking  │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
    ┌───▼──┐    ┌───▼──┐    ┌───▼──┐
    │  DB  │    │Redis │    │SMTP  │
    │(PG)  │    │Queue │    │      │
    └──────┘    └──────┘    └──────┘
        │            │
    ┌───▼────────────▼──────┐
    │  Workers (Celery)     │
    │  Send | Bounce | Agg  │
    └──────────────────────┘
```

### Tech Stack

**Backend**
- FastAPI - REST API framework
- SQLAlchemy - ORM
- PostgreSQL - Database
- Redis - Cache & Queue
- Celery - Task queue
- APScheduler - Job scheduling

**Frontend**
- React 18 - UI framework
- TypeScript - Type safety
- Tailwind CSS - Styling
- React Query - Server state
- Zustand - Client state

**Infrastructure**
- Docker - Containerization
- Docker Compose - Orchestration

## 📋 System Requirements

### Docker Setup
- Docker Desktop (includes Docker & Docker Compose)
- 4GB RAM minimum
- 10GB disk space

### Local Setup
- Python 3.11+
- Node.js 18+
- PostgreSQL 15+
- Redis 7+

## 🔧 Installation

### Option 1: Docker (Easiest)

```bash
# Windows
start.bat

# Mac/Linux
bash start.sh
```

### Option 2: Manual Setup

See [SETUP.md](SETUP.md) for detailed instructions.

## 📖 Usage

### 1. Create Template
```
Templates → New Template → Enter subject and HTML → Save
```

### 2. Import Subscribers
```
Subscribers → Import CSV → Upload file → Review → Import
```

### 3. Create Campaign
```
Campaigns → New Campaign → Select template → Configure → Schedule
```

### 4. Monitor Results
```
Dashboard → View metrics → Check analytics → Export reports
```

## 🔌 API Examples

### Login
```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'
```

### List Subscribers
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:8000/subscribers
```

### Create Campaign
```bash
curl -X POST http://localhost:8000/campaigns \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Q1 Campaign",
    "template_id":"<uuid>",
    "send_rate":10
  }'
```

See [API.md](API.md) for complete API reference.

## 🛠️ Common Commands

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

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
"

# Run tests
docker exec backend pytest tests/

# Backup database
docker exec postgres pg_dump -U user email_marketing > backup.sql
```

See [COMMANDS.md](COMMANDS.md) for more commands.

## 🔐 Security

- JWT authentication with expiration
- HMAC-signed tracking tokens
- DKIM email signing
- Role-based access control
- Audit logging
- Suppression list enforcement
- GDPR compliance support

See [SECURITY.md](SECURITY.md) for details.

## 📊 Monitoring

Key metrics:
- Send rate (emails/sec)
- Queue length
- Bounce rate
- Error rate
- Open/click rates

See [OPERATIONS.md](OPERATIONS.md) for monitoring setup.

## 🚀 Deployment

### Production Checklist
- [ ] Use managed PostgreSQL
- [ ] Use managed Redis
- [ ] Configure SMTP server
- [ ] Set up DKIM/SPF records
- [ ] Enable HTTPS
- [ ] Configure backups
- [ ] Set up monitoring
- [ ] Configure alerts
- [ ] Review security settings

See [DEPLOYMENT.md](DEPLOYMENT.md) for production setup.

## 🧪 Testing

```bash
# Run all tests
docker exec backend pytest tests/

# Run specific test
docker exec backend pytest tests/test_templates.py

# With coverage
docker exec backend pytest --cov=. tests/
```

See [TESTING.md](TESTING.md) for testing guide.

## 🐛 Troubleshooting

### Services won't start
```bash
docker-compose down
docker volume rm email-marketing_postgres_data
docker-compose up
```

### Can't login
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
"
```

### Port already in use
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :8000
kill -9 <PID>
```

See [SETUP.md](SETUP.md) for more troubleshooting.

## 📞 Support

- Check documentation in `/docs` folder
- Review API docs at http://localhost:8000/docs
- Check logs: `docker-compose logs -f`
- See [COMMANDS.md](COMMANDS.md) for debugging commands

## 📝 License

[Your License Here]

## 🤝 Contributing

[Your Contributing Guidelines Here]

## 📞 Contact

[Your Contact Information Here]

---

## 🎓 Learning Path

1. **Start**: Read [QUICKSTART.md](QUICKSTART.md)
2. **Setup**: Follow [SETUP.md](SETUP.md)
3. **Use**: Try common tasks in [QUICKSTART.md](QUICKSTART.md)
4. **Integrate**: Use [API.md](API.md) for integration
5. **Deploy**: Follow [DEPLOYMENT.md](DEPLOYMENT.md)
6. **Operate**: Use [OPERATIONS.md](OPERATIONS.md)

## 🎯 Next Steps

1. ✅ Install and start services
2. ✅ Create your first template
3. ✅ Import test subscribers
4. ✅ Create and send test campaign
5. ✅ Check analytics
6. ✅ Configure SMTP for production
7. ✅ Set up DKIM/SPF
8. ✅ Deploy to production

---

**Ready to get started?** See [SETUP.md](SETUP.md) for installation instructions.
