import uuid
from typing import List, Any, Optional
from datetime import datetime, timezone, date, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from uuid import UUID

from app.api import deps
from app.models.inventory import InventoryItem, InventoryTransaction
from app.models.user import User
from app.schemas.inventory import (
    InventoryItemCreate,
    InventoryItemUpdate,
    InventoryItemResponse,
    InventoryItemDetailResponse,
    InventoryStockAdjust,
    InventoryTransactionResponse,
    InventoryStatsResponse
)

router = APIRouter()

@router.get("/stats", response_model=InventoryStatsResponse)
def get_inventory_stats(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    items = db.query(InventoryItem).all()
    total_items = len(items)
    total_units = sum(i.quantity for i in items)
    low_stock_count = sum(1 for i in items if 0 < i.quantity <= i.min_threshold)
    out_of_stock_count = sum(1 for i in items if i.quantity <= 0)
    
    # Expiring in next 45 days
    today = date.today()
    threshold_date = today + timedelta(days=45)
    expiring_soon_count = sum(1 for i in items if i.expiry_date and today <= i.expiry_date <= threshold_date)
    
    total_inventory_value = sum(i.quantity * i.cost_price for i in items)

    return {
        "total_items": total_items,
        "total_units": total_units,
        "low_stock_count": low_stock_count,
        "out_of_stock_count": out_of_stock_count,
        "expiring_soon_count": expiring_soon_count,
        "total_inventory_value": total_inventory_value
    }

@router.get("", response_model=List[InventoryItemResponse])
def get_inventory_items(
    db: Session = Depends(deps.get_db),
    search: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    low_stock: Optional[bool] = Query(None),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    query = db.query(InventoryItem)

    if category and category != "ALL":
        query = query.filter(InventoryItem.category == category)

    if search:
        s = f"%{search}%"
        query = query.filter(or_(InventoryItem.name.ilike(s), InventoryItem.sku.ilike(s), InventoryItem.supplier.ilike(s)))

    if low_stock:
        query = query.filter(InventoryItem.quantity <= InventoryItem.min_threshold)

    return query.order_by(InventoryItem.name.asc()).all()

@router.get("/transactions", response_model=List[InventoryTransactionResponse])
def get_inventory_transactions(
    db: Session = Depends(deps.get_db),
    limit: int = Query(50, le=200),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    return db.query(InventoryTransaction).order_by(InventoryTransaction.created_at.desc()).limit(limit).all()

@router.get("/{id}", response_model=InventoryItemDetailResponse)
def get_inventory_item(
    id: UUID,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    item = db.query(InventoryItem).filter(InventoryItem.id == id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Mặt hàng không tồn tại")
    return item

@router.post("", response_model=InventoryItemResponse)
def create_inventory_item(
    *,
    db: Session = Depends(deps.get_db),
    item_in: InventoryItemCreate,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    if not any(r.name == "ADMIN" for r in current_user.roles):
        raise HTTPException(status_code=403, detail="Chỉ Quản trị viên (Admin) mới có quyền tạo mặt hàng trong kho")

    existing = db.query(InventoryItem).filter(InventoryItem.sku == item_in.sku).first()
    if existing:
        raise HTTPException(status_code=400, detail="Mã SKU này đã tồn tại trong kho")

    item = InventoryItem(**item_in.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)

    # If initial quantity > 0, log an initial IMPORT transaction
    if item.quantity > 0:
        tx = InventoryTransaction(
            item_id=item.id,
            transaction_type="IMPORT",
            quantity_change=item.quantity,
            balance_after=item.quantity,
            notes="Nhập kho khởi tạo ban đầu",
            performed_by_id=current_user.id
        )
        db.add(tx)
        db.commit()

    return item

@router.put("/{id}", response_model=InventoryItemResponse)
def update_inventory_item(
    id: UUID,
    *,
    db: Session = Depends(deps.get_db),
    item_in: InventoryItemUpdate,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    item = db.query(InventoryItem).filter(InventoryItem.id == id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Mặt hàng không tồn tại")

    update_data = item_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(item, field, value)

    db.commit()
    db.refresh(item)
    return item

@router.delete("/{id}")
def delete_inventory_item(
    id: UUID,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    if not any(r.name == "ADMIN" for r in current_user.roles):
        raise HTTPException(status_code=403, detail="Chỉ Quản trị viên (Admin) mới có quyền xóa mặt hàng trong kho")

    item = db.query(InventoryItem).filter(InventoryItem.id == id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Mặt hàng không tồn tại")

    db.delete(item)
    db.commit()
    return {"status": "success", "message": "Đã xóa mặt hàng khỏi kho"}

@router.post("/{id}/adjust", response_model=InventoryItemResponse)
def adjust_inventory_stock(
    id: UUID,
    *,
    db: Session = Depends(deps.get_db),
    adjust_in: InventoryStockAdjust,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    item = db.query(InventoryItem).filter(InventoryItem.id == id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Mặt hàng không tồn tại")

    new_quantity = item.quantity + adjust_in.quantity_change
    if new_quantity < 0:
        raise HTTPException(status_code=400, detail=f"Số lượng tồn kho không đủ (hiện có: {item.quantity})")

    item.quantity = new_quantity
    
    tx = InventoryTransaction(
        item_id=item.id,
        transaction_type=adjust_in.transaction_type,
        quantity_change=adjust_in.quantity_change,
        balance_after=new_quantity,
        reference_id=adjust_in.reference_id,
        notes=adjust_in.notes or f"Điều chỉnh kho: {adjust_in.quantity_change:+d}",
        performed_by_id=current_user.id
    )
    db.add(tx)
    db.commit()
    db.refresh(item)
    return item

@router.post("/seed")
def seed_inventory_data(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    count = db.query(InventoryItem).count()
    if count > 0:
        return {"status": "skipped", "message": f"Kho đã có sẵn {count} mặt hàng."}

    initial_items = [
        {
            "sku": "VAC-RABI-01",
            "name": "Vắc-xin Phòng Dại Rabisin",
            "category": "VACCINE",
            "unit": "Lọ",
            "quantity": 45,
            "min_threshold": 10,
            "cost_price": 85000,
            "selling_price": 160000,
            "batch_number": "RAB-2026-X1",
            "expiry_date": date.today() + timedelta(days=240),
            "supplier": "Boehringer Ingelheim",
            "location": "Tủ Lạnh Vắc-xin A1",
            "notes": "Bảo quản nhiệt độ 2 - 8 độ C. Dành cho chó mèo từ 3 tháng tuổi."
        },
        {
            "sku": "VAC-VANG-07",
            "name": "Vắc-xin 7 Bệnh Vanguard Plus 5/L",
            "category": "VACCINE",
            "unit": "Liều",
            "quantity": 38,
            "min_threshold": 15,
            "cost_price": 140000,
            "selling_price": 280000,
            "batch_number": "VG7-992B",
            "expiry_date": date.today() + timedelta(days=180),
            "supplier": "Zoetis Animal Health",
            "location": "Tủ Lạnh Vắc-xin A2",
            "notes": "Phòng Care, Parvo, Viêm gan truyền nhiễm, Ho cũi chó, Leptospira."
        },
        {
            "sku": "MED-AMOX-500",
            "name": "Kháng Sinh Amoxicillin Clavulanate 500mg",
            "category": "MEDICINE",
            "unit": "Viên",
            "quantity": 180,
            "min_threshold": 30,
            "cost_price": 12000,
            "selling_price": 25000,
            "batch_number": "AMX-8834",
            "expiry_date": date.today() + timedelta(days=365),
            "supplier": "Dược Thú Y Vemedim",
            "location": "Tủ Thuốc Kháng Sinh Kệ 1",
            "notes": "Kháng sinh phổ rộng cho nhiễm khuẩn đường hô hấp, da và tiết niệu."
        },
        {
            "sku": "MED-NEXG-SPEC",
            "name": "Viên Nhai Trị Ve Rận NexGard Spectra (3.5 - 7.5kg)",
            "category": "MEDICINE",
            "unit": "Hộp",
            "quantity": 25,
            "min_threshold": 8,
            "cost_price": 220000,
            "selling_price": 350000,
            "batch_number": "NEX-2026-04",
            "expiry_date": date.today() + timedelta(days=400),
            "supplier": "Boehringer Ingelheim",
            "location": "Tủ Thuốc Đặc Trị Kệ 3",
            "notes": "Phòng ngừa ve, rận, bọ chét và tẩy giun tim hàng tháng."
        },
        {
            "sku": "MED-PRED-5MG",
            "name": "Thuốc Chống Viêm Prednisolone 5mg",
            "category": "MEDICINE",
            "unit": "Viên",
            "quantity": 250,
            "min_threshold": 50,
            "cost_price": 3000,
            "selling_price": 8000,
            "batch_number": "PRD-2026-L1",
            "expiry_date": date.today() + timedelta(days=500),
            "supplier": "Dược Phẩm Trung Ương",
            "location": "Tủ Thuốc Chống Viêm Kệ 2",
            "notes": "Chống dị ứng, viêm da cơ địa và viêm khớp."
        },
        {
            "sku": "CON-NACL-500ML",
            "name": "Nước Muối Sinh Lý Truyền Dịch NaCl 0.9% (500ml)",
            "category": "CONSUMABLE",
            "unit": "Chai",
            "quantity": 60,
            "min_threshold": 20,
            "cost_price": 18000,
            "selling_price": 40000,
            "batch_number": "NACL-26-03",
            "expiry_date": date.today() + timedelta(days=700),
            "supplier": "Dược B.Braun",
            "location": "Kho Dịch Truyền Kệ D",
            "notes": "Truyền bù dịch điện giải, rửa vết thương phẫu thuật."
        },
        {
            "sku": "SUP-SYR-5ML",
            "name": "Bơm Kim Tiêm Vinahankook 5ml",
            "category": "SUPPLY",
            "unit": "Cái",
            "quantity": 300,
            "min_threshold": 50,
            "cost_price": 2500,
            "selling_price": 6000,
            "batch_number": "SYR-2026-A",
            "expiry_date": date.today() + timedelta(days=900),
            "supplier": "Vinahankook",
            "location": "Kho Vật Tư Kệ B",
            "notes": "Kim tiêm vô trùng dùng 1 lần."
        },
        {
            "sku": "SUP-BAND-SELF",
            "name": "Băng Thun Tự Dính Quấn Cố Định Vết Thương",
            "category": "SUPPLY",
            "unit": "Cuộn",
            "quantity": 50,
            "min_threshold": 15,
            "cost_price": 15000,
            "selling_price": 35000,
            "batch_number": "BND-4421",
            "expiry_date": date.today() + timedelta(days=600),
            "supplier": "PetCare Supplies",
            "location": "Kho Vật Tư Kệ C",
            "notes": "Tự dính, thoáng khí, không dính lông thú cưng."
        }
    ]

    created = []
    for data in initial_items:
        item = InventoryItem(**data)
        db.add(item)
        db.flush()
        
        tx = InventoryTransaction(
            item_id=item.id,
            transaction_type="IMPORT",
            quantity_change=item.quantity,
            balance_after=item.quantity,
            notes="Khởi tạo kho mẫu lâm sàng PetCare",
            performed_by_id=current_user.id
        )
        db.add(tx)
        created.append(item.name)

    db.commit()
    return {
        "status": "success",
        "message": f"Đã khởi tạo thành công {len(created)} mặt hàng dược phẩm & vật tư tiêu hao vào kho.",
        "items": created
    }
