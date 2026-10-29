import uuid
from datetime import datetime, timezone, date, time
from sqlalchemy import Column, String, Boolean, DateTime, Date, Time, Float, ForeignKey, Text, Enum, Integer
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
import enum

from app.core.database import Base

class ServiceCategory(str, enum.Enum):
    GROOMING = "GROOMING"
    VETERINARY = "VETERINARY"
    BOARDING = "BOARDING"
    TRAINING = "TRAINING"

class Service(Base):
    __tablename__ = "services"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    description = Column(Text)
    category = Column(Enum(ServiceCategory), nullable=False)
    base_price = Column(Float, nullable=False)
    estimated_duration_minutes = Column(Integer, nullable=False)
    is_active = Column(Boolean, default=True)

class AppointmentStatus(str, enum.Enum):
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    CHECKED_IN = "CHECKED_IN"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    customer_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    pet_id = Column(UUID(as_uuid=True), ForeignKey("pets.id"), nullable=False)
    caregiver_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    scheduled_time = Column(DateTime(timezone=True), nullable=False)
    status = Column(Enum(AppointmentStatus), default=AppointmentStatus.PENDING)
    total_price = Column(Float, default=0.0)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    customer = relationship("User", foreign_keys=[customer_id])
    caregiver = relationship("User", foreign_keys=[caregiver_id])
    pet = relationship("Pet")
    services = relationship("AppointmentService", back_populates="appointment")

class AppointmentService(Base):
    __tablename__ = "appointment_services"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    appointment_id = Column(UUID(as_uuid=True), ForeignKey("appointments.id"), nullable=False)
    service_id = Column(UUID(as_uuid=True), ForeignKey("services.id"), nullable=False)
    price_at_booking = Column(Float, nullable=False)

    appointment = relationship("Appointment", back_populates="services")
    service = relationship("Service")

class CaregiverProfile(Base):
    __tablename__ = "caregiver_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False)
    bio = Column(Text)
    rating = Column(Float, default=5.0)
    total_reviews = Column(Integer, default=0)
    is_available = Column(Boolean, default=True)

    user = relationship("User")
    skills = relationship("CaregiverSkill", back_populates="profile")
    schedules = relationship("CaregiverSchedule", back_populates="profile")

class CaregiverSkill(Base):
    __tablename__ = "caregiver_skills"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    profile_id = Column(UUID(as_uuid=True), ForeignKey("caregiver_profiles.id"), nullable=False)
    service_category = Column(Enum(ServiceCategory), nullable=False)
    experience_years = Column(Integer, default=0)

    profile = relationship("CaregiverProfile", back_populates="skills")

class DayOfWeek(str, enum.Enum):
    MONDAY = "MONDAY"
    TUESDAY = "TUESDAY"
    WEDNESDAY = "WEDNESDAY"
    THURSDAY = "THURSDAY"
    FRIDAY = "FRIDAY"
    SATURDAY = "SATURDAY"
    SUNDAY = "SUNDAY"

class CaregiverSchedule(Base):
    __tablename__ = "caregiver_schedules"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    profile_id = Column(UUID(as_uuid=True), ForeignKey("caregiver_profiles.id"), nullable=False)
    day_of_week = Column(Enum(DayOfWeek), nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)

    profile = relationship("CaregiverProfile", back_populates="schedules")
