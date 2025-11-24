from sqlalchemy.orm import Session
from db.models import Subscriber, Suppression
from uuid import uuid4
from datetime import datetime
import re


class SubscriberService:
    def __init__(self, db: Session):
        self.db = db
    
    def bulk_import(self, rows: list):
        import_id = uuid4()
        report = {
            "total_rows": len(rows),
            "imported": 0,
            "skipped": 0,
            "errors": []
        }
        
        for idx, row in enumerate(rows):
            try:
                email = row.get("email", "").strip().lower()
                if not self._is_valid_email(email):
                    report["skipped"] += 1
                    continue
                
                if self.db.query(Suppression).filter(Suppression.email == email).first():
                    report["skipped"] += 1
                    continue
                
                existing = self.db.query(Subscriber).filter(Subscriber.email == email).first()
                if existing:
                    report["skipped"] += 1
                    continue
                
                subscriber = Subscriber(
                    email=email,
                    name=row.get("name", ""),
                    status="active",
                    tags={"import_source": row.get("source", "csv")},
                    custom_fields={k: v for k, v in row.items() if k not in ["email", "name"]},
                    import_id=import_id
                )
                self.db.add(subscriber)
                report["imported"] += 1
            except Exception as e:
                report["errors"].append(f"Row {idx}: {str(e)}")
                report["skipped"] += 1
        
        self.db.commit()
        return import_id, report
    
    def list_subscribers(self, page: int, page_size: int, status: str = None):
        query = self.db.query(Subscriber)
        if status:
            query = query.filter(Subscriber.status == status)
        
        total = query.count()
        items = query.offset((page - 1) * page_size).limit(page_size).all()
        return items, total
    
    def get_subscriber(self, subscriber_id):
        return self.db.query(Subscriber).filter(Subscriber.id == subscriber_id).first()
    
    def unsubscribe(self, subscriber_id):
        subscriber = self.get_subscriber(subscriber_id)
        if subscriber:
            subscriber.status = "unsubscribed"
            subscriber.updated_at = datetime.utcnow()
            self.db.commit()
    
    def export_csv(self):
        subscribers = self.db.query(Subscriber).all()
        csv_lines = ["email,name,status,created_at"]
        for sub in subscribers:
            csv_lines.append(f"{sub.email},{sub.name},{sub.status},{sub.created_at}")
        return "\n".join(csv_lines)
    
    @staticmethod
    def _is_valid_email(email: str) -> bool:
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None
