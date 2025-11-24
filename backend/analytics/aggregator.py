from sqlalchemy.orm import Session
from db.models import Event, SendLog, CampaignMetrics, Campaign
from uuid import UUID
from datetime import datetime


class AnalyticsAggregator:
    def __init__(self, db: Session):
        self.db = db
    
    def compute_metrics(self, campaign_id: UUID):
        """Compute and store campaign metrics"""
        total_sent = self.db.query(SendLog).filter(
            SendLog.campaign_id == campaign_id,
            SendLog.status.in_(["sent", "failed", "bounced"])
        ).count()
        
        total_opened = self.db.query(Event).filter(
            Event.campaign_id == campaign_id,
            Event.event_type == "open"
        ).count()
        
        total_clicked = self.db.query(Event).filter(
            Event.campaign_id == campaign_id,
            Event.event_type == "click"
        ).count()
        
        total_unsubscribed = self.db.query(Event).filter(
            Event.campaign_id == campaign_id,
            Event.event_type == "unsubscribe"
        ).count()
        
        total_bounced = self.db.query(SendLog).filter(
            SendLog.campaign_id == campaign_id,
            SendLog.status == "bounced"
        ).count()
        
        existing = self.db.query(CampaignMetrics).filter(
            CampaignMetrics.campaign_id == campaign_id
        ).first()
        
        if existing:
            existing.total_sent = total_sent
            existing.total_opened = total_opened
            existing.total_clicked = total_clicked
            existing.total_unsubscribed = total_unsubscribed
            existing.total_bounced = total_bounced
            existing.updated_at = datetime.utcnow()
        else:
            metrics = CampaignMetrics(
                campaign_id=campaign_id,
                total_sent=total_sent,
                total_opened=total_opened,
                total_clicked=total_clicked,
                total_unsubscribed=total_unsubscribed,
                total_bounced=total_bounced
            )
            self.db.add(metrics)
        
        self.db.commit()
    
    def compute_all_metrics(self):
        """Compute metrics for all campaigns"""
        campaigns = self.db.query(Campaign).all()
        for campaign in campaigns:
            self.compute_metrics(campaign.id)
