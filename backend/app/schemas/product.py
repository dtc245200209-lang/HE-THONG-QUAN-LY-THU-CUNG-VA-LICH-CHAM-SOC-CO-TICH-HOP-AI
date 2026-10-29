from typing import List, Optional
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict

class ProductBase(BaseModel):
    sku: str
    name: str
    slug: str
    category: str
    target_pet: str
    brand: str
    price: float
    original_price: Optional[float] = None
    discount_percent: int = 0
    unit: str
    stock_quantity: int
    rating: float = 5.0
    review_count: int = 0
    image_url: Optional[str] = None
    badge: Optional[str] = None
    description: str
    ingredients: Optional[str] = None
    usage_instructions: Optional[str] = None
    is_active: bool = True
    is_featured: bool = False

class ProductCreate(BaseModel):
    name: str
    sku: Optional[str] = None
    slug: Optional[str] = None
    category: str = "FOOD"
    target_pet: str = "ALL"
    brand: str
    price: float
    original_price: Optional[float] = None
    discount_percent: int = 0
    unit: str = "Gói"
    stock_quantity: int = 50
    rating: float = 5.0
    review_count: int = 0
    image_url: Optional[str] = None
    badge: Optional[str] = None
    description: str
    ingredients: Optional[str] = None
    usage_instructions: Optional[str] = None
    is_active: bool = True
    is_featured: bool = False

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    sku: Optional[str] = None
    slug: Optional[str] = None
    category: Optional[str] = None
    target_pet: Optional[str] = None
    brand: Optional[str] = None
    price: Optional[float] = None
    original_price: Optional[float] = None
    discount_percent: Optional[int] = None
    unit: Optional[str] = None
    stock_quantity: Optional[int] = None
    rating: Optional[float] = None
    review_count: Optional[int] = None
    image_url: Optional[str] = None
    badge: Optional[str] = None
    description: Optional[str] = None
    ingredients: Optional[str] = None
    usage_instructions: Optional[str] = None
    is_active: Optional[bool] = None
    is_featured: Optional[bool] = None

class ProductResponse(ProductBase):
    id: UUID
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class ProductListResponse(BaseModel):
    items: List[ProductResponse]
    total: int
    page: int
    limit: int
    total_pages: int

class CategoryMeta(BaseModel):
    code: str
    name: str
    count: int
    icon: str

class TargetPetMeta(BaseModel):
    code: str
    name: str
    count: int
    icon: str

class ShopMetadataResponse(BaseModel):
    categories: List[CategoryMeta]
    target_pets: List[TargetPetMeta]
    brands: List[str]
    total_products: int
