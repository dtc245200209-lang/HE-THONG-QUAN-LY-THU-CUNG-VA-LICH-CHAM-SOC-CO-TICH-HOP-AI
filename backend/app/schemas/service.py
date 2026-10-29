from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel
from app.models.appointment import ServiceCategory

class ServiceBase(BaseModel):
    name: str
    description: Optional[str] = None
    category: ServiceCategory
    base_price: float
    estimated_duration_minutes: int
    is_active: bool = True

class ServiceCreate(ServiceBase):
    pass

class ServiceUpdate(ServiceBase):
    pass

class ServiceResponse(ServiceBase):
    id: UUID

    class Config:
        from_attributes = True
