import pytest
from tracking.utils import create_token, verify_token


def test_create_and_verify_token():
    data = {
        "subscriber_id": "123",
        "campaign_id": "456"
    }
    
    token = create_token(data)
    assert token is not None
    
    verified = verify_token(token)
    assert verified["subscriber_id"] == "123"
    assert verified["campaign_id"] == "456"


def test_verify_invalid_token():
    with pytest.raises(ValueError):
        verify_token("invalid_token")


def test_verify_tampered_token():
    data = {"subscriber_id": "123"}
    token = create_token(data)
    
    # Tamper with token
    tampered = token[:-5] + "xxxxx"
    
    with pytest.raises(ValueError):
        verify_token(tampered)
