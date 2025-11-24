#!/usr/bin/env python3
"""
Direct email sending script - configure credentials below
"""
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Gmail Configuration
SMTP_HOST = "smtp.gmail.com"
SMTP_PORT = 587
SENDER_EMAIL = "kamblevidhishaa@gmail.com"
SENDER_PASSWORD = "kamblevidhishaa24"
RECIPIENT_EMAIL = "veeekamble@gmail.com"

def send_email():
    try:
        # Create message
        msg = MIMEMultipart("alternative")
        msg["Subject"] = "Test Email from Email Marketing Platform"
        msg["From"] = SENDER_EMAIL
        msg["To"] = RECIPIENT_EMAIL
        
        # Email content
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
        
        # Send email
        print(f"Connecting to {SMTP_HOST}:{SMTP_PORT}...")
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            print("Logging in...")
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            print(f"Sending email to {RECIPIENT_EMAIL}...")
            server.sendmail(SENDER_EMAIL, RECIPIENT_EMAIL, msg.as_string())
        
        print("✓ Email sent successfully!")
        return True
        
    except smtplib.SMTPAuthenticationError:
        print("✗ Authentication failed. Check your email and app password.")
        return False
    except smtplib.SMTPException as e:
        print(f"✗ SMTP error: {e}")
        return False
    except Exception as e:
        print(f"✗ Error: {e}")
        return False

if __name__ == "__main__":
    print("Email Sending Script")
    print("=" * 50)
    print(f"From: {SENDER_EMAIL}")
    print(f"To: {RECIPIENT_EMAIL}")
    print("=" * 50)
    
    if SENDER_PASSWORD == "your-app-password-here":
        print("\n⚠️  ERROR: Please update SENDER_PASSWORD in the script!")
        print("\nTo get a Gmail App Password:")
        print("1. Go to https://myaccount.google.com/apppasswords")
        print("2. Select 'Mail' and 'Windows Computer'")
        print("3. Copy the 16-character password")
        print("4. Replace 'your-app-password-here' in this script")
    else:
        send_email()
