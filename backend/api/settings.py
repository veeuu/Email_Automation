from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.session import get_db
from api.auth import get_current_user
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/settings", tags=["settings"])


class SMTPSettings(BaseModel):
    host: str
    port: int
    user: Optional[str] = None
    password: Optional[str] = None
    use_tls: bool = False
    from_email: str


class DKIMSettings(BaseModel):
    domain: str
    selector: str
    private_key: str


@router.post("/smtp")
def update_smtp_settings(
    settings: SMTPSettings,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # In production, store in secure vault
    return {"status": "updated"}


@router.post("/dkim")
def update_dkim_settings(
    settings: DKIMSettings,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # In production, store in secure vault
    return {"status": "updated"}


@router.get("/dkim/check")
def check_dkim(
    domain: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Check DKIM records
    return {
        "domain": domain,
        "dkim_valid": False,
        "spf_valid": False,
        "dmarc_valid": False
    }
