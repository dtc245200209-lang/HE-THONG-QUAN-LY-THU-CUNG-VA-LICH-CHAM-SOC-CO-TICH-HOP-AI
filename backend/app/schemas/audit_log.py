from typing import Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel

class AuditLogBase(BaseModel):
    action: str
    entity_type: str
    entity_id: UUID
    details: Optional[str] = None

class AuditLogCreate(AuditLogBase):
    user_id: Optional[UUID] = None

class AuditLogResponse(AuditLogBase):
    id: UUID
    user_id: Optional[UUID]
    created_at: datetime

    class Config:
        from_attributes = True
