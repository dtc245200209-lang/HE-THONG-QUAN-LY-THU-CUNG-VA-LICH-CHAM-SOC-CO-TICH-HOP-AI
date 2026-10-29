import uuid
from datetime import datetime, timezone, date
from sqlalchemy import Column, String, Boolean, DateTime, Date, Float, ForeignKey, Text, Enum, Integer
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
import enum

from app.core.database import Base

class PetSpecies(str, enum.Enum):
    DOG = "DOG"
    CAT = "CAT"
    BIRD = "BIRD"
    OTHER = "OTHER"

class PetSex(str, enum.Enum):
    MALE = "MALE"
    FEMALE = "FEMALE"
    UNKNOWN = "UNKNOWN"

class MembershipRole(str, enum.Enum):
    PRIMARY_OWNER = "PRIMARY_OWNER"
    CO_OWNER = "CO_OWNER"
    CAREGIVER_MEMBER = "CAREGIVER_MEMBER"
    VIEWER = "VIEWER"

class Pet(Base):
    __tablename__ = "pets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, index=True, nullable=False)
    avatar = Column(String)
    species = Column(Enum(PetSpecies), nullable=False)
    breed = Column(String)
    date_of_birth = Column(Date)
    sex = Column(Enum(PetSex))
    neutered = Column(Boolean, default=False)
    microchip = Column(String)
    color = Column(String)
    distinguishing_marks = Column(Text)
    lost_mode = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    memberships = relationship("PetMembership", back_populates="pet", cascade="all, delete-orphan")
    allergies = relationship("Allergy", back_populates="pet", cascade="all, delete-orphan")
    conditions = relationship("Condition", back_populates="pet", cascade="all, delete-orphan")
    weights = relationship("Weight", back_populates="pet", cascade="all, delete-orphan")
    vaccinations = relationship("Vaccination", back_populates="pet", cascade="all, delete-orphan")
    medications = relationship("Medication", back_populates="pet", cascade="all, delete-orphan")
    medical_records = relationship("MedicalRecord", back_populates="pet", cascade="all, delete-orphan")
    timeline_events = relationship("TimelineEvent", back_populates="pet", cascade="all, delete-orphan")

    @property
    def owner_id(self):
        for m in self.memberships:
            if m.role == MembershipRole.PRIMARY_OWNER:
                return m.user_id
        return None

class PetMembership(Base):
    __tablename__ = "pet_memberships"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    pet_id = Column(UUID(as_uuid=True), ForeignKey("pets.id"), nullable=False)
    role = Column(Enum(MembershipRole), nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship("User")
    pet = relationship("Pet", back_populates="memberships")

class Allergy(Base):
    __tablename__ = "pet_allergies"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    pet_id = Column(UUID(as_uuid=True), ForeignKey("pets.id"), nullable=False)
    name = Column(String, nullable=False)
    severity = Column(String) # MILD, MODERATE, SEVERE
    notes = Column(Text)
    
    pet = relationship("Pet", back_populates="allergies")

class Condition(Base):
    __tablename__ = "pet_conditions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    pet_id = Column(UUID(as_uuid=True), ForeignKey("pets.id"), nullable=False)
    name = Column(String, nullable=False)
    diagnosed_date = Column(Date)
    is_chronic = Column(Boolean, default=False)
    notes = Column(Text)
    
    pet = relationship("Pet", back_populates="conditions")

class Weight(Base):
    __tablename__ = "weight_records"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    pet_id = Column(UUID(as_uuid=True), ForeignKey("pets.id"), nullable=False)
    weight_kg = Column(Float, nullable=False)
    recorded_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    notes = Column(Text)
    
    pet = relationship("Pet", back_populates="weights")

class Vaccination(Base):
    __tablename__ = "vaccinations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    pet_id = Column(UUID(as_uuid=True), ForeignKey("pets.id"), nullable=False)
    name = Column(String, nullable=False)
    vaccination_date = Column(Date, nullable=False)
    next_due_date = Column(Date)
    clinic = Column(String)
    document_url = Column(String)
    
    pet = relationship("Pet", back_populates="vaccinations")

class Medication(Base):
    __tablename__ = "medications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    pet_id = Column(UUID(as_uuid=True), ForeignKey("pets.id"), nullable=False)
    name = Column(String, nullable=False)
    dosage = Column(String)
    frequency = Column(String)
    start_date = Column(Date)
    end_date = Column(Date)
    notes = Column(Text)
    
    pet = relationship("Pet", back_populates="medications")

class MedicalRecord(Base):
    __tablename__ = "medical_records"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    pet_id = Column(UUID(as_uuid=True), ForeignKey("pets.id"), nullable=False)
    visit_date = Column(Date, nullable=False)
    clinic = Column(String)
    veterinarian = Column(String)
    diagnosis = Column(Text)
    treatment = Column(Text)
    document_url = Column(String)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    
    pet = relationship("Pet", back_populates="medical_records")

class EventType(str, enum.Enum):
    GROOMING = "GROOMING"
    VACCINATION = "VACCINATION"
    MEDICAL = "MEDICAL"
    WEIGHT = "WEIGHT"
    MEDICATION = "MEDICATION"
    GENERAL = "GENERAL"

class PetDocument(Base):
    __tablename__ = "pet_documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    pet_id = Column(UUID(as_uuid=True), ForeignKey("pets.id"), nullable=False)
    title = Column(String, nullable=False)
    document_type = Column(String) # E.g., LAB_RESULT, XRAY, PRESCRIPTION
    file_url = Column(String, nullable=False)
    upload_date = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    ai_summary = Column(Text)
    status = Column(String, default="PENDING_REVIEW") # PENDING_REVIEW, CONFIRMED, REJECTED
    extracted_data = Column(JSONB, nullable=True)
    
    pet = relationship("Pet")

class QRCode(Base):
    __tablename__ = "qr_codes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    pet_id = Column(UUID(as_uuid=True), ForeignKey("pets.id"), nullable=False)
    token = Column(String, unique=True, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    pet = relationship("Pet")

class LostPetReport(Base):
    __tablename__ = "lost_pet_reports"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    pet_id = Column(UUID(as_uuid=True), ForeignKey("pets.id"), nullable=False)
    reported_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True) # can be anonymous
    contact_phone = Column(String)
    contact_email = Column(String)
    last_seen_location = Column(String)
    last_seen_time = Column(DateTime(timezone=True))
    message = Column(Text)
    is_resolved = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    pet = relationship("Pet")

class TimelineEvent(Base):
    __tablename__ = "pet_timeline"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    pet_id = Column(UUID(as_uuid=True), ForeignKey("pets.id"), nullable=False)
    event_type = Column(Enum(EventType), nullable=False)
    event_date = Column(DateTime(timezone=True), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text)
    reference_id = Column(String) # UUID or ID pointing to the actual record
    
    pet = relationship("Pet", back_populates="timeline_events")
