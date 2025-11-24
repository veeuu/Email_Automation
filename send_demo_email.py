#!/usr/bin/env python3
"""
Send email using demo SMTP service
"""
import sys
sys.path.insert(0, 'backend')

from db.session import SessionLocal
from db.models import Template, Subscriber, Campaign
from campaigns.manager import CampaignManager
from uuid import uuid4
from datetime import datetime

# Create database session
db = SessionLocal()

try:
    print("=" * 70)
    print("SENDING EMAIL VIA DEMO SMTP SERVICE")
    print("=" * 70)
    
    # Step 1: Create a template
    print("\n[1/4] Creating email template...")
    template = Template(
        id=uuid4(),
        name="Demo Email Template",
        subject="Welcome to Email Marketing Platform! 🎉",
        html="""
<html>
  <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #2c3e50;">Hello {{name}}! 👋</h1>
      
      <p>This is a test email from the <strong>Email Marketing Automation Platform</strong>.</p>
      
      <p>If you received this email, it means:</p>
      <ul>
        <li>✓ The email system is working correctly</li>
        <li>✓ Your subscriber list is configured</li>
        <li>✓ Campaigns can be sent successfully</li>
      </ul>
      
      <p>You can now:</p>
      <ol>
        <li>Create email templates</li>
        <li>Import subscriber lists</li>
        <li>Set up automated campaigns</li>
        <li>Track email metrics</li>
      </ol>
      
      <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
      
      <p style="color: #7f8c8d; font-size: 12px;">
        Best regards,<br>
        <strong>Email Marketing Team</strong><br>
        <em>Automated Email Delivery System</em>
      </p>
    </div>
  </body>
</html>
""",
        text_content="""
Hello {{name}}!

This is a test email from the Email Marketing Automation Platform.

If you received this email, it means:
✓ The email system is working correctly
✓ Your subscriber list is configured
✓ Campaigns can be sent successfully

You can now:
1. Create email templates
2. Import subscriber lists
3. Set up automated campaigns
4. Track email metrics

Best regards,
Email Marketing Team
Automated Email Delivery System
""",
        version=1,
        created_by=uuid4()
    )
    db.add(template)
    db.commit()
    print(f"   ✓ Template created: {template.id}")
    
    # Step 2: Create a subscriber
    print("\n[2/4] Creating subscriber...")
    subscriber = Subscriber(
        id=uuid4(),
        email="veeekamble@gmail.com",
        name="Vee Kamble",
        status="active"
    )
    db.add(subscriber)
    db.commit()
    print(f"   ✓ Subscriber created: {subscriber.email}")
    
    # Step 3: Create a campaign
    print("\n[3/4] Creating campaign...")
    manager = CampaignManager(db)
    campaign = manager.create_campaign(
        name="Demo Campaign - Test Email",
        template_id=template.id,
        send_rate=10,
        created_by=uuid4()
    )
    print(f"   ✓ Campaign created: {campaign.id}")
    
    # Step 4: Send test email
    print("\n[4/4] Sending test email...")
    result = manager.send_test(campaign.id, "veeekamble@gmail.com")
    
    print("\n" + "=" * 70)
    if result.get("status") == "sent":
        print("✓ EMAIL SENT SUCCESSFULLY!")
        print("=" * 70)
        print(f"From: noreply@emailmarketing.com")
        print(f"To: veeekamble@gmail.com")
        print(f"Subject: {template.subject}")
        print(f"Status: {result['status']}")
        print("\nThe email should arrive in veeekamble@gmail.com inbox shortly!")
    else:
        print("✗ FAILED TO SEND EMAIL")
        print("=" * 70)
        print(f"Error: {result.get('error')}")
        print("\nTroubleshooting:")
        print("1. Check that backend is running")
        print("2. Verify SMTP settings in .env")
        print("3. Check internet connection")
    
    print("=" * 70)
    
except Exception as e:
    print(f"\n✗ Error: {e}")
    import traceback
    traceback.print_exc()

finally:
    db.close()
