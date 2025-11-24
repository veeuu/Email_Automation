#!/usr/bin/env python3
"""
Simple local SMTP server that captures emails using aiosmtpd
Run this in a separate terminal: python local_smtp_server.py
"""
import asyncio
from aiosmtpd.controller import Controller
from aiosmtpd.handlers import Debugging

class CapturingHandler:
    async def handle_DATA(self, server, session, envelope):
        print("\n" + "="*70)
        print("EMAIL CAPTURED")
        print("="*70)
        print(f"From: {envelope.mail_from}")
        print(f"To: {', '.join(envelope.rcpt_tos)}")
        print(f"\nContent:\n{envelope.content.decode('utf-8', errors='ignore')}")
        print("="*70 + "\n")
        return '250 Message accepted'

if __name__ == '__main__':
    handler = CapturingHandler()
    controller = Controller(handler, hostname='localhost', port=1025)
    
    print("Local SMTP Server starting on localhost:1025...")
    controller.start()
    print("✓ Local SMTP Server started!")
    print("Emails will be captured and displayed here")
    print("Press Ctrl+C to stop\n")
    
    try:
        asyncio.get_event_loop().run_forever()
    except KeyboardInterrupt:
        print("\nStopping server...")
        controller.stop()
        print("Server stopped")
