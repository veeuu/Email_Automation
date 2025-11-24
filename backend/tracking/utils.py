import hmac
import hashlib
import json
import base64
from config import settings
from uuid import UUID


def create_token(data: dict) -> str:
    """Create HMAC-signed token for tracking links"""
    payload = json.dumps(data)
    signature = hmac.new(
        settings.tracking_token_secret.encode(),
        payload.encode(),
        hashlib.sha256
    ).digest()
    
    token = base64.urlsafe_b64encode(signature + payload.encode()).decode()
    return token


def verify_token(token: str) -> dict:
    """Verify and decode HMAC-signed token"""
    try:
        decoded = base64.urlsafe_b64decode(token.encode())
        signature = decoded[:32]
        payload = decoded[32:]
        
        expected_signature = hmac.new(
            settings.tracking_token_secret.encode(),
            payload,
            hashlib.sha256
        ).digest()
        
        if not hmac.compare_digest(signature, expected_signature):
            raise ValueError("Invalid signature")
        
        data = json.loads(payload.decode())
        return data
    except Exception as e:
        raise ValueError(f"Invalid token: {str(e)}")
