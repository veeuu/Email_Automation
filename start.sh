#!/bin/bash

# Email Marketing Automation - Startup Script
# This script starts all services using Docker Compose

set -e

echo "================================"
echo "Email Marketing Automation"
echo "================================"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker Desktop."
    echo "   https://www.docker.com/products/docker-desktop"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed."
    exit 1
fi

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✓ .env created. Edit if needed."
fi

echo ""
echo "🚀 Starting services..."
echo ""

# Start services
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    echo ""
    echo "✓ Services started successfully!"
    echo ""
    echo "📍 Access points:"
    echo "   Frontend:  http://localhost:3000"
    echo "   API:       http://localhost:8000"
    echo "   API Docs:  http://localhost:8000/docs"
    echo "   MailHog:   http://localhost:8025"
    echo ""
    
    # Check if admin user exists
    echo "🔐 Creating admin user..."
    docker exec backend python -c "
from db.session import SessionLocal
from db.models import User
from api.auth import get_password_hash
from uuid import uuid4

db = SessionLocal()
existing = db.query(User).filter(User.email == 'admin@example.com').first()
if not existing:
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
else:
    print('✓ Admin user already exists')
" 2>/dev/null || echo "⚠ Could not create admin user (database may still be initializing)"
    
    echo ""
    echo "🔑 Login credentials:"
    echo "   Email:    admin@example.com"
    echo "   Password: password123"
    echo ""
    echo "📚 Documentation:"
    echo "   Quick Start:  QUICKSTART.md"
    echo "   Installation: INSTALL.md"
    echo "   API Docs:     API.md"
    echo ""
    echo "💡 Useful commands:"
    echo "   View logs:    docker-compose logs -f"
    echo "   Stop:         docker-compose down"
    echo "   Restart:      docker-compose restart"
    echo ""
else
    echo "❌ Services failed to start. Check logs:"
    docker-compose logs
    exit 1
fi
