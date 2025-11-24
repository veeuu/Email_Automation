from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from db.session import get_db
from db.models import Campaign, CampaignMetrics, Event
from api.auth import get_current_user
from analytics.aggregator import AnalyticsAggregator
from uuid import UUID
from datetime import datetime

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/campaigns/{campaign_id}/metrics")
def get_campaign_metrics(
    campaign_id: UUID,
    from_date: datetime = Query(None),
    to_date: datetime = Query(None),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    metrics = db.query(CampaignMetrics).filter(CampaignMetrics.campaign_id == campaign_id).first()
    
    if not metrics:
        aggregator = AnalyticsAggregator(db)
        aggregator.compute_metrics(campaign_id)
        metrics = db.query(CampaignMetrics).filter(CampaignMetrics.campaign_id == campaign_id).first()
    
    if not metrics:
        return {
            "campaign_id": str(campaign_id),
            "total_sent": 0,
            "total_opened": 0,
            "total_clicked": 0,
            "total_unsubscribed": 0,
            "total_bounced": 0,
            "open_rate": 0,
            "click_rate": 0
        }
    
    open_rate = (metrics.total_opened / metrics.total_sent * 100) if metrics.total_sent > 0 else 0
    click_rate = (metrics.total_clicked / metrics.total_sent * 100) if metrics.total_sent > 0 else 0
    
    return {
        "campaign_id": str(campaign_id),
        "total_sent": metrics.total_sent,
        "total_opened": metrics.total_opened,
        "total_clicked": metrics.total_clicked,
        "total_unsubscribed": metrics.total_unsubscribed,
        "total_bounced": metrics.total_bounced,
        "open_rate": round(open_rate, 2),
        "click_rate": round(click_rate, 2)
    }


@router.get("/campaigns/{campaign_id}/link-performance")
def get_link_performance(
    campaign_id: UUID,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    events = db.query(Event).filter(
        Event.campaign_id == campaign_id,
        Event.event_type == "click"
    ).all()
    
    link_stats = {}
    for event in events:
        link_url = event.metadata.get("link_url", "unknown")
        if link_url not in link_stats:
            link_stats[link_url] = 0
        link_stats[link_url] += 1
    
    return {"links": link_stats}
