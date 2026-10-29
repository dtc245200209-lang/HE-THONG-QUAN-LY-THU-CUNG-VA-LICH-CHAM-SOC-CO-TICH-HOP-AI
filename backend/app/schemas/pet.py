from typing import Optional, List
from uuid import UUID
from datetime import datetime, date
from pydantic import BaseModel, ConfigDict
from app.models.pet import PetSpecies, PetSex, MembershipRole
from app.schemas.care_session import CareReportResponse

class PetBase(BaseModel):
    name: str
    avatar: Optional[str] = None
    species: PetSpecies
    breed: Optional[str] = None
    date_of_birth: Optional[date] = None
    sex: Optional[PetSex] = None
    neutered: Optional[bool] = False
    microchip: Optional[str] = None
    color: Optional[str] = None
    distinguishing_marks: Optional[str] = None

class PetCreate(PetBase):
    pass

class PetUpdate(BaseModel):
    name: Optional[str] = None
    avatar: Optional[str] = None
    species: Optional[PetSpecies] = None
    breed: Optional[str] = None
    date_of_birth: Optional[date] = None
    sex: Optional[PetSex] = None
    neutered: Optional[bool] = None
    microchip: Optional[str] = None
    color: Optional[str] = None
    distinguishing_marks: Optional[str] = None

class PetResponse(PetBase):
    id: UUID
    owner_id: Optional[UUID] = None
    lost_mode: Optional[bool] = False
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)

class AllergyBase(BaseModel):
    name: str
    severity: Optional[str] = None
    notes: Optional[str] = None

class AllergyCreate(AllergyBase):
    pass

class AllergyResponse(AllergyBase):
    id: UUID
    pet_id: UUID
    model_config = ConfigDict(from_attributes=True)

class ConditionBase(BaseModel):
    name: str
    diagnosed_date: Optional[date] = None
    is_chronic: bool = False
    notes: Optional[str] = None

class ConditionCreate(ConditionBase):
    pass

class ConditionResponse(ConditionBase):
    id: UUID
    pet_id: UUID
    model_config = ConfigDict(from_attributes=True)

class WeightBase(BaseModel):
    weight_kg: float
    notes: Optional[str] = None

class WeightCreate(WeightBase):
    pass

class WeightResponse(WeightBase):
    id: UUID
    pet_id: UUID
    recorded_at: datetime
    model_config = ConfigDict(from_attributes=True)

class VaccinationBase(BaseModel):
    name: str
    vaccination_date: date
    next_due_date: Optional[date] = None
    clinic: Optional[str] = None
    document_url: Optional[str] = None

class VaccinationCreate(VaccinationBase):
    pass

class VaccinationResponse(VaccinationBase):
    id: UUID
    pet_id: UUID
    model_config = ConfigDict(from_attributes=True)

class MedicationBase(BaseModel):
    name: str
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    notes: Optional[str] = None

class MedicationCreate(MedicationBase):
    pass

class MedicationResponse(MedicationBase):
    id: UUID
    pet_id: UUID
    model_config = ConfigDict(from_attributes=True)

class MedicalRecordBase(BaseModel):
    visit_date: date
    clinic: Optional[str] = None
    veterinarian: Optional[str] = None
    diagnosis: Optional[str] = None
    treatment: Optional[str] = None
    document_url: Optional[str] = None

class MedicalRecordCreate(MedicalRecordBase):
    pass

class MedicalRecordResponse(MedicalRecordBase):
    id: UUID
    pet_id: UUID
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class PetPassportResponse(BaseModel):
    pet: PetResponse
    qr_token: Optional[str] = None
    allergies: List[AllergyResponse] = []
    conditions: List[ConditionResponse] = []
    weights: List[WeightResponse] = []
    vaccinations: List[VaccinationResponse] = []
    medications: List[MedicationResponse] = []
    medical_records: List[MedicalRecordResponse] = []
    care_reports: List[CareReportResponse] = []
    
    model_config = ConfigDict(from_attributes=True)

class PetLostModeUpdate(BaseModel):
    lost_mode: bool

class LostPetReportCreate(BaseModel):
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    last_seen_location: Optional[str] = None
    last_seen_time: Optional[datetime] = None
    message: Optional[str] = None

class LostPetReportResponse(LostPetReportCreate):
    id: UUID
    pet_id: UUID
    reported_by: Optional[UUID] = None
    is_resolved: bool
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class PublicPetResponse(BaseModel):
    name: str
    avatar: Optional[str] = None
    species: PetSpecies
    breed: Optional[str] = None
    sex: Optional[PetSex] = None
    color: Optional[str] = None
    distinguishing_marks: Optional[str] = None
    lost_mode: bool
    owner_emergency_contact: Optional[str] = None
    
    allergies: List[AllergyResponse] = []
    conditions: List[ConditionResponse] = []
    medications: List[MedicationResponse] = []

    model_config = ConfigDict(from_attributes=True)

class AIDocumentExtractionResult(BaseModel):
    document_type: str # e.g. VACCINATION, PRESCRIPTION, MEDICAL_REPORT, LAB_RESULT
    pet_name: Optional[str] = None
    vaccine_name: Optional[str] = None
    vaccination_date: Optional[date] = None
    next_due_date: Optional[date] = None
    veterinarian: Optional[str] = None
    clinic: Optional[str] = None
    diagnosis: Optional[str] = None
    confidence: float
    
class PetDocumentResponse(BaseModel):
    id: UUID
    pet_id: UUID
    title: str
    document_type: Optional[str] = None
    file_url: str
    upload_date: datetime
    status: str
    extracted_data: Optional[AIDocumentExtractionResult] = None
    
    model_config = ConfigDict(from_attributes=True)

class PetDocumentConfirmRequest(BaseModel):
    title: str
    document_type: str
    vaccine_name: Optional[str] = None
    vaccination_date: Optional[date] = None
    next_due_date: Optional[date] = None
    veterinarian: Optional[str] = None
    clinic: Optional[str] = None
    diagnosis: Optional[str] = None

class PetMemberUser(BaseModel):
    id: UUID
    email: str
    full_name: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class PetMemberResponse(BaseModel):
    id: UUID
    user_id: UUID
    pet_id: UUID
    role: MembershipRole
    created_at: datetime
    user: Optional[PetMemberUser] = None
    model_config = ConfigDict(from_attributes=True)

class PetMemberCreate(BaseModel):
    email: str
    role: MembershipRole = MembershipRole.CAREGIVER_MEMBER

class PetMemberRoleUpdate(BaseModel):
    role: MembershipRole

