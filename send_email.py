#!/usr/bin/env python3
"""
Quick script to send a test email
"""
import sys
sys.path.insert(0, 'backend')

from dispatcher.smtp_dispatcher import SMTPDispatcher
from config import settings
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Update settings for Gmail
settings.smtp_host = "smtp.gmail.com"
settings.smtp_port = 587
settings.smtp_user = "kamblevidhishaa@gmail.com"
settings.smtp_password = input("Enter Gmail App Password: ")  # Use app-specific password
settings.smtp_from_email = "kamblevidhishaa@gmail.com"
settings.smtp_use_tls = True

# Create dispatcher
dispatcher = SMTPDispatcher()

# Send email
subject = "Test Email from Email Marketing Platform"
html = """
<html>
  <body>
    <h1>Hello!</h1>
    <p>This is a test email from the Email Marketing Automation platform.</p>
    <p>If you received this, the email sending is working correctly!</p>
    <br>
    <p>Best regards,<br>Email Marketing Team</p>
  </body>
</html>
"""

text = """
Hello!

This is a test email from the Email Marketing Automation platform.

If you received this, the email sending is working correctly!

Best regards,
Email Marketing Team
"""

print("Sending email...")
result = dispatcher.send(
    to_email="veeekamble@gmail.com",
    subject=subject,
    html=html,
    text=text
)

print(f"\nResult: {result}")

if result["status"] == "sent":
    print("✓ Email sent successfully!")
else:
    print(f"✗ Failed to send email: {result['error']}")
