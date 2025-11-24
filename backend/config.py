from pydantic_settings import BaseSettings
from typing import Optional
import os


class Settings(BaseSettings):
    # Database
    database_url: str = "sqlite:///./email_marketing.db"
    
    # Redis
    redis_url: str = "redis://localhost:6379/0"
    
    # SMTP
    smtp_host: str = "localhost"
    smtp_port: int = 1025
    smtp_user: Optional[str] = None
    smtp_password: Optional[str] = None
    smtp_from_email: str = "noreply@example.com"
    smtp_use_tls: bool = False
    
    # DKIM
    dkim_private_key_path: Optional[str] = None
    dkim_selector: str = "default"
    dkim_domain: str = "example.com"
    
    # JWT
    secret_key: str = "your-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # API
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    api_base_url: str = "http://localhost:8000"
    
    # Celery
    celery_broker_url: str = "redis://localhost:6379/1"
    celery_result_backend: str = "redis://localhost:6379/2"
    
    # Scheduler
    scheduler_enabled: bool = True
    
    # Sending
    send_batch_size: int = 100
    send_rate_limit: int = 10  # emails per second
    
    # Tracking
    tracking_token_secret: str = "tracking-secret-key"
    
    # Retention
    event_retention_days: int = 90
    log_retention_days: int = 365
    
    class Config:
        env_file = ".env"
        case_sensitive = False
        extra = "ignore"


settings = Settings()
