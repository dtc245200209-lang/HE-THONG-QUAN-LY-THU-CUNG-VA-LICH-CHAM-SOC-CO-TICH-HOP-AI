from typing import Optional, List
from uuid import UUID
from datetime import datetime, date, time
from pydantic import BaseModel, ConfigDict
from app.models.appointment import ServiceCategory, AppointmentStatus, DayOfWeek

class ServiceBase(BaseModel):
    name: str
    description: Optional[str] = None
    category: ServiceCategory
    base_price: float
    estimated_duration_minutes: int
    is_active: bool = True

class ServiceResponse(ServiceBase):
    id: UUID
    model_config = ConfigDict(from_attributes=True)

class AppointmentBase(BaseModel):
    pet_id: UUID
    caregiver_id: Optional[UUID] = None
    scheduled_time: datetime
    notes: Optional[str] = None

class AppointmentCreate(AppointmentBase):
    service_ids: List[UUID]

from app.schemas.pet import PetResponse
from app.schemas.user import UserResponse

class AppointmentServiceResponse(BaseModel):
    service: ServiceResponse
    price_at_booking: float
    model_config = ConfigDict(from_attributes=True)

class AppointmentResponse(AppointmentBase):
    id: UUID
    customer_id: UUID
    status: AppointmentStatus
    total_price: float
    created_at: datetime
    updated_at: datetime
    
    customer: Optional[UserResponse] = None
    caregiver: Optional[UserResponse] = None
    pet: Optional[PetResponse] = None
    services: List[AppointmentServiceResponse] = []
    
    model_config = ConfigDict(from_attributes=True)
