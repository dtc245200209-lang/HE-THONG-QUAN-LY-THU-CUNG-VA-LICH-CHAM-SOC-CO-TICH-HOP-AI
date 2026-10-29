import uuid
from datetime import datetime, timezone, date
from sqlalchemy import Column, String, Integer, Float, Text, DateTime, Date, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base

class InventoryItem(Base):
    __tablename__ = "inventory_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    sku = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, index=True, nullable=False)
    category = Column(String, index=True, nullable=False, default="MEDICINE")  # MEDICINE, VACCINE, SUPPLY, CONSUMABLE
    unit = Column(String, nullable=False, default="Hộp")  # Hộp, Lọ, Viên, Cái, Ống, Chai, Gói
    quantity = Column(Integer, nullable=False, default=0)
    min_threshold = Column(Integer, nullable=False, default=10)
    cost_price = Column(Float, nullable=False, default=0.0)
    selling_price = Column(Float, nullable=False, default=0.0)
    batch_number = Column(String, nullable=True)
    expiry_date = Column(Date, nullable=True)
    supplier = Column(String, nullable=True)
    location = Column(String, nullable=True)  # e.g., "Tủ A - Kệ 2"
    notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    transactions = relationship("InventoryTransaction", back_populates="item", cascade="all, delete-orphan", order_by="desc(InventoryTransaction.created_at)")


class InventoryTransaction(Base):
    __tablename__ = "inventory_transactions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    item_id = Column(UUID(as_uuid=True), ForeignKey("inventory_items.id"), nullable=False)
    transaction_type = Column(String, nullable=False)  # IMPORT, EXPORT, ADJUSTMENT, PRESCRIPTION_DEDUCTION, VACCINATION_DEDUCTION
    quantity_change = Column(Integer, nullable=False)  # Positive for import, negative for export/deduction
    balance_after = Column(Integer, nullable=False)
    reference_id = Column(String, nullable=True)  # Vaccination ID, Prescription ID, or Receipt Code
    notes = Column(Text, nullable=True)
    performed_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    item = relationship("InventoryItem", back_populates="transactions")
    performed_by = relationship("User")
