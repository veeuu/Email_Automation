from sqlalchemy.orm import Session
from db.models import Event, Subscriber
from uuid import UUID
from datetime import datetime


class TrackingHandler:
    def __init__(self, db: Session):
        self.db = db
    
    def record_open(self, subscriber_id: UUID, campaign_id: UUID):
        event = Event(
            subscriber_id=subscriber_id,
            campaign_id=campaign_id,
            event_type="open",
            event_data={}
        )
        self.db.add(event)
        
        subscriber = self.db.query(Subscriber).filter(Subscriber.id == subscriber_id).first()
        if subscriber:
            subscriber.last_activity = datetime.utcnow()
        
        self.db.commit()
    
    def record_click(self, subscriber_id: UUID, campaign_id: UUID, link_url: str = None):
        event = Event(
            subscriber_id=subscriber_id,
            campaign_id=campaign_id,
            event_type="click",
            event_data={"link_url": link_url} if link_url else {}
        )
        self.db.add(event)
        
        subscriber = self.db.query(Subscriber).filter(Subscriber.id == subscriber_id).first()
        if subscriber:
            subscriber.last_activity = datetime.utcnow()
        
        self.db.commit()
    
    def record_unsubscribe(self, subscriber_id: UUID):
        subscriber = self.db.query(Subscriber).filter(Subscriber.id == subscriber_id).first()
        if subscriber:
            subscriber.status = "unsubscribed"
            subscriber.last_activity = datetime.utcnow()
            self.db.commit()
