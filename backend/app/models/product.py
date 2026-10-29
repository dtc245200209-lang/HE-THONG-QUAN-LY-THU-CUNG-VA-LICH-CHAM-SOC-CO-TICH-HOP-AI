import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, Text, Boolean, DateTime
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    sku = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(255), index=True, nullable=False)
    slug = Column(String(255), unique=True, index=True, nullable=False)
    
    # Category: FOOD, PATE, SNACK, SUPPLY, HYGIENE, TOY
    category = Column(String(50), index=True, nullable=False, default="FOOD")
    
    # Target pet: DOG, CAT, ALL
    target_pet = Column(String(20), index=True, nullable=False, default="ALL")
    
    # Brand: Royal Canin, Whiskas, Orijen, Purina, Cature, SOS, KONG, etc.
    brand = Column(String(100), index=True, nullable=False)
    
    # Pricing
    price = Column(Float, nullable=False, default=0.0)
    original_price = Column(Float, nullable=True)
    discount_percent = Column(Integer, default=0)
    unit = Column(String(50), nullable=False, default="Gói")
    
    # Inventory & Ratings
    stock_quantity = Column(Integer, nullable=False, default=50)
    rating = Column(Float, default=5.0)
    review_count = Column(Integer, default=0)
    
    # Media & Display
    image_url = Column(String(1000), nullable=True)
    badge = Column(String(50), nullable=True)  # BÁN CHẠY, GIẢM SÂU, KHUYÊN DÙNG, MỚI
    
    # Detailed specs
    description = Column(Text, nullable=False)
    ingredients = Column(Text, nullable=True)
    usage_instructions = Column(Text, nullable=True)
    
    is_active = Column(Boolean, default=True, index=True)
    is_featured = Column(Boolean, default=False, index=True)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
