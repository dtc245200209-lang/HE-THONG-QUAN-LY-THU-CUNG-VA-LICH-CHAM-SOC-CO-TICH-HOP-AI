from typing import Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.schemas.appointment import AppointmentResponse

class PaymentBase(BaseModel):
    appointment_id: UUID
    amount: float
    status: Optional[str] = "COMPLETED"
    payment_method: Optional[str] = "CASH"

class PaymentCreate(PaymentBase):
    pass

class PaymentResponse(PaymentBase):
    id: UUID
    transaction_id: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    appointment: Optional[AppointmentResponse] = None

    model_config = ConfigDict(from_attributes=True)
