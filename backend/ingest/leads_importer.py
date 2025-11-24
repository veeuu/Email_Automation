import csv
import io
from sqlalchemy.orm import Session
from db.models import Subscriber, Suppression
from uuid import uuid4
from datetime import datetime
import re


class LeadsImporter:
    def __init__(self, db: Session):
        self.db = db
    
    def import_csv(self, file_content: bytes, encoding: str = 'utf-8'):
        """Import subscribers from CSV"""
        import_id = uuid4()
        report = {
            "import_id": str(import_id),
            "total_rows": 0,
            "imported": 0,
            "skipped": 0,
            "errors": []
        }
        
        try:
            text_content = file_content.decode(encoding)
            reader = csv.DictReader(io.StringIO(text_content))
            
            for idx, row in enumerate(reader, 1):
                report["total_rows"] += 1
                
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
                        tags={"import_source": "csv"},
                        custom_fields={k: v for k, v in row.items() if k not in ["email", "name"]},
                        import_id=import_id
                    )
                    self.db.add(subscriber)
                    report["imported"] += 1
                
                except Exception as e:
                    report["errors"].append(f"Row {idx}: {str(e)}")
                    report["skipped"] += 1
            
            self.db.commit()
        
        except Exception as e:
            report["errors"].append(f"Import failed: {str(e)}")
        
        return report
    
    @staticmethod
    def _is_valid_email(email: str) -> bool:
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None
