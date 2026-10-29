from typing import List, Optional, Any, Dict
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, Field


class OrderItemCreate(BaseModel):
    product_id: UUID
    quantity: int = Field(default=1, ge=1)


class OrderCreate(BaseModel):
    customer_name: str
    customer_phone: str
    customer_address: str
    notes: Optional[str] = None
    payment_method: str = Field(default="COD", description="COD hoặc BANK")
    items: List[OrderItemCreate] = Field(..., min_items=1)


class OrderCancelRequest(BaseModel):
    reason: Optional[str] = Field(default="Khách hàng hủy đơn khi chưa giao", description="Lý do hủy đơn hàng")


class OrderReturnRequest(BaseModel):
    reason: str = Field(..., min_length=5, description="Lý do hoàn trả sản phẩm (lỗi, rách, không đúng mẫu,...)")


class OrderStatusUpdateRequest(BaseModel):
    status: str = Field(..., description="CONFIRMED, SHIPPING, DELIVERED, CANCELLED, RETURNED, RETURN_REJECTED")
    notes: Optional[str] = None


class OrderItemResponse(BaseModel):
    id: UUID
    product_id: Optional[UUID]
    product_name: str
    product_image: Optional[str]
    price: float
    quantity: int
    unit: Optional[str]
    subtotal: float

    class Config:
        from_attributes = True


class OrderResponse(BaseModel):
    id: UUID
    order_code: str
    user_id: UUID
    customer_name: str
    customer_phone: str
    customer_address: str
    notes: Optional[str]
    total_amount: float
    shipping_fee: float
    final_amount: float
    payment_method: str
    payment_status: str
    status: str
    cancel_reason: Optional[str]
    cancelled_by: Optional[str]
    cancelled_at: Optional[datetime]
    return_reason: Optional[str]
    return_requested_at: Optional[datetime]
    return_response_notes: Optional[str]
    return_processed_at: Optional[datetime]
    tracking_timeline: Optional[List[Dict[str, Any]]] = None
    created_at: datetime
    updated_at: datetime
    items: List[OrderItemResponse] = []
    can_cancel: bool = False
    can_return: bool = False

    class Config:
        from_attributes = True


class OrderListResponse(BaseModel):
    total: int
    items: List[OrderResponse]
