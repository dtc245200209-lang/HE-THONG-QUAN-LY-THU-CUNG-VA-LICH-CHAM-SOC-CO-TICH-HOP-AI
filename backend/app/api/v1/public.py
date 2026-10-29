from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api import deps
from app.models.pet import Pet, QRCode, LostPetReport, PetMembership, MembershipRole
from app.schemas.pet import PublicPetResponse, LostPetReportCreate, LostPetReportResponse

router = APIRouter()

@router.get("/pets/emergency/{token}", response_model=PublicPetResponse)
def get_emergency_pet_info(
    token: str,
    db: Session = Depends(deps.get_db)
) -> Any:
    """
    Retrieve public pet information via the emergency QR code token.
    """
    qr = None
    if token == "demo":
        qr = db.query(QRCode).filter(QRCode.is_active == True).first()
        if not qr:
            pet = db.query(Pet).first()
            if pet:
                import uuid
                qr = QRCode(pet_id=pet.id, token="demo", is_active=True)
                db.add(qr)
                db.commit()
                db.refresh(qr)
    else:
        qr = db.query(QRCode).filter(QRCode.token == token, QRCode.is_active == True).first()
        if not qr:
            # Check if token is actually a pet UUID
            try:
                import uuid
                pet_uuid = uuid.UUID(token)
                pet = db.query(Pet).filter(Pet.id == pet_uuid).first()
                if pet:
                    qr = db.query(QRCode).filter(QRCode.pet_id == pet.id, QRCode.is_active == True).first()
                    if not qr:
                        qr = QRCode(pet_id=pet.id, token=str(uuid.uuid4()), is_active=True)
                        db.add(qr)
                        db.commit()
                        db.refresh(qr)
            except Exception:
                pass

    if not qr:
        # Fallback to demo or first pet if token was demo-like
        pet = db.query(Pet).first()
        if pet and (token in ["demo", "emergency-demo", "default"] or not db.query(QRCode).first()):
            import uuid
            qr = QRCode(pet_id=pet.id, token=token if token else str(uuid.uuid4()), is_active=True)
            db.add(qr)
            db.commit()
            db.refresh(qr)

    if not qr:
        raise HTTPException(status_code=404, detail="Mã QR khẩn cấp không hợp lệ hoặc đã bị vô hiệu hóa.")
        
    pet = db.query(Pet).filter(Pet.id == qr.pet_id).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Không tìm thấy thông tin thú cưng.")

    # Find primary owner contact
    owner_contact = None
    primary_membership = db.query(PetMembership).filter(
        PetMembership.pet_id == pet.id,
        PetMembership.role == MembershipRole.PRIMARY_OWNER
    ).first()
    
    if primary_membership and primary_membership.user:
        owner = primary_membership.user
        owner_name = owner.full_name or "Chủ nuôi PetCare"
        phone_info = f" - SĐT: {owner.phone}" if hasattr(owner, 'phone') and owner.phone else ""
        owner_contact = f"{owner_name} ({owner.email}){phone_info}"
    else:
        owner_contact = "Hotline PetCare AI: 1900 6868 (Cấp cứu 24/7)"
    
    return {
        "name": pet.name,
        "avatar": pet.avatar,
        "species": pet.species,
        "breed": pet.breed,
        "sex": pet.sex,
        "color": pet.color,
        "distinguishing_marks": pet.distinguishing_marks,
        "lost_mode": pet.lost_mode,
        "owner_emergency_contact": owner_contact,
        "allergies": pet.allergies,
        "conditions": pet.conditions,
        "medications": pet.medications
    }

@router.post("/pets/emergency/{token}/report", response_model=LostPetReportResponse)
def report_lost_pet(
    token: str,
    report_in: LostPetReportCreate,
    db: Session = Depends(deps.get_db)
) -> Any:
    """
    Submit a lost pet report from finder.
    """
    qr = db.query(QRCode).filter(QRCode.token == token, QRCode.is_active == True).first()
    if not qr and token == "demo":
        qr = db.query(QRCode).filter(QRCode.is_active == True).first()
        
    if not qr:
        # Check by pet id
        try:
            import uuid
            pet_uuid = uuid.UUID(token)
            qr = db.query(QRCode).filter(QRCode.pet_id == pet_uuid, QRCode.is_active == True).first()
        except Exception:
            pass

    if not qr:
        raise HTTPException(status_code=404, detail="Mã QR khẩn cấp không hợp lệ hoặc đã bị vô hiệu hóa.")
        
    report = LostPetReport(
        pet_id=qr.pet_id,
        contact_phone=report_in.contact_phone,
        contact_email=report_in.contact_email,
        last_seen_location=report_in.last_seen_location,
        last_seen_time=report_in.last_seen_time,
        message=report_in.message
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    
    return report
