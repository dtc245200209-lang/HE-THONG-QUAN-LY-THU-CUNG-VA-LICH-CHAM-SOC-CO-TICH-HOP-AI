import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, Float, ForeignKey, Text, Enum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
import enum

from app.core.database import Base

class CareSessionStatus(str, enum.Enum):
    PENDING = "PENDING"
    ACTIVE = "ACTIVE"
    PAUSED = "PAUSED"
    COMPLETED = "COMPLETED"

class CareSession(Base):
    __tablename__ = "care_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    appointment_id = Column(UUID(as_uuid=True), ForeignKey("appointments.id"), unique=True, nullable=False)
    caregiver_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    status = Column(Enum(CareSessionStatus), default=CareSessionStatus.PENDING)
    started_at = Column(DateTime(timezone=True))
    ended_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    appointment = relationship("Appointment")
    caregiver = relationship("User")
    events = relationship("CareEvent", back_populates="session", cascade="all, delete-orphan")
    report = relationship("CareReport", back_populates="session", uselist=False)

class CareEventType(str, enum.Enum):
    TEXT = "TEXT"
    PHOTO = "PHOTO"
    VIDEO = "VIDEO"
    VITALS_UPDATE = "VITALS_UPDATE"
    SYSTEM = "SYSTEM"

class CareEvent(Base):
    __tablename__ = "care_events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(UUID(as_uuid=True), ForeignKey("care_sessions.id"), nullable=False)
    event_type = Column(Enum(CareEventType), nullable=False)
    content = Column(Text)
    media_url = Column(String)
    timestamp = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    session = relationship("CareSession", back_populates="events")

class CareReport(Base):
    __tablename__ = "care_reports"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(UUID(as_uuid=True), ForeignKey("care_sessions.id"), unique=True, nullable=False)
    summary = Column(Text)
    health_metrics_json = Column(JSONB)
    recommendations = Column(Text)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    session = relationship("CareSession", back_populates="report")
