from sqlalchemy import Column, String, Integer, DateTime, Text, Boolean, ForeignKey, JSON, UniqueConstraint, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime

Base = declarative_base()


class Subscriber(Base):
    __tablename__ = "subscribers"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(255))
    status = Column(String(50), nullable=False, default="active")  # active, unsubscribed, bounced
    tags = Column(JSON, default={})
    custom_fields = Column(JSON, default={})
    import_id = Column(UUID(as_uuid=True), nullable=True)
    last_activity = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    send_logs = relationship("SendLog", back_populates="subscriber")
    events = relationship("Event", back_populates="subscriber")
    workflow_instances = relationship("WorkflowInstance", back_populates="subscriber")


class Template(Base):
    __tablename__ = "templates"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    subject = Column(Text, nullable=False)
    html = Column(Text, nullable=False)
    text_content = Column(Text)
    version = Column(Integer, default=1)
    created_by = Column(UUID(as_uuid=True))
    created_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    campaigns = relationship("Campaign", back_populates="template")


class Campaign(Base):
    __tablename__ = "campaigns"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    template_id = Column(UUID(as_uuid=True), ForeignKey("templates.id"), nullable=False)
    segment_query = Column(JSON)
    schedule_at = Column(DateTime(timezone=True))
    send_rate = Column(Integer, default=10)  # emails per second
    a_b_config = Column(JSON)
    status = Column(String(50), nullable=False, default="draft")  # draft, scheduled, sending, sent, paused, cancelled
    created_by = Column(UUID(as_uuid=True))
    created_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    template = relationship("Template", back_populates="campaigns")
    send_logs = relationship("SendLog", back_populates="campaign")
    events = relationship("Event", back_populates="campaign")


class SendLog(Base):
    __tablename__ = "send_logs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    campaign_id = Column(UUID(as_uuid=True), ForeignKey("campaigns.id"), nullable=False, index=True)
    subscriber_id = Column(UUID(as_uuid=True), ForeignKey("subscribers.id"), nullable=False, index=True)
    provider_msg_id = Column(String(255))
    status = Column(String(50), nullable=False, default="pending")  # pending, sent, failed, bounced
    attempts = Column(Integer, default=0)
    last_error = Column(Text)
    created_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    campaign = relationship("Campaign", back_populates="send_logs")
    subscriber = relationship("Subscriber", back_populates="send_logs")
    
    __table_args__ = (
        Index("idx_campaign_subscriber", "campaign_id", "subscriber_id"),
    )


class Event(Base):
    __tablename__ = "events"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    subscriber_id = Column(UUID(as_uuid=True), ForeignKey("subscribers.id"), nullable=False, index=True)
    campaign_id = Column(UUID(as_uuid=True), ForeignKey("campaigns.id"), nullable=False, index=True)
    event_type = Column(String(50), nullable=False)  # open, click, unsubscribe, bounce
    event_data = Column(JSON, default={})
    created_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow, index=True)
    
    subscriber = relationship("Subscriber", back_populates="events")
    campaign = relationship("Campaign", back_populates="events")


class WorkflowInstance(Base):
    __tablename__ = "workflow_instances"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    flow_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    subscriber_id = Column(UUID(as_uuid=True), ForeignKey("subscribers.id"), nullable=False, index=True)
    current_node = Column(String(255))
    state = Column(JSON, default={})
    started_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    subscriber = relationship("Subscriber", back_populates="workflow_instances")


class Suppression(Base):
    __tablename__ = "suppressions"
    
    email = Column(String(255), primary_key=True)
    reason = Column(String(255))
    created_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)


class CampaignMetrics(Base):
    __tablename__ = "campaign_metrics"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    campaign_id = Column(UUID(as_uuid=True), ForeignKey("campaigns.id"), nullable=False, unique=True)
    total_sent = Column(Integer, default=0)
    total_opened = Column(Integer, default=0)
    total_clicked = Column(Integer, default=0)
    total_unsubscribed = Column(Integer, default=0)
    total_bounced = Column(Integer, default=0)
    computed_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)


class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255))
    role = Column(String(50), default="user")  # admin, user
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)


class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    action = Column(String(255), nullable=False)
    resource_type = Column(String(100))
    resource_id = Column(UUID(as_uuid=True))
    details = Column(JSON)
    created_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow, index=True)
