from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import Response, RedirectResponse
from sqlalchemy.orm import Session
from db.session import get_db
from db.models import Event, Subscriber
from tracking.handlers import TrackingHandler
from tracking.utils import verify_token
import base64

router = APIRouter(prefix="/track", tags=["tracking"])


@router.get("/open")
def track_open(
    token: str = Query(...),
    db: Session = Depends(get_db)
):
    try:
        payload = verify_token(token)
        handler = TrackingHandler(db)
        handler.record_open(payload["subscriber_id"], payload["campaign_id"])
    except Exception:
        pass
    
    # Return 1x1 pixel
    pixel = base64.b64decode("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==")
    return Response(content=pixel, media_type="image/png")


@router.get("/click")
def track_click(
    token: str = Query(...),
    db: Session = Depends(get_db)
):
    try:
        payload = verify_token(token)
        handler = TrackingHandler(db)
        handler.record_click(payload["subscriber_id"], payload["campaign_id"], payload.get("link_url"))
        redirect_url = payload.get("redirect_url", "https://example.com")
        return RedirectResponse(url=redirect_url)
    except Exception:
        return RedirectResponse(url="https://example.com")


@router.get("/unsubscribe")
def unsubscribe(
    token: str = Query(...),
    db: Session = Depends(get_db)
):
    try:
        payload = verify_token(token)
        handler = TrackingHandler(db)
        handler.record_unsubscribe(payload["subscriber_id"])
        return {"status": "unsubscribed"}
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid token")
