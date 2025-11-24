from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from db.session import SessionLocal
from db.models import Campaign, SendLog
from workers.worker import send_batch, aggregate_metrics
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

scheduler = BackgroundScheduler()


def schedule_campaigns():
    """Check for campaigns to send and create batch jobs"""
    db = SessionLocal()
    try:
        now = datetime.utcnow()
        campaigns = db.query(Campaign).filter(
            Campaign.status == "scheduled",
            Campaign.schedule_at <= now
        ).all()
        
        for campaign in campaigns:
            campaign.status = "sending"
            db.commit()
            
            # Create send batches
            send_logs = db.query(SendLog).filter(
                SendLog.campaign_id == campaign.id,
                SendLog.status == "pending"
            ).all()
            
            batch_size = 100
            for i in range(0, len(send_logs), batch_size):
                batch = send_logs[i:i+batch_size]
                batch_ids = [str(log.id) for log in batch]
                send_batch.delay(batch_ids[0])
    
    except Exception as e:
        logger.error(f"Error in schedule_campaigns: {str(e)}")
    finally:
        db.close()


def start_scheduler():
    """Start background scheduler"""
    if not scheduler.running:
        scheduler.add_job(
            schedule_campaigns,
            CronTrigger(minute="*/1"),
            id="schedule_campaigns",
            name="Schedule campaigns",
            replace_existing=True
        )
        
        scheduler.add_job(
            aggregate_metrics,
            CronTrigger(hour="*", minute="0"),
            id="aggregate_metrics",
            name="Aggregate metrics",
            replace_existing=True
        )
        
        scheduler.start()
        logger.info("Scheduler started")


def stop_scheduler():
    """Stop background scheduler"""
    if scheduler.running:
        scheduler.shutdown()
        logger.info("Scheduler stopped")
