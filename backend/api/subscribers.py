from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from db.session import get_db
from db.models import Subscriber, Event
from api.auth import get_current_user
from subscribers.service import SubscriberService
from pydantic import BaseModel, field_validator
from typing import List, Optional
from uuid import UUID
import csv
import io
from datetime import datetime

router = APIRouter(prefix="/subscribers", tags=["subscribers"])


class SubscriberResponse(BaseModel):
    id: UUID
    email: str
    name: Optional[str]
    status: str
    tags: dict
    custom_fields: dict
    created_at: str
    
    class Config:
        from_attributes = True
    
    @field_validator('created_at', mode='before')
    @classmethod
    def convert_datetime(cls, v):
        if isinstance(v, datetime):
            return v.isoformat()
        return v


class SubscriberDetailResponse(SubscriberResponse):
    last_activity: Optional[str]
    events: List[dict]


class PaginatedResponse(BaseModel):
    items: List[SubscriberResponse]
    total: int
    page: int
    page_size: int


@router.post("/bulk_import")
async def bulk_import(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    service = SubscriberService(db)
    content = await file.read()
    
    try:
        text_content = content.decode('utf-8')
        reader = csv.DictReader(io.StringIO(text_content))
        rows = list(reader)
        
        import_id, report = service.bulk_import(rows)
        return {
            "import_id": str(import_id),
            "total_rows": report["total_rows"],
            "imported": report["imported"],
            "skipped": report["skipped"],
            "errors": report["errors"]
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("", response_model=PaginatedResponse)
def list_subscribers(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=500),
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    service = SubscriberService(db)
    items, total = service.list_subscribers(page, page_size, status)
    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size
    }


@router.get("/{subscriber_id}", response_model=SubscriberDetailResponse)
def get_subscriber(
    subscriber_id: UUID,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    service = SubscriberService(db)
    subscriber = service.get_subscriber(subscriber_id)
    if not subscriber:
        raise HTTPException(status_code=404, detail="Subscriber not found")
    
    events = db.query(Event).filter(Event.subscriber_id == subscriber_id).order_by(desc(Event.created_at)).limit(100).all()
    
    return {
        **{k: getattr(subscriber, k) for k in ["id", "email", "name", "status", "tags", "custom_fields", "created_at", "last_activity"]},
        "events": [{"event_type": e.event_type, "created_at": e.created_at.isoformat(), "event_data": e.event_data} for e in events]
    }


@router.post("/{subscriber_id}/unsubscribe")
def unsubscribe(
    subscriber_id: UUID,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    service = SubscriberService(db)
    service.unsubscribe(subscriber_id)
    return {"status": "unsubscribed"}


@router.get("/{subscriber_id}/export")
def export_subscribers(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    service = SubscriberService(db)
    csv_data = service.export_csv()
    return {"csv": csv_data}


@router.delete("/{subscriber_id}")
def delete_subscriber(
    subscriber_id: UUID,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    subscriber = db.query(Subscriber).filter(Subscriber.id == subscriber_id).first()
    if not subscriber:
        raise HTTPException(status_code=404, detail="Subscriber not found")
    
    # Delete associated events and send logs
    db.query(Event).filter(Event.subscriber_id == subscriber_id).delete()
    db.query(SendLog).filter(SendLog.subscriber_id == subscriber_id).delete()
    
    # Delete subscriber
    db.delete(subscriber)
    db.commit()
    return {"status": "deleted"}
