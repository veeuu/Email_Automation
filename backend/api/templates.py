from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.session import get_db
from db.models import Template, Subscriber
from api.auth import get_current_user
from templates.service import TemplateService
from templates.render import render_template
from pydantic import BaseModel, field_validator
from typing import Optional
from uuid import UUID
from datetime import datetime

router = APIRouter(prefix="/templates", tags=["templates"])


class TemplateRequest(BaseModel):
    name: str
    subject: str
    html: str
    text_content: Optional[str] = None


class TemplateResponse(BaseModel):
    id: UUID
    name: str
    subject: str
    html: str
    text_content: Optional[str]
    version: int
    created_at: str
    
    class Config:
        from_attributes = True
    
    @field_validator('created_at', mode='before')
    @classmethod
    def convert_datetime(cls, v):
        if isinstance(v, datetime):
            return v.isoformat()
        return v


@router.get("", response_model=list[TemplateResponse])
def list_templates(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    templates = db.query(Template).all()
    return templates


@router.post("", response_model=TemplateResponse)
def create_template(
    request: TemplateRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    service = TemplateService(db)
    template = service.create_template(
        name=request.name,
        subject=request.subject,
        html=request.html,
        text_content=request.text_content,
        created_by=current_user.id
    )
    return template


@router.get("/{template_id}", response_model=TemplateResponse)
def get_template(
    template_id: UUID,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    template = db.query(Template).filter(Template.id == template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    return template


@router.put("/{template_id}", response_model=TemplateResponse)
def update_template(
    template_id: UUID,
    request: TemplateRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    service = TemplateService(db)
    template = service.update_template(
        template_id=template_id,
        name=request.name,
        subject=request.subject,
        html=request.html,
        text_content=request.text_content
    )
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    return template


@router.post("/{template_id}/preview")
def preview_template(
    template_id: UUID,
    subscriber_id: Optional[UUID] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    template = db.query(Template).filter(Template.id == template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    subscriber = None
    if subscriber_id:
        subscriber = db.query(Subscriber).filter(Subscriber.id == subscriber_id).first()
    
    subject = render_template(template.subject, subscriber)
    html = render_template(template.html, subscriber)
    text = render_template(template.text_content or "", subscriber) if template.text_content else None
    
    return {
        "subject": subject,
        "html": html,
        "text": text
    }


@router.delete("/{template_id}")
def delete_template(
    template_id: UUID,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    template = db.query(Template).filter(Template.id == template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    db.delete(template)
    db.commit()
    return {"status": "deleted"}
