#!/usr/bin/env python3
"""
Send email via the backend API
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
    print("=" * 60)
    print("Email Sending via Backend API")
    print("=" * 60)
    
    # Step 1: Create a template
    print("\n1. Creating email template...")
    template = Template(
        id=uuid4(),
        name="Test Email",
        subject="Test Email from Email Marketing Platform",
        html="""
<html>
  <body>
    <h1>Hello {{name}}!</h1>
    <p>This is a test email from the Email Marketing Automation platform.</p>
    <p>If you received this, the email sending is working correctly!</p>
    <br>
    <p>Best regards,<br>Email Marketing Team</p>
  </body>
</html>
""",
        text_content="""
Hello {{name}}!

This is a test email from the Email Marketing Automation platform.

If you received this, the email sending is working correctly!

Best regards,
Email Marketing Team
""",
        version=1,
        created_by=uuid4()
    )
    db.add(template)
    db.commit()
    print(f"✓ Template created: {template.id}")
    
    # Step 2: Create a subscriber
    print("\n2. Creating subscriber...")
    subscriber = Subscriber(
        id=uuid4(),
        email="veeekamble@gmail.com",
        name="Vee Kamble",
        status="active"
    )
    db.add(subscriber)
    db.commit()
    print(f"✓ Subscriber created: {subscriber.email}")
    
    # Step 3: Create a campaign
    print("\n3. Creating campaign...")
    manager = CampaignManager(db)
    campaign = manager.create_campaign(
        name="Test Campaign",
        template_id=template.id,
        send_rate=10,
        created_by=uuid4()
    )
    print(f"✓ Campaign created: {campaign.id}")
    
    # Step 4: Send test email
    print("\n4. Sending test email...")
    result = manager.send_test(campaign.id, "veeekamble@gmail.com")
    print(f"✓ Result: {result}")
    
    if result.get("status") == "sent":
        print("\n" + "=" * 60)
        print("✓ EMAIL SENT SUCCESSFULLY!")
        print("=" * 60)
        print(f"From: kamblevidhishaa@gmail.com")
        print(f"To: veeekamble@gmail.com")
        print(f"Subject: {template.subject}")
    else:
        print(f"\n✗ Failed to send: {result.get('error')}")
    
except Exception as e:
    print(f"\n✗ Error: {e}")
    import traceback
    traceback.print_exc()

finally:
    db.close()
