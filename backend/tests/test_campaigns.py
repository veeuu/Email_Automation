import pytest
from uuid import uuid4
from db.models import Campaign, Template, Subscriber, SendLog
from campaigns.manager import CampaignManager


def test_create_campaign(db_session):
    template = Template(
        id=uuid4(),
        name="Test Template",
        subject="Test Subject",
        html="<p>Test</p>"
    )
    db_session.add(template)
    db_session.commit()
    
    manager = CampaignManager(db_session)
    campaign = manager.create_campaign(
        name="Test Campaign",
        template_id=template.id,
        send_rate=10
    )
    
    assert campaign.name == "Test Campaign"
    assert campaign.status == "draft"
    assert campaign.send_rate == 10


def test_schedule_campaign(db_session):
    from datetime import datetime, timedelta
    
    template = Template(
        id=uuid4(),
        name="Test Template",
        subject="Test Subject",
        html="<p>Test</p>"
    )
    db_session.add(template)
    db_session.commit()
    
    manager = CampaignManager(db_session)
    campaign = manager.create_campaign(
        name="Test Campaign",
        template_id=template.id
    )
    
    schedule_time = datetime.utcnow() + timedelta(hours=1)
    updated = manager.schedule_campaign(campaign.id, schedule_time)
    
    assert updated.status == "scheduled"
    assert updated.schedule_at == schedule_time


def test_create_send_logs(db_session):
    template = Template(
        id=uuid4(),
        name="Test Template",
        subject="Test Subject",
        html="<p>Test</p>"
    )
    db_session.add(template)
    
    subscriber = Subscriber(
        id=uuid4(),
        email="test@example.com",
        status="active"
    )
    db_session.add(subscriber)
    db_session.commit()
    
    manager = CampaignManager(db_session)
    campaign = manager.create_campaign(
        name="Test Campaign",
        template_id=template.id
    )
    
    manager.start_campaign(campaign.id)
    
    send_logs = db_session.query(SendLog).filter(
        SendLog.campaign_id == campaign.id
    ).all()
    
    assert len(send_logs) > 0
    assert send_logs[0].status == "pending"
