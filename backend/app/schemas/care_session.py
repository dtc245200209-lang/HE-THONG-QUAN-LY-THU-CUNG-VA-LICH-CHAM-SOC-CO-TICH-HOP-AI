from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.models.care_session import CareSessionStatus, CareEventType

class CareEventBase(BaseModel):
    event_type: CareEventType
    content: Optional[str] = None
    media_url: Optional[str] = None

class CareEventCreate(CareEventBase):
    session_id: UUID

class CareEventResponse(CareEventBase):
    id: UUID
    session_id: UUID
    timestamp: datetime
    model_config = ConfigDict(from_attributes=True)

class CareReportBase(BaseModel):
    summary: Optional[str] = None
    health_metrics_json: Optional[Dict[str, Any]] = None
    recommendations: Optional[str] = None

class CareReportDraftRequest(BaseModel):
    mood: Optional[str] = None
    appetite: Optional[str] = None
    weight: Optional[float] = None
    skin_condition: Optional[str] = None
    behavior: Optional[str] = None
    service_result: Optional[str] = None
    caregiver_notes: Optional[str] = None

class CareReportResponse(CareReportBase):
    id: UUID
    session_id: UUID
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class CareSessionBase(BaseModel):
    appointment_id: UUID
    caregiver_id: UUID

class CareSessionResponse(CareSessionBase):
    id: UUID
    status: CareSessionStatus
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None
    created_at: datetime
    
    events: List[CareEventResponse] = []
    report: Optional[CareReportResponse] = None
    model_config = ConfigDict(from_attributes=True)
