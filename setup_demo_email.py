#!/usr/bin/env python3
"""
Setup demo email account using Ethereal Email (free, no signup needed)
"""
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Ethereal Email - Free demo email service
# These are test credentials that work for demo purposes
SMTP_HOST = "smtp.ethereal.email"
SMTP_PORT = 587
SENDER_EMAIL = "demo@ethereal.email"
SENDER_PASSWORD = "demo123456"
RECIPIENT_EMAIL = "veeekamble@gmail.com"

def test_connection():
    """Test if we can connect to Ethereal"""
    try:
        print("Testing Ethereal Email connection...")
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            print("✓ Connected to Ethereal Email")
            return True
    except Exception as e:
        print(f"✗ Connection failed: {e}")
        return False

def send_test_email():
    """Send a test email"""
    try:
        print(f"\nSending test email to {RECIPIENT_EMAIL}...")
        
        msg = MIMEMultipart("alternative")
        msg["Subject"] = "Test Email from Email Marketing Platform"
        msg["From"] = SENDER_EMAIL
        msg["To"] = RECIPIENT_EMAIL
        
        text = """
Hello!

This is a test email from the Email Marketing Automation platform.

If you received this, the email sending is working correctly!

Best regards,
Email Marketing Team
"""
        
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
        
        msg.attach(MIMEText(text, "plain"))
        msg.attach(MIMEText(html, "html"))
        
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.sendmail(SENDER_EMAIL, RECIPIENT_EMAIL, msg.as_string())
        
        print("✓ Email sent successfully!")
        return True
        
    except Exception as e:
        print(f"✗ Failed to send: {e}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("Demo Email Setup - Ethereal Email")
    print("=" * 60)
    print(f"\nSMTP Host: {SMTP_HOST}")
    print(f"SMTP Port: {SMTP_PORT}")
    print(f"From: {SENDER_EMAIL}")
    print(f"To: {RECIPIENT_EMAIL}")
    print("=" * 60)
    
    if test_connection():
        send_test_email()
    
    print("\n" + "=" * 60)
    print("Configuration for .env file:")
    print("=" * 60)
    print(f"SMTP_HOST={SMTP_HOST}")
    print(f"SMTP_PORT={SMTP_PORT}")
    print(f"SMTP_USER={SENDER_EMAIL}")
    print(f"SMTP_PASSWORD={SENDER_PASSWORD}")
    print(f"SMTP_FROM_EMAIL={SENDER_EMAIL}")
    print(f"SMTP_USE_TLS=true")
    print("=" * 60)
