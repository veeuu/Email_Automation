import logging
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from db.models import SendLog, Event
from sqlalchemy import func

logger = logging.getLogger(__name__)


class AlertManager:
    def __init__(self, db: Session):
        self.db = db
    
    def check_bounce_rate(self, threshold: float = 0.05):
        """Check if bounce rate exceeds threshold"""
        last_hour = datetime.utcnow() - timedelta(hours=1)
        
        total_sent = self.db.query(func.count(SendLog.id)).filter(
            SendLog.created_at >= last_hour,
            SendLog.status.in_(["sent", "bounced"])
        ).scalar()
        
        total_bounced = self.db.query(func.count(SendLog.id)).filter(
            SendLog.created_at >= last_hour,
            SendLog.status == "bounced"
        ).scalar()
        
        if total_sent > 0:
            bounce_rate = total_bounced / total_sent
            if bounce_rate > threshold:
                logger.warning(f"High bounce rate detected: {bounce_rate:.2%}")
                return True
        
        return False
    
    def check_queue_length(self, threshold: int = 10000):
        """Check if queue is too long"""
        pending_count = self.db.query(func.count(SendLog.id)).filter(
            SendLog.status == "pending"
        ).scalar()
        
        if pending_count > threshold:
            logger.warning(f"Queue length exceeds threshold: {pending_count}")
            return True
        
        return False
    
    def check_error_rate(self, threshold: float = 0.1):
        """Check if error rate exceeds threshold"""
        last_hour = datetime.utcnow() - timedelta(hours=1)
        
        total_attempts = self.db.query(func.count(SendLog.id)).filter(
            SendLog.created_at >= last_hour
        ).scalar()
        
        failed_attempts = self.db.query(func.count(SendLog.id)).filter(
            SendLog.created_at >= last_hour,
            SendLog.status == "failed"
        ).scalar()
        
        if total_attempts > 0:
            error_rate = failed_attempts / total_attempts
            if error_rate > threshold:
                logger.warning(f"High error rate detected: {error_rate:.2%}")
                return True
        
        return False
