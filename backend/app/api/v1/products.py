import math
from typing import Optional, List
import uuid
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc, func

from app.api import deps
from app.models.product import Product
from app.schemas.product import (
    ProductResponse, ProductListResponse, ShopMetadataResponse, 
    CategoryMeta, TargetPetMeta, ProductCreate, ProductUpdate
)

router = APIRouter()

CATEGORY_DISPLAY = {
    "PET": {"name": "Thú Cưng Thuần Chủng", "icon": "paw-print"},
    "FOOD": {"name": "Đồ Ăn & Hạt Khô", "icon": "utensils"},
    "PATE": {"name": "Pate & Thức Ăn Ướt", "icon": "soup"},
    "SNACK": {"name": "Bánh Thưởng & Snack", "icon": "cookie"},
    "TOY": {"name": "Đồ Chơi Thông Minh", "icon": "gamepad-2"},
    "SUPPLY": {"name": "Vật Phẩm & Phụ Kiện", "icon": "home"},
    "HYGIENE": {"name": "Vệ Sinh & Spa", "icon": "sparkles"},
}

PET_DISPLAY = {
    "ALL": {"name": "Tất Cả Thú Cưng", "icon": "paw-print"},
    "DOG": {"name": "Dành Cho Chó", "icon": "dog"},
    "CAT": {"name": "Dành Cho Mèo", "icon": "cat"},
}

@router.get("", response_model=ProductListResponse)
def get_products(
    db: Session = Depends(deps.get_db),
    category: Optional[str] = Query(None, description="FOOD, PATE, SNACK, SUPPLY, HYGIENE, TOY"),
    target_pet: Optional[str] = Query(None, description="DOG, CAT, ALL"),
    brand: Optional[str] = None,
    search: Optional[str] = None,
    is_featured: Optional[bool] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    sort_by: str = Query("popular", description="popular, price_asc, price_desc, rating, newest"),
    page: int = Query(1, ge=1),
    limit: int = Query(12, ge=1, le=100)
):
    """
    Public API: Lấy danh sách sản phẩm đồ ăn và vật phẩm thú cưng công khai từ database.
    Không yêu cầu đăng nhập hay token Bearer.
    """
    query = db.query(Product).filter(Product.is_active == True)

    if category and category.upper() != "ALL":
        query = query.filter(Product.category == category.upper())
        
    if target_pet and target_pet.upper() != "ALL":
        query = query.filter(or_(Product.target_pet == target_pet.upper(), Product.target_pet == "ALL"))
        
    if brand:
        query = query.filter(Product.brand.ilike(f"%{brand}%"))
        
    if is_featured is not None:
        query = query.filter(Product.is_featured == is_featured)
        
    if min_price is not None:
        query = query.filter(Product.price >= min_price)
        
    if max_price is not None:
        query = query.filter(Product.price <= max_price)
        
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Product.name.ilike(search_term),
                Product.brand.ilike(search_term),
                Product.description.ilike(search_term),
                Product.category.ilike(search_term)
            )
        )

    # Sorting
    if sort_by == "price_asc":
        query = query.order_by(asc(Product.price))
    elif sort_by == "price_desc":
        query = query.order_by(desc(Product.price))
    elif sort_by == "rating":
        query = query.order_by(desc(Product.rating), desc(Product.review_count))
    elif sort_by == "newest":
        query = query.order_by(desc(Product.created_at))
    else:  # popular / default
        query = query.order_by(desc(Product.is_featured), desc(Product.review_count), desc(Product.rating))

    total = query.count()
    total_pages = math.ceil(total / limit) if total > 0 else 1
    
    offset = (page - 1) * limit
    items = query.offset(offset).limit(limit).all()

    return {
        "items": items,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": total_pages
    }

@router.get("/meta/shop-info", response_model=ShopMetadataResponse)
def get_shop_metadata(db: Session = Depends(deps.get_db)):
    """
    Public API: Lấy thông tin metadata của cửa hàng (danh mục, số lượng, thương hiệu).
    """
    total_products = db.query(Product).filter(Product.is_active == True).count()

    # Category counts
    cat_counts = (
        db.query(Product.category, func.count(Product.id))
        .filter(Product.is_active == True)
        .group_by(Product.category)
        .all()
    )
    cat_map = {c[0]: c[1] for c in cat_counts}
    
    categories = []
    for code, info in CATEGORY_DISPLAY.items():
        categories.append(CategoryMeta(
            code=code,
            name=info["name"],
            count=cat_map.get(code, 0),
            icon=info["icon"]
        ))

    # Target pet counts
    pet_counts = (
        db.query(Product.target_pet, func.count(Product.id))
        .filter(Product.is_active == True)
        .group_by(Product.target_pet)
        .all()
    )
    pet_map = {p[0]: p[1] for p in pet_counts}
    
    target_pets = []
    for code, info in PET_DISPLAY.items():
        count = total_products if code == "ALL" else pet_map.get(code, 0)
        target_pets.append(TargetPetMeta(
            code=code,
            name=info["name"],
            count=count,
            icon=info["icon"]
        ))

    # Distinct Brands
    brands = [b[0] for b in db.query(Product.brand).filter(Product.is_active == True).distinct().order_by(Product.brand).all()]

    return ShopMetadataResponse(
        categories=categories,
        target_pets=target_pets,
        brands=brands,
        total_products=total_products
    )

@router.get("/{id_or_slug}", response_model=ProductResponse)
def get_product_detail(id_or_slug: str, db: Session = Depends(deps.get_db)):
    """
    Public API: Lấy chi tiết 1 sản phẩm bằng UUID hoặc slug thân thiện SEO.
    """
    product = None
    try:
        uuid_val = UUID(id_or_slug)
        product = db.query(Product).filter(Product.id == uuid_val, Product.is_active == True).first()
    except (ValueError, AttributeError):
        pass

    if not product:
        product = db.query(Product).filter(Product.slug == id_or_slug, Product.is_active == True).first()

    if not product:
        raise HTTPException(status_code=404, detail="Không tìm thấy sản phẩm yêu cầu.")

    return product

def generate_sku(category: str, name: str) -> str:
    import random
    prefix = category[:3].upper() if category else "PRD"
    return f"{prefix}-{random.randint(1000, 9999)}"

def make_slug(name: str) -> str:
    import re, unicodedata, random
    normalized = unicodedata.normalize('NFKD', name).encode('ascii', 'ignore').decode('utf-8')
    slug = re.sub(r'[^\w\s-]', '', normalized).strip().lower()
    clean = re.sub(r'[-\s]+', '-', slug)
    return f"{clean}-{random.randint(100, 999)}" if clean else f"product-{random.randint(1000, 9999)}"

@router.post("", response_model=ProductResponse, status_code=201)
def create_product(
    product_in: ProductCreate,
    db: Session = Depends(deps.get_db)
):
    """
    Tạo sản phẩm mới và lưu trực tiếp vào cơ sở dữ liệu PostgreSQL.
    """
    sku = product_in.sku or generate_sku(product_in.category, product_in.name)
    slug = product_in.slug or make_slug(product_in.name)
    
    # Check if SKU already exists
    existing = db.query(Product).filter(Product.sku == sku).first()
    if existing:
        sku = f"{sku}-{uuid.uuid4().hex[:4].upper()}"

    discount = 0
    if product_in.original_price and product_in.original_price > product_in.price:
        discount = int(round((1 - product_in.price / product_in.original_price) * 100))
    elif product_in.discount_percent:
        discount = product_in.discount_percent

    product = Product(
        sku=sku,
        name=product_in.name,
        slug=slug,
        category=product_in.category.upper(),
        target_pet=product_in.target_pet.upper(),
        brand=product_in.brand,
        price=product_in.price,
        original_price=product_in.original_price or product_in.price,
        discount_percent=discount,
        unit=product_in.unit,
        stock_quantity=product_in.stock_quantity,
        rating=product_in.rating,
        review_count=product_in.review_count,
        image_url=product_in.image_url or "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=800&q=80",
        badge=product_in.badge or "MỚI",
        description=product_in.description,
        ingredients=product_in.ingredients,
        usage_instructions=product_in.usage_instructions,
        is_active=product_in.is_active,
        is_featured=product_in.is_featured
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return product

@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: UUID,
    product_in: ProductUpdate,
    db: Session = Depends(deps.get_db)
):
    """
    Cập nhật thông tin sản phẩm trong PostgreSQL.
    """
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Không tìm thấy sản phẩm.")

    update_data = product_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if field == "category" and value:
            value = value.upper()
        if field == "target_pet" and value:
            value = value.upper()
        setattr(product, field, value)

    # Recalculate discount
    if product.original_price and product.original_price > product.price:
        product.discount_percent = int(round((1 - product.price / product.original_price) * 100))

    db.commit()
    db.refresh(product)
    return product

@router.delete("/{product_id}")
def delete_product(
    product_id: UUID,
    db: Session = Depends(deps.get_db)
):
    """
    Xóa sản phẩm khỏi database PostgreSQL.
    """
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Không tìm thấy sản phẩm.")

    db.delete(product)
    db.commit()
    return {"status": "success", "message": f"Đã xóa sản phẩm {product.name} thành công."}

