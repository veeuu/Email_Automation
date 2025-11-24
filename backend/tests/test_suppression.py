import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from db.models import Base, Suppression
from suppression.list_manager import SuppressionManager


@pytest.fixture
def db():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    SessionLocal = sessionmaker(bind=engine)
    session = SessionLocal()
    yield session
    session.close()


def test_add_suppression(db):
    manager = SuppressionManager(db)
    manager.add_suppression("test@example.com", "bounce")
    
    assert manager.is_suppressed("test@example.com")


def test_remove_suppression(db):
    manager = SuppressionManager(db)
    manager.add_suppression("test@example.com", "bounce")
    manager.remove_suppression("test@example.com")
    
    assert not manager.is_suppressed("test@example.com")


def test_bulk_add_suppression(db):
    manager = SuppressionManager(db)
    emails = ["test1@example.com", "test2@example.com", "test3@example.com"]
    manager.bulk_add_suppression(emails)
    
    for email in emails:
        assert manager.is_suppressed(email)
