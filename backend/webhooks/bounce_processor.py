from sqlalchemy.orm import Session
from db.models import SendLog, Suppression
from suppression.list_manager import SuppressionManager
from uuid import UUID
from datetime import datetime


class BounceProcessor:
    def __init__(self, db: Session):
        self.db = db
        self.suppression_manager = SuppressionManager(db)
    
    def process_bounce(self, email: str, bounce_type: str = "permanent", send_log_id: UUID = None):
        """Process bounce notification"""
        if bounce_type == "permanent":
            self.suppression_manager.add_suppression(email, reason=f"bounce_{bounce_type}")
        
        if send_log_id:
            send_log = self.db.query(SendLog).filter(SendLog.id == send_log_id).first()
            if send_log:
                send_log.status = "bounced"
                send_log.updated_at = datetime.utcnow()
                self.db.commit()
    
    def process_webhook(self, provider: str, payload: dict):
        """Process provider webhook"""
        if provider == "sendgrid":
            self._process_sendgrid_webhook(payload)
        elif provider == "mailgun":
            self._process_mailgun_webhook(payload)
    
    def _process_sendgrid_webhook(self, payload: dict):
        """Process SendGrid webhook"""
        for event in payload:
            if event.get("event") == "bounce":
                email = event.get("email")
                bounce_type = event.get("type", "permanent")
                self.process_bounce(email, bounce_type)
    
    def _process_mailgun_webhook(self, payload: dict):
        """Process Mailgun webhook"""
        event_type = payload.get("event-data", {}).get("event")
        if event_type == "failed":
            reason = payload.get("event-data", {}).get("delivery-status", {}).get("description")
            email = payload.get("event-data", {}).get("recipient")
            if "bounce" in reason.lower():
                self.process_bounce(email, "permanent")
