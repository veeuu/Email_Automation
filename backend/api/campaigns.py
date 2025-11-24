from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.session import get_db
from db.models import Campaign, Template
from api.auth import get_current_user
from campaigns.manager import CampaignManager
from pydantic import BaseModel, field_validator
from typing import Optional
from uuid import UUID
from datetime import datetime

router = APIRouter(prefix="/campaigns", tags=["campaigns"])


class CampaignRequest(BaseModel):
    name: str
    template_id: UUID
    segment_query: Optional[dict] = None
    schedule_at: Optional[datetime] = None
    send_rate: int = 10
    a_b_config: Optional[dict] = None


class CampaignResponse(BaseModel):
    id: UUID
    name: str
    template_id: UUID
    status: str
    schedule_at: Optional[str]
    send_rate: int
    created_at: str
    
    class Config:
        from_attributes = True
    
    @field_validator('created_at', mode='before')
    @classmethod
    def convert_datetime(cls, v):
        if isinstance(v, datetime):
            return v.isoformat()
        return v


@router.post("", response_model=CampaignResponse)
def create_campaign(
    request: CampaignRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    template = db.query(Template).filter(Template.id == request.template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    manager = CampaignManager(db)
    campaign = manager.create_campaign(
        name=request.name,
        template_id=request.template_id,
        segment_query=request.segment_query,
        schedule_at=request.schedule_at,
        send_rate=request.send_rate,
        a_b_config=request.a_b_config,
        created_by=current_user.id
    )
    return campaign


@router.get("", response_model=list[CampaignResponse])
def list_campaigns(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    campaigns = db.query(Campaign).all()
    return campaigns


@router.get("/{campaign_id}", response_model=CampaignResponse)
def get_campaign(
    campaign_id: UUID,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return campaign


@router.post("/{campaign_id}/schedule")
def schedule_campaign(
    campaign_id: UUID,
    schedule_at: datetime,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    manager = CampaignManager(db)
    campaign = manager.schedule_campaign(campaign_id, schedule_at)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return {"status": "scheduled", "schedule_at": campaign.schedule_at}


class SendTestRequest(BaseModel):
    test_email: str


@router.post("/{campaign_id}/send_test")
def send_test(
    campaign_id: UUID,
    request: SendTestRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    manager = CampaignManager(db)
    result = manager.send_test(campaign_id, request.test_email)
    return result


@router.post("/{campaign_id}/start")
def start_campaign(
    campaign_id: UUID,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    manager = CampaignManager(db)
    campaign = manager.start_campaign(campaign_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return {"status": "sending"}


@router.post("/{campaign_id}/pause")
def pause_campaign(
    campaign_id: UUID,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    manager = CampaignManager(db)
    campaign = manager.pause_campaign(campaign_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return {"status": "paused"}


@router.post("/{campaign_id}/cancel")
def cancel_campaign(
    campaign_id: UUID,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    manager = CampaignManager(db)
    campaign = manager.cancel_campaign(campaign_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return {"status": "cancelled"}
