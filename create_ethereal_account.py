#!/usr/bin/env python3
"""
Create a free Ethereal Email account for testing
"""
import requests
import json

def create_ethereal_account():
    """Create a free Ethereal Email account"""
    try:
        print("Creating free Ethereal Email account...")
        
        response = requests.post(
            "https://api.ethereal.email/users",
            json={},
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 201:
            data = response.json()
            
            print("\n" + "=" * 60)
            print("✓ Ethereal Email Account Created!")
            print("=" * 60)
            print(f"\nEmail: {data['user']}")
            print(f"Password: {data['pass']}")
            print(f"\nSMTP Configuration:")
            print(f"  Host: {data['smtp']['host']}")
            print(f"  Port: {data['smtp']['port']}")
            print(f"  Secure: {data['smtp']['secure']}")
            print(f"\nWeb Preview URL: {data['web']}")
            
            print("\n" + "=" * 60)
            print("Update your .env file with:")
            print("=" * 60)
            print(f"SMTP_HOST={data['smtp']['host']}")
            print(f"SMTP_PORT={data['smtp']['port']}")
            print(f"SMTP_USER={data['user']}")
            print(f"SMTP_PASSWORD={data['pass']}")
            print(f"SMTP_FROM_EMAIL={data['user']}")
            print(f"SMTP_USE_TLS=true")
            
            print("\n" + "=" * 60)
            print("Then restart the backend and run:")
            print("python send_via_api.py")
            print("=" * 60)
            
            return data
        else:
            print(f"✗ Failed to create account: {response.status_code}")
            print(response.text)
            return None
            
    except Exception as e:
        print(f"✗ Error: {e}")
        return None

if __name__ == "__main__":
    print("Ethereal Email - Free Testing Service")
    print("=" * 60)
    create_ethereal_account()
