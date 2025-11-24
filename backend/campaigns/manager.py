from sqlalchemy.orm import Session
from db.models import Campaign, SendLog, Subscriber, Suppression, Template
from uuid import UUID, uuid4
from datetime import datetime
from dispatcher.smtp_dispatcher import SMTPDispatcher
from templates.render import render_template


class CampaignManager:
    def __init__(self, db: Session):
        self.db = db
    
    def create_campaign(self, name: str, template_id: UUID, segment_query: dict = None, 
                       schedule_at: datetime = None, send_rate: int = 10, 
                       a_b_config: dict = None, created_by: UUID = None):
        campaign = Campaign(
            name=name,
            template_id=template_id,
            segment_query=segment_query,
            schedule_at=schedule_at,
            send_rate=send_rate,
            a_b_config=a_b_config,
            status="draft",
            created_by=created_by
        )
        self.db.add(campaign)
        self.db.commit()
        self.db.refresh(campaign)
        return campaign
    
    def schedule_campaign(self, campaign_id: UUID, schedule_at: datetime):
        campaign = self.db.query(Campaign).filter(Campaign.id == campaign_id).first()
        if not campaign:
            return None
        
        campaign.schedule_at = schedule_at
        campaign.status = "scheduled"
        campaign.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(campaign)
        return campaign
    
    def start_campaign(self, campaign_id: UUID):
        campaign = self.db.query(Campaign).filter(Campaign.id == campaign_id).first()
        if not campaign:
            return None
        
        campaign.status = "sending"
        campaign.updated_at = datetime.utcnow()
        self.db.commit()
        
        # Create send logs for all non-suppressed subscribers
        self._create_send_logs(campaign_id)
        return campaign
    
    def pause_campaign(self, campaign_id: UUID):
        campaign = self.db.query(Campaign).filter(Campaign.id == campaign_id).first()
        if not campaign:
            return None
        
        campaign.status = "paused"
        campaign.updated_at = datetime.utcnow()
        self.db.commit()
        return campaign
    
    def cancel_campaign(self, campaign_id: UUID):
        campaign = self.db.query(Campaign).filter(Campaign.id == campaign_id).first()
        if not campaign:
            return None
        
        campaign.status = "cancelled"
        campaign.updated_at = datetime.utcnow()
        self.db.commit()
        return campaign
    
    def send_test(self, campaign_id: UUID, test_email: str):
        campaign = self.db.query(Campaign).filter(Campaign.id == campaign_id).first()
        if not campaign:
            return {"error": "Campaign not found"}
        
        template = self.db.query(Template).filter(Template.id == campaign.template_id).first()
        if not template:
            return {"error": "Template not found"}
        
        # Create mock subscriber for rendering
        mock_subscriber = Subscriber(email=test_email, name="Test User")
        
        subject = render_template(template.subject, mock_subscriber)
        html = render_template(template.html, mock_subscriber)
        text = render_template(template.text_content or "", mock_subscriber) if template.text_content else None
        
        dispatcher = SMTPDispatcher()
        result = dispatcher.send(test_email, subject, html, text)
        return result
    
    def _create_send_logs(self, campaign_id: UUID):
        campaign = self.db.query(Campaign).filter(Campaign.id == campaign_id).first()
        if not campaign:
            return
        
        # Get all active subscribers not in suppression list
        suppressed_emails = self.db.query(Suppression.email).all()
        suppressed_set = {s[0] for s in suppressed_emails}
        
        subscribers = self.db.query(Subscriber).filter(
            Subscriber.status == "active"
        ).all()
        
        for subscriber in subscribers:
            if subscriber.email not in suppressed_set:
                send_log = SendLog(
                    campaign_id=campaign_id,
                    subscriber_id=subscriber.id,
                    status="pending"
                )
                self.db.add(send_log)
        
        self.db.commit()
