from typing import Optional, List
from pydantic import BaseModel
from uuid import UUID
from datetime import datetime, date

class InventoryItemBase(BaseModel):
    sku: str
    name: str
    category: str = "MEDICINE"  # MEDICINE, VACCINE, SUPPLY, CONSUMABLE
    unit: str = "Hộp"
    quantity: int = 0
    min_threshold: int = 10
    cost_price: float = 0.0
    selling_price: float = 0.0
    batch_number: Optional[str] = None
    expiry_date: Optional[date] = None
    supplier: Optional[str] = None
    location: Optional[str] = None
    notes: Optional[str] = None

class InventoryItemCreate(InventoryItemBase):
    pass

class InventoryItemUpdate(BaseModel):
    sku: Optional[str] = None
    name: Optional[str] = None
    category: Optional[str] = None
    unit: Optional[str] = None
    quantity: Optional[int] = None
    min_threshold: Optional[int] = None
    cost_price: Optional[float] = None
    selling_price: Optional[float] = None
    batch_number: Optional[str] = None
    expiry_date: Optional[date] = None
    supplier: Optional[str] = None
    location: Optional[str] = None
    notes: Optional[str] = None

class InventoryStockAdjust(BaseModel):
    quantity_change: int  # e.g., +50 for import, -10 for write-off/loss
    transaction_type: str = "ADJUSTMENT"  # IMPORT, EXPORT, ADJUSTMENT
    notes: Optional[str] = None
    reference_id: Optional[str] = None

class InventoryTransactionResponse(BaseModel):
    id: UUID
    item_id: UUID
    transaction_type: str
    quantity_change: int
    balance_after: int
    reference_id: Optional[str] = None
    notes: Optional[str] = None
    performed_by_id: Optional[UUID] = None
    created_at: datetime

    class Config:
        from_attributes = True

class InventoryItemResponse(InventoryItemBase):
    id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class InventoryItemDetailResponse(InventoryItemResponse):
    transactions: List[InventoryTransactionResponse] = []

class InventoryStatsResponse(BaseModel):
    total_items: int
    total_units: int
    low_stock_count: int
    out_of_stock_count: int
    expiring_soon_count: int
    total_inventory_value: float
