#!/usr/bin/env python3
"""
Setup local SMTP server for testing (MailHog alternative)
Uses Python's built-in smtpd module
"""
import asyncio
import aiosmtpd.controller
from aiosmtpd.handlers import Debugging
import threading
import time

class EmailHandler:
    """Custom handler to capture emails"""
    async def handle_DATA(self, server, session, envelope):
        print(f"\n{'='*60}")
        print("EMAIL CAPTURED")
        print(f"{'='*60}")
        print(f"From: {envelope.mail_from}")
        print(f"To: {envelope.rcpt_tos}")
        print(f"Subject: {envelope.content.decode().split('Subject: ')[1].split('\\n')[0] if 'Subject:' in envelope.content.decode() else 'N/A'}")
        print(f"{'='*60}\n")
        return '250 Message accepted'

def start_smtp_server():
    """Start local SMTP server"""
    handler = EmailHandler()
    controller = aiosmtpd.controller.Controller(handler, hostname='localhost', port=1025)
    
    print("Starting local SMTP server...")
    print("Host: localhost")
    print("Port: 1025")
    
    controller.start()
    print("✓ SMTP server started!")
    print("\nUpdate .env with:")
    print("SMTP_HOST=localhost")
    print("SMTP_PORT=1025")
    print("SMTP_USER=")
    print("SMTP_PASSWORD=")
    print("SMTP_FROM_EMAIL=noreply@example.com")
    print("SMTP_USE_TLS=false")
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nStopping SMTP server...")
        controller.stop()

if __name__ == "__main__":
    print("Local SMTP Server for Email Testing")
    print("="*60)
    
    try:
        start_smtp_server()
    except Exception as e:
        print(f"Error: {e}")
        print("\nAlternatively, use the default config in .env:")
        print("SMTP_HOST=localhost")
        print("SMTP_PORT=1025")
