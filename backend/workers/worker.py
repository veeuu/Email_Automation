from celery import Celery
from config import settings
from db.session import SessionLocal
from db.models import SendLog, Template, Subscriber, Campaign
from dispatcher.smtp_dispatcher import SMTPDispatcher
from templates.render import render_template
from tracking.utils import create_token
from analytics.aggregator import AnalyticsAggregator
from workflows.engine import WorkflowEngine
import logging
import time

logger = logging.getLogger(__name__)

app = Celery(
    "email_marketing",
    broker=settings.celery_broker_url,
    backend=settings.celery_result_backend
)

app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)


@app.task(bind=True, max_retries=3)
def send_batch(self, batch_id: str):
    """Send batch of emails"""
    db = SessionLocal()
    try:
        send_logs = db.query(SendLog).filter(
            SendLog.id == batch_id
        ).all()
        
        dispatcher = SMTPDispatcher()
        
        for send_log in send_logs:
            if send_log.status != "pending":
                continue
            
            subscriber = db.query(Subscriber).filter(
                Subscriber.id == send_log.subscriber_id
            ).first()
            
            campaign = db.query(Campaign).filter(
                Campaign.id == send_log.campaign_id
            ).first()
            
            template = db.query(Template).filter(
                Template.id == campaign.template_id
            ).first()
            
            if not subscriber or not campaign or not template:
                send_log.status = "failed"
                send_log.last_error = "Missing subscriber, campaign, or template"
                db.commit()
                continue
            
            # Render template
            subject = render_template(template.subject, subscriber)
            html = render_template(template.html, subscriber)
            text = render_template(template.text_content or "", subscriber) if template.text_content else None
            
            # Inject tracking pixel
            tracking_token = create_token({
                "subscriber_id": str(subscriber.id),
                "campaign_id": str(campaign.id)
            })
            pixel_url = f"{settings.api_base_url}/track/open?token={tracking_token}"
            html += f'<img src="{pixel_url}" width="1" height="1" alt="" />'
            
            # Send
            result = dispatcher.send(subscriber.email, subject, html, text)
            
            if result["status"] == "sent":
                send_log.status = "sent"
                send_log.provider_msg_id = result.get("provider_msg_id")
            else:
                send_log.status = "failed"
                send_log.last_error = result.get("error")
                send_log.attempts += 1
            
            db.commit()
            
            # Rate limiting
            time.sleep(1.0 / settings.send_rate_limit)
    
    except Exception as exc:
        logger.error(f"Error in send_batch: {str(exc)}")
        raise self.retry(exc=exc, countdown=60)
    finally:
        db.close()


@app.task(bind=True, max_retries=3)
def retry_send(self, send_log_id: str):
    """Retry failed send"""
    db = SessionLocal()
    try:
        send_log = db.query(SendLog).filter(SendLog.id == send_log_id).first()
        if not send_log or send_log.attempts >= 3:
            return
        
        send_batch.delay(str(send_log.id))
    except Exception as exc:
        raise self.retry(exc=exc, countdown=300)
    finally:
        db.close()


@app.task
def aggregate_metrics():
    """Compute campaign metrics"""
    db = SessionLocal()
    try:
        aggregator = AnalyticsAggregator(db)
        aggregator.compute_all_metrics()
    finally:
        db.close()


@app.task
def run_workflow_node(instance_id: str):
    """Execute workflow node"""
    db = SessionLocal()
    try:
        engine = WorkflowEngine(db)
        # Implementation depends on workflow definition storage
        pass
    finally:
        db.close()
