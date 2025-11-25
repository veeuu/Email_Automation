#!/usr/bin/env python3
"""
Email Sending Script for Email Marketing Automation
This script sends emails from campaigns to subscribers
Usage: python send_emails.py
"""
import sys
sys.path.insert(0, 'backend')

from db.session import SessionLocal
from db.models import Campaign, SendLog, Subscriber, Template
from dispatcher.smtp_dispatcher import SMTPDispatcher
from templates.render import render_template
from datetime import datetime
import time
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def send_campaign_emails(campaign_id=None):
    """
    Send emails for campaigns that are in 'sending' status
    If campaign_id is provided, send only for that campaign
    """
    db = SessionLocal()
    dispatcher = SMTPDispatcher()
    
    try:
        # Get campaigns to send
        if campaign_id:
            campaigns = db.query(Campaign).filter(
                Campaign.id == campaign_id,
                Campaign.status == 'sending'
            ).all()
        else:
            campaigns = db.query(Campaign).filter(
                Campaign.status == 'sending'
            ).all()
        
        if not campaigns:
            logger.info("No campaigns to send")
            return
        
        for campaign in campaigns:
            logger.info(f"Processing campaign: {campaign.name} ({campaign.id})")
            
            # Get template
            template = db.query(Template).filter(
                Template.id == campaign.template_id
            ).first()
            
            if not template:
                logger.error(f"Template not found for campaign {campaign.id}")
                continue
            
            # Get pending send logs
            pending_logs = db.query(SendLog).filter(
                SendLog.campaign_id == campaign.id,
                SendLog.status == 'pending'
            ).limit(campaign.send_rate).all()
            
            if not pending_logs:
                logger.info(f"No pending emails for campaign {campaign.name}")
                continue
            
            logger.info(f"Sending {len(pending_logs)} emails for campaign {campaign.name}")
            
            for send_log in pending_logs:
                try:
                    # Get subscriber
                    subscriber = db.query(Subscriber).filter(
                        Subscriber.id == send_log.subscriber_id
                    ).first()
                    
                    if not subscriber:
                        logger.warning(f"Subscriber not found: {send_log.subscriber_id}")
                        send_log.status = 'failed'
                        send_log.last_error = 'Subscriber not found'
                        db.commit()
                        continue
                    
                    # Render template with subscriber data
                    subject = render_template(template.subject, subscriber)
                    html = render_template(template.html, subscriber)
                    text = render_template(
                        template.text_content or "",
                        subscriber
                    ) if template.text_content else None
                    
                    # Send email
                    result = dispatcher.send(
                        to_email=subscriber.email,
                        subject=subject,
                        html=html,
                        text=text
                    )
                    
                    # Update send log
                    if result['status'] == 'sent':
                        send_log.status = 'sent'
                        send_log.provider_msg_id = result.get('provider_msg_id')
                        logger.info(f"✓ Email sent to {subscriber.email}")
                    else:
                        send_log.status = 'failed'
                        send_log.last_error = result.get('error', 'Unknown error')
                        send_log.attempts += 1
                        logger.error(f"✗ Failed to send to {subscriber.email}: {result.get('error')}")
                    
                    db.commit()
                    
                    # Rate limiting
                    time.sleep(1.0 / campaign.send_rate)
                    
                except Exception as e:
                    logger.error(f"Error sending email: {str(e)}")
                    send_log.status = 'failed'
                    send_log.last_error = str(e)
                    send_log.attempts += 1
                    db.commit()
            
            logger.info(f"Campaign {campaign.name} batch complete")
    
    except Exception as e:
        logger.error(f"Error processing campaigns: {str(e)}")
    
    finally:
        db.close()

def get_campaign_status(campaign_id):
    """Get the status of a campaign"""
    db = SessionLocal()
    
    try:
        campaign = db.query(Campaign).filter(
            Campaign.id == campaign_id
        ).first()
        
        if not campaign:
            logger.error(f"Campaign not found: {campaign_id}")
            return
        
        total = db.query(SendLog).filter(
            SendLog.campaign_id == campaign_id
        ).count()
        
        sent = db.query(SendLog).filter(
            SendLog.campaign_id == campaign_id,
            SendLog.status == 'sent'
        ).count()
        
        failed = db.query(SendLog).filter(
            SendLog.campaign_id == campaign_id,
            SendLog.status == 'failed'
        ).count()
        
        pending = db.query(SendLog).filter(
            SendLog.campaign_id == campaign_id,
            SendLog.status == 'pending'
        ).count()
        
        logger.info(f"\nCampaign: {campaign.name}")
        logger.info(f"Status: {campaign.status}")
        logger.info(f"Total: {total}")
        logger.info(f"Sent: {sent}")
        logger.info(f"Failed: {failed}")
        logger.info(f"Pending: {pending}")
        
    finally:
        db.close()

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Email Marketing Campaign Sender')
    parser.add_argument('--campaign-id', help='Send emails for specific campaign')
    parser.add_argument('--status', help='Get status of a campaign')
    parser.add_argument('--continuous', action='store_true', help='Run continuously')
    
    args = parser.parse_args()
    
    if args.status:
        get_campaign_status(args.status)
    elif args.continuous:
        logger.info("Starting continuous email sending...")
        try:
            while True:
                send_campaign_emails(args.campaign_id)
                time.sleep(5)  # Check every 5 seconds
        except KeyboardInterrupt:
            logger.info("Stopped")
    else:
        send_campaign_emails(args.campaign_id)
