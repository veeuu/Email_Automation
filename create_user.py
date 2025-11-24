import sys
sys.path.insert(0, 'backend')

from db.models import Base, User
from db.session import engine, SessionLocal
from uuid import uuid4
import hashlib

# Create tables
Base.metadata.create_all(bind=engine)

# Create admin user with simple hash
db = SessionLocal()
existing = db.query(User).filter(User.email == 'admin@example.com').first()

if not existing:
    # Use a simple hash for now
    password_hash = hashlib.sha256('password123'.encode()).hexdigest()
    
    user = User(
        id=uuid4(),
        email='admin@example.com',
        hashed_password=password_hash,
        full_name='Admin User',
        role='admin'
    )
    db.add(user)
    db.commit()
    print('✓ Admin user created')
    print('  Email: admin@example.com')
    print('  Password: password123')
else:
    print('✓ Admin user already exists')

db.close()
