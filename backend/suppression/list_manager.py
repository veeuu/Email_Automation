from sqlalchemy.orm import Session
from db.models import Suppression
from datetime import datetime


class SuppressionManager:
    def __init__(self, db: Session):
        self.db = db
    
    def add_suppression(self, email: str, reason: str = "manual"):
        """Add email to suppression list"""
        existing = self.db.query(Suppression).filter(Suppression.email == email).first()
        if existing:
            return existing
        
        suppression = Suppression(
            email=email,
            reason=reason
        )
        self.db.add(suppression)
        self.db.commit()
        self.db.refresh(suppression)
        return suppression
    
    def remove_suppression(self, email: str):
        """Remove email from suppression list"""
        suppression = self.db.query(Suppression).filter(Suppression.email == email).first()
        if suppression:
            self.db.delete(suppression)
            self.db.commit()
        return suppression
    
    def is_suppressed(self, email: str) -> bool:
        """Check if email is suppressed"""
        return self.db.query(Suppression).filter(Suppression.email == email).first() is not None
    
    def bulk_add_suppression(self, emails: list, reason: str = "bulk_import"):
        """Add multiple emails to suppression list"""
        for email in emails:
            self.add_suppression(email, reason)
    
    def get_suppression_list(self, limit: int = 1000, offset: int = 0):
        """Get paginated suppression list"""
        suppressions = self.db.query(Suppression).limit(limit).offset(offset).all()
        total = self.db.query(Suppression).count()
        return suppressions, total
