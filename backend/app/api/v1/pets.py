from typing import Any, List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.api import deps
from app.models.user import User, Role
from app.models.pet import Pet, PetMembership, MembershipRole, Allergy, Condition, Weight, Vaccination, Medication, MedicalRecord, QRCode, PetDocument, LostPetReport
from app.schemas.pet import (
    PetCreate, PetUpdate, PetResponse, PetPassportResponse, PetLostModeUpdate, PetDocumentResponse, PetDocumentConfirmRequest,
    AllergyCreate, AllergyResponse,
    ConditionCreate, ConditionResponse,
    WeightCreate, WeightResponse,
    VaccinationCreate, VaccinationResponse,
    MedicationCreate, MedicationResponse,
    MedicalRecordCreate, MedicalRecordResponse,
    LostPetReportResponse, PetMemberResponse, PetMemberCreate, PetMemberRoleUpdate
)
router = APIRouter()

@router.get("", response_model=List[PetResponse])
def get_pets(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Retrieve pets. 
    Customers see their pets.
    Admins/Receptionists see all.
    Caregivers see assigned (will implement later).
    """
    is_admin = any(r.name in ["ADMIN", "RECEPTIONIST"] for r in current_user.roles)
    if is_admin:
        pets = db.query(Pet).all()
    else:
        # Get pets where user has membership
        memberships = db.query(PetMembership).filter(PetMembership.user_id == current_user.id).all()
        pet_ids = [m.pet_id for m in memberships]
        pets = db.query(Pet).filter(Pet.id.in_(pet_ids)).all()
    return pets

@router.post("", response_model=PetResponse)
def create_pet(
    *,
    db: Session = Depends(deps.get_db),
    pet_in: PetCreate,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Create new pet.
    """
    pet = Pet(**pet_in.model_dump())
    db.add(pet)
    db.flush()
    
    # Create membership as PRIMARY_OWNER
    membership = PetMembership(
        user_id=current_user.id,
        pet_id=pet.id,
        role=MembershipRole.PRIMARY_OWNER
    )
    db.add(membership)
    
    # Auto-generate Emergency QR Code
    import uuid
    qr = QRCode(
        pet_id=pet.id,
        token=str(uuid.uuid4())
    )
    db.add(qr)
    
    db.commit()
    db.refresh(pet)
    return pet

@router.put("/{id}", response_model=PetResponse)
def update_pet(
    *,
    db: Session = Depends(deps.get_db),
    id: UUID,
    pet_in: PetUpdate,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Update pet by ID.
    """
    pet = db.query(Pet).filter(Pet.id == id).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")
        
    is_admin = any(r.name in ["ADMIN", "RECEPTIONIST"] for r in current_user.roles)
    if not is_admin:
        membership = db.query(PetMembership).filter(
            PetMembership.pet_id == pet.id,
            PetMembership.user_id == current_user.id
        ).first()
        if not membership:
            raise HTTPException(status_code=403, detail="Not enough permissions")
            
    update_data = pet_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(pet, field, value)
        
    db.commit()
    db.refresh(pet)
    return pet

@router.get("/{id}", response_model=PetResponse)
def get_pet(
    *,
    db: Session = Depends(deps.get_db),
    id: UUID,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Get pet by ID.
    """
    pet = db.query(Pet).filter(Pet.id == id).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")
        
    is_admin = any(r.name in ["ADMIN", "RECEPTIONIST"] for r in current_user.roles)
    if not is_admin:
        membership = db.query(PetMembership).filter(
            PetMembership.pet_id == pet.id,
            PetMembership.user_id == current_user.id
        ).first()
        if not membership:
            raise HTTPException(status_code=403, detail="Not enough permissions")
            
    return pet

@router.get("/{id}/passport", response_model=PetPassportResponse)
def get_pet_passport(
    *,
    db: Session = Depends(deps.get_db),
    id: UUID,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Get aggregated pet passport.
    """
    pet = db.query(Pet).filter(Pet.id == id).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")
        
    is_admin = any(r.name in ["ADMIN", "RECEPTIONIST"] for r in current_user.roles)
    if not is_admin:
        membership = db.query(PetMembership).filter(
            PetMembership.pet_id == pet.id,
            PetMembership.user_id == current_user.id
        ).first()
        if not membership:
            raise HTTPException(status_code=403, detail="Not enough permissions")
            
    qr = db.query(QRCode).filter(QRCode.pet_id == pet.id, QRCode.is_active == True).first()
    if not qr:
        import uuid
        qr = QRCode(pet_id=pet.id, token=str(uuid.uuid4()), is_active=True)
        db.add(qr)
        db.commit()
        db.refresh(qr)
    
    from app.models.care_session import CareReport, CareSession
    from app.models.appointment import Appointment
    care_reports = db.query(CareReport).join(CareSession).join(Appointment).filter(Appointment.pet_id == pet.id).all()
            
    return {
        "pet": pet,
        "qr_token": qr.token if qr else None,
        "allergies": pet.allergies,
        "conditions": pet.conditions,
        "weights": pet.weights,
        "vaccinations": pet.vaccinations,
        "medications": pet.medications,
        "medical_records": pet.medical_records,
        "care_reports": care_reports
    }

def check_pet_permission(db: Session, pet_id: UUID, current_user: User):
    pet = db.query(Pet).filter(Pet.id == pet_id).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")
        
    is_authorized_staff = any(r.name in ["ADMIN", "RECEPTIONIST", "VETERINARIAN"] for r in current_user.roles)
    if not is_authorized_staff:
        membership = db.query(PetMembership).filter(
            PetMembership.pet_id == pet.id,
            PetMembership.user_id == current_user.id
        ).first()
        if not membership or membership.role not in [MembershipRole.PRIMARY_OWNER, MembershipRole.CO_OWNER]:
            raise HTTPException(status_code=403, detail="Not enough permissions to modify pet records")
    return pet

@router.put("/{id}/lost_mode", response_model=PetResponse)
@router.put("/{id}/lost-mode", response_model=PetResponse)
@router.post("/{id}/lost_mode", response_model=PetResponse)
@router.post("/{id}/lost-mode", response_model=PetResponse)
def update_lost_mode(
    *,
    db: Session = Depends(deps.get_db),
    id: UUID,
    lost_mode_in: PetLostModeUpdate,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    pet = check_pet_permission(db, id, current_user)
    pet.lost_mode = lost_mode_in.lost_mode
    db.add(pet)
    db.commit()
    db.refresh(pet)
    return pet

@router.get("/{id}/qr")
def get_pet_qr(
    id: UUID,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    pet = check_pet_permission(db, id, current_user)
    qr = db.query(QRCode).filter(QRCode.pet_id == pet.id, QRCode.is_active == True).first()
    if not qr:
        import uuid
        qr = QRCode(pet_id=pet.id, token=str(uuid.uuid4()), is_active=True)
        db.add(qr)
        db.commit()
        db.refresh(qr)
    return {"token": qr.token, "is_active": qr.is_active, "pet_id": str(pet.id)}

@router.get("/{id}/timeline")
def get_pet_timeline(
    id: UUID,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    pet = check_pet_permission(db, id, current_user)
    events = []
    for v in pet.vaccinations:
        events.append({
            "type": "VACCINATION",
            "title": f"Tiêm vắc-xin: {v.name}",
            "date": str(v.vaccination_date),
            "description": f"Phòng khám: {v.clinic or 'PetCare'}. Mũi tiếp theo: {v.next_due_date or 'N/A'}"
        })
    for m in pet.medications:
        events.append({
            "type": "MEDICATION",
            "title": f"Kê đơn thuốc: {m.name}",
            "date": str(m.start_date or pet.created_at.date()),
            "description": f"Liều lượng: {m.dosage or 'Theo chỉ định'}. {m.notes or ''}"
        })
    for mr in pet.medical_records:
        events.append({
            "type": "MEDICAL_RECORD",
            "title": f"Khám bệnh: {mr.diagnosis or 'Khám tổng quát'}",
            "date": str(mr.visit_date),
            "description": f"Phác đồ: {mr.treatment or 'Theo dõi'}. Bác sĩ: {mr.veterinarian or 'PetCare Vet'}"
        })
    for w in pet.weights:
        events.append({
            "type": "WEIGHT",
            "title": f"Cân nặng: {w.weight_kg} kg",
            "date": str(w.recorded_at.date() if hasattr(w.recorded_at, 'date') else w.recorded_at),
            "description": "Theo dõi định kỳ chỉ số thể trạng"
        })
    events.sort(key=lambda x: str(x["date"]), reverse=True)
    return events

@router.get("/{id}/vaccinations", response_model=List[VaccinationResponse])
def get_vaccinations(
    id: UUID,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    pet = check_pet_permission(db, id, current_user)
    return pet.vaccinations

@router.get("/{id}/medications", response_model=List[MedicationResponse])
def get_medications(
    id: UUID,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    pet = check_pet_permission(db, id, current_user)
    return pet.medications

@router.get("/{id}/weights", response_model=List[WeightResponse])
@router.get("/{id}/weight", response_model=List[WeightResponse])
def get_weights(
    id: UUID,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    pet = check_pet_permission(db, id, current_user)
    return pet.weights

@router.get("/{id}/medical-records", response_model=List[MedicalRecordResponse])
@router.get("/{id}/medical_records", response_model=List[MedicalRecordResponse])
def get_medical_records(
    id: UUID,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    pet = check_pet_permission(db, id, current_user)
    return pet.medical_records

@router.post("/{id}/allergies", response_model=AllergyResponse)
def add_allergy(
    *,
    db: Session = Depends(deps.get_db),
    id: UUID,
    allergy_in: AllergyCreate,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    pet = check_pet_permission(db, id, current_user)
    allergy = Allergy(**allergy_in.model_dump(), pet_id=pet.id)
    db.add(allergy)
    db.commit()
    db.refresh(allergy)
    return allergy

@router.post("/{id}/conditions", response_model=ConditionResponse)
def add_condition(
    *,
    db: Session = Depends(deps.get_db),
    id: UUID,
    condition_in: ConditionCreate,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    pet = check_pet_permission(db, id, current_user)
    condition = Condition(**condition_in.model_dump(), pet_id=pet.id)
    db.add(condition)
    db.commit()
    db.refresh(condition)
    return condition

@router.post("/{id}/weights", response_model=WeightResponse)
@router.post("/{id}/weight", response_model=WeightResponse)
def add_weight(
    *,
    db: Session = Depends(deps.get_db),
    id: UUID,
    weight_in: WeightCreate,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    pet = check_pet_permission(db, id, current_user)
    weight = Weight(**weight_in.model_dump(), pet_id=pet.id)
    db.add(weight)
    db.commit()
    db.refresh(weight)
    return weight

@router.post("/{id}/vaccinations", response_model=VaccinationResponse)
def add_vaccination(
    *,
    db: Session = Depends(deps.get_db),
    id: UUID,
    vaccination_in: VaccinationCreate,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    pet = check_pet_permission(db, id, current_user)
    vaccination = Vaccination(**vaccination_in.model_dump(), pet_id=pet.id)
    db.add(vaccination)
    db.commit()
    db.refresh(vaccination)

    # Auto-deduct from inventory if a matching vaccine is in stock
    try:
        from app.models.inventory import InventoryItem, InventoryTransaction
        vax_name = vaccination_in.vaccine_name
        inv_item = db.query(InventoryItem).filter(
            InventoryItem.category == "VACCINE",
            InventoryItem.name.ilike(f"%{vax_name.split()[0]}%")
        ).first()
        if inv_item and inv_item.quantity > 0:
            inv_item.quantity -= 1
            tx = InventoryTransaction(
                item_id=inv_item.id,
                transaction_type="VACCINATION_DEDUCTION",
                quantity_change=-1,
                balance_after=inv_item.quantity,
                reference_id=str(vaccination.id),
                notes=f"Tự động xuất kho 1 liều cho thú cưng {pet.name} ({vax_name})",
                performed_by_id=current_user.id
            )
            db.add(tx)
            db.commit()
    except Exception:
        pass

    return vaccination

@router.post("/{id}/medications", response_model=MedicationResponse)
def add_medication(
    *,
    db: Session = Depends(deps.get_db),
    id: UUID,
    medication_in: MedicationCreate,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    pet = check_pet_permission(db, id, current_user)
    medication = Medication(**medication_in.model_dump(), pet_id=pet.id)
    db.add(medication)
    db.commit()
    db.refresh(medication)

    # Auto-deduct from inventory if a matching medicine is in stock
    try:
        from app.models.inventory import InventoryItem, InventoryTransaction
        med_name = medication_in.medication_name
        inv_item = db.query(InventoryItem).filter(
            InventoryItem.category == "MEDICINE",
            InventoryItem.name.ilike(f"%{med_name.split()[0]}%")
        ).first()
        if inv_item and inv_item.quantity > 0:
            inv_item.quantity -= 1
            tx = InventoryTransaction(
                item_id=inv_item.id,
                transaction_type="PRESCRIPTION_DEDUCTION",
                quantity_change=-1,
                balance_after=inv_item.quantity,
                reference_id=str(medication.id),
                notes=f"Tự động xuất kho thuốc cho thú cưng {pet.name} ({med_name})",
                performed_by_id=current_user.id
            )
            db.add(tx)
            db.commit()
    except Exception:
        pass

    return medication

@router.post("/{id}/medical_records", response_model=MedicalRecordResponse)
@router.post("/{id}/medical-records", response_model=MedicalRecordResponse)
def add_medical_record(
    *,
    db: Session = Depends(deps.get_db),
    id: UUID,
    record_in: MedicalRecordCreate,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    pet = check_pet_permission(db, id, current_user)
    record = MedicalRecord(**record_in.model_dump(), pet_id=pet.id)
    db.add(record)
    db.commit()
    db.refresh(record)
    return record

@router.delete("/{id}/allergies/{item_id}")
def delete_allergy(
    *,
    db: Session = Depends(deps.get_db),
    id: UUID,
    item_id: UUID,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    pet = check_pet_permission(db, id, current_user)
    item = db.query(Allergy).filter(Allergy.id == item_id, Allergy.pet_id == pet.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Allergy not found")
    db.delete(item)
    db.commit()
    return {"status": "success", "message": "Allergy deleted"}

@router.delete("/{id}/conditions/{item_id}")
def delete_condition(
    *,
    db: Session = Depends(deps.get_db),
    id: UUID,
    item_id: UUID,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    pet = check_pet_permission(db, id, current_user)
    item = db.query(Condition).filter(Condition.id == item_id, Condition.pet_id == pet.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Condition not found")
    db.delete(item)
    db.commit()
    return {"status": "success", "message": "Condition deleted"}

@router.delete("/{id}/weights/{item_id}")
def delete_weight(
    *,
    db: Session = Depends(deps.get_db),
    id: UUID,
    item_id: UUID,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    pet = check_pet_permission(db, id, current_user)
    item = db.query(Weight).filter(Weight.id == item_id, Weight.pet_id == pet.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Weight record not found")
    db.delete(item)
    db.commit()
    return {"status": "success", "message": "Weight record deleted"}

@router.delete("/{id}/vaccinations/{item_id}")
def delete_vaccination(
    *,
    db: Session = Depends(deps.get_db),
    id: UUID,
    item_id: UUID,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    pet = check_pet_permission(db, id, current_user)
    item = db.query(Vaccination).filter(Vaccination.id == item_id, Vaccination.pet_id == pet.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Vaccination record not found")
    db.delete(item)
    db.commit()
    return {"status": "success", "message": "Vaccination record deleted"}

@router.delete("/{id}/medications/{item_id}")
def delete_medication(
    *,
    db: Session = Depends(deps.get_db),
    id: UUID,
    item_id: UUID,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    pet = check_pet_permission(db, id, current_user)
    item = db.query(Medication).filter(Medication.id == item_id, Medication.pet_id == pet.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Medication not found")
    db.delete(item)
    db.commit()
    return {"status": "success", "message": "Medication deleted"}

@router.delete("/{id}/medical_records/{item_id}")
@router.delete("/{id}/medical-records/{item_id}")
def delete_medical_record(
    *,
    db: Session = Depends(deps.get_db),
    id: UUID,
    item_id: UUID,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    pet = check_pet_permission(db, id, current_user)
    item = db.query(MedicalRecord).filter(MedicalRecord.id == item_id, MedicalRecord.pet_id == pet.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Medical record not found")
    db.delete(item)
    db.commit()
    return {"status": "success", "message": "Medical record deleted"}

import os
import base64
from app.core.ai_service import ai_service

@router.post("/{id}/documents/scan", response_model=PetDocumentResponse)
async def scan_document(
    *,
    db: Session = Depends(deps.get_db),
    id: UUID,
    file: UploadFile = File(...),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    pet = check_pet_permission(db, id, current_user)
    
    os.makedirs("uploads", exist_ok=True)
    import uuid
    file_path = f"uploads/{uuid.uuid4()}_{file.filename}"
    
    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)
        
    image_b64 = base64.b64encode(content).decode("utf-8")
    
    extracted_data = ai_service.scan_document(image_b64)
    
    doc = PetDocument(
        pet_id=pet.id,
        title=file.filename or "Scanned Document",
        file_url=file_path,
        status="PENDING_REVIEW",
        extracted_data=extracted_data
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc

@router.put("/{id}/documents/{doc_id}/confirm", response_model=PetDocumentResponse)
def confirm_document(
    *,
    db: Session = Depends(deps.get_db),
    id: UUID,
    doc_id: UUID,
    confirm_in: PetDocumentConfirmRequest,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    pet = check_pet_permission(db, id, current_user)
    
    doc = db.query(PetDocument).filter(PetDocument.id == doc_id, PetDocument.pet_id == pet.id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    doc.status = "CONFIRMED"
    doc.title = confirm_in.title
    doc.document_type = confirm_in.document_type
    
    if confirm_in.document_type == "VACCINATION" and confirm_in.vaccine_name and confirm_in.vaccination_date:
        vaccination = Vaccination(
            pet_id=pet.id,
            name=confirm_in.vaccine_name,
            vaccination_date=confirm_in.vaccination_date,
            next_due_date=confirm_in.next_due_date,
            clinic=confirm_in.clinic,
            document_url=doc.file_url
        )
        db.add(vaccination)
        
    elif confirm_in.document_type in ["PRESCRIPTION", "MEDICAL_REPORT", "LAB_RESULT"] and confirm_in.vaccination_date:
        # Fallback to use vaccination_date field for visit_date since that's what the AI outputs for dates
        record = MedicalRecord(
            pet_id=pet.id,
            visit_date=confirm_in.vaccination_date,
            clinic=confirm_in.clinic,
            veterinarian=confirm_in.veterinarian,
            diagnosis=confirm_in.diagnosis,
            document_url=doc.file_url
        )
        db.add(record)
        
    db.add(doc)
    db.commit()
    db.refresh(doc)
    
    return doc

@router.get("/{id}/documents", response_model=List[PetDocumentResponse])
def get_pet_documents(
    *,
    db: Session = Depends(deps.get_db),
    id: UUID,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    pet = check_pet_permission(db, id, current_user)
    docs = db.query(PetDocument).filter(PetDocument.pet_id == pet.id).order_by(PetDocument.upload_date.desc()).all()
    return docs

@router.get("/{id}/lost_reports", response_model=List[LostPetReportResponse])
def get_lost_reports(
    *,
    db: Session = Depends(deps.get_db),
    id: UUID,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    pet = check_pet_permission(db, id, current_user)
    reports = db.query(LostPetReport).filter(LostPetReport.pet_id == pet.id).order_by(LostPetReport.created_at.desc()).all()
    return reports

@router.get("/{id}/members", response_model=List[PetMemberResponse])
def get_pet_members(
    *,
    db: Session = Depends(deps.get_db),
    id: UUID,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    pet = check_pet_permission(db, id, current_user)
    memberships = db.query(PetMembership).filter(PetMembership.pet_id == pet.id).all()
    return memberships

@router.post("/{id}/members", response_model=PetMemberResponse)
def add_pet_member(
    *,
    db: Session = Depends(deps.get_db),
    id: UUID,
    member_in: PetMemberCreate,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    pet = check_pet_permission(db, id, current_user)
    target_user = db.query(User).filter(User.email == member_in.email).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="Không tìm thấy người dùng với email này trong hệ thống.")
        
    existing = db.query(PetMembership).filter(
        PetMembership.pet_id == pet.id,
        PetMembership.user_id == target_user.id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Người dùng này đã là thành viên chăm sóc thú cưng.")
        
    new_membership = PetMembership(
        user_id=target_user.id,
        pet_id=pet.id,
        role=member_in.role
    )
    db.add(new_membership)
    db.commit()
    db.refresh(new_membership)
    return new_membership

@router.put("/{id}/members/{membership_id}", response_model=PetMemberResponse)
def update_pet_member_role(
    *,
    db: Session = Depends(deps.get_db),
    id: UUID,
    membership_id: UUID,
    role_in: PetMemberRoleUpdate,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    pet = check_pet_permission(db, id, current_user)
    membership = db.query(PetMembership).filter(
        PetMembership.id == membership_id,
        PetMembership.pet_id == pet.id
    ).first()
    if not membership:
        raise HTTPException(status_code=404, detail="Không tìm thấy thành viên.")
        
    if membership.role == MembershipRole.PRIMARY_OWNER and role_in.role != MembershipRole.PRIMARY_OWNER:
        raise HTTPException(status_code=400, detail="Không thể thay đổi vai trò của Chủ sở hữu chính.")
        
    membership.role = role_in.role
    db.commit()
    db.refresh(membership)
    return membership

@router.delete("/{id}/members/{membership_id}")
def remove_pet_member(
    *,
    db: Session = Depends(deps.get_db),
    id: UUID,
    membership_id: UUID,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    pet = check_pet_permission(db, id, current_user)
    membership = db.query(PetMembership).filter(
        PetMembership.id == membership_id,
        PetMembership.pet_id == pet.id
    ).first()
    if not membership:
        raise HTTPException(status_code=404, detail="Không tìm thấy thành viên.")
        
    if membership.role == MembershipRole.PRIMARY_OWNER:
        raise HTTPException(status_code=400, detail="Không thể xóa Chủ sở hữu chính.")
        
    db.delete(membership)
    db.commit()
    return {"message": "Đã xóa thành viên thành công"}

class OwnershipTransferRequest(BaseModel):
    new_owner_email: str
    reason: Optional[str] = None

@router.post("/{id}/transfer-ownership")
def transfer_pet_ownership(
    *,
    db: Session = Depends(deps.get_db),
    id: UUID,
    transfer_in: OwnershipTransferRequest,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    from app.models.audit_log import AuditLog
    pet = db.query(Pet).filter(Pet.id == id).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Không tìm thấy thú cưng")

    # Check that current user is PRIMARY_OWNER or ADMIN
    is_admin = any(r.name == "ADMIN" for r in current_user.roles)
    current_membership = db.query(PetMembership).filter(
        PetMembership.pet_id == pet.id,
        PetMembership.user_id == current_user.id
    ).first()
    
    if not is_admin and (not current_membership or current_membership.role != MembershipRole.PRIMARY_OWNER):
        raise HTTPException(status_code=403, detail="Chỉ Chủ sở hữu chính mới có quyền chuyển nhượng thú cưng.")

    target_user = db.query(User).filter(User.email == transfer_in.new_owner_email).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="Không tìm thấy người nhận với email này trong hệ thống.")

    if target_user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Bạn đã là chủ sở hữu của thú cưng này.")

    # Demote old primary owner to CO_OWNER
    if current_membership:
        current_membership.role = MembershipRole.CO_OWNER

    # Promote or create new membership as PRIMARY_OWNER
    target_membership = db.query(PetMembership).filter(
        PetMembership.pet_id == pet.id,
        PetMembership.user_id == target_user.id
    ).first()

    if target_membership:
        target_membership.role = MembershipRole.PRIMARY_OWNER
    else:
        target_membership = PetMembership(
            pet_id=pet.id,
            user_id=target_user.id,
            role=MembershipRole.PRIMARY_OWNER
        )
        db.add(target_membership)

    # Record in Audit Log
    log = AuditLog(
        user_id=current_user.id,
        action="PET_OWNERSHIP_TRANSFER",
        entity_type="PET",
        entity_id=str(pet.id),
        details_json={
            "pet_name": pet.name,
            "old_owner_id": str(current_user.id),
            "new_owner_id": str(target_user.id),
            "new_owner_email": target_user.email,
            "reason": transfer_in.reason or "Chuyển nhượng quyền sở hữu thú cưng"
        }
    )
    db.add(log)
    db.commit()

    return {
        "message": f"Chuyển nhượng quyền sở hữu thú cưng {pet.name} sang {target_user.email} thành công!",
        "new_owner_email": target_user.email
    }

@router.get("/{id}/health-insights")
def get_pet_health_insights(
    *,
    db: Session = Depends(deps.get_db),
    id: UUID,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    AI Health Insights: Analyzes weight trend, vaccination compliance,
    and lifestyle suggestions.
    """
    pet = check_pet_permission(db, id, current_user)
    
    weights = db.query(Weight).filter(Weight.pet_id == pet.id).order_by(Weight.recorded_at.asc()).all()
    vaccines = db.query(Vaccination).filter(Vaccination.pet_id == pet.id).all()
    conditions = db.query(Condition).filter(Condition.pet_id == pet.id).all()
    allergies = db.query(Allergy).filter(Allergy.pet_id == pet.id).all()

    # Weight trend calculation
    weight_trend = "Ổn định"
    weight_change_pct = 0.0
    if len(weights) >= 2:
        start_w = weights[0].weight_kg
        end_w = weights[-1].weight_kg
        if start_w > 0:
            weight_change_pct = round(((end_w - start_w) / start_w) * 100, 1)
            if weight_change_pct > 10:
                weight_trend = "Tăng cân nhanh - Cần kiểm soát khẩu phần"
            elif weight_change_pct < -10:
                weight_trend = "Sụt cân - Khuyến nghị tái khám thú y"
            else:
                weight_trend = "Thể trạng lý tưởng và ổn định"

    # Vaccine compliance
    vaccine_status = "Đầy đủ" if len(vaccines) >= 3 else "Cần bổ sung mũi tiêm định kỳ"

    # Age calculation
    from datetime import date
    age_str = "Chưa rõ độ tuổi"
    life_stage = "Trưởng thành"
    if pet.date_of_birth:
        today = date.today()
        years = today.year - pet.date_of_birth.year
        age_str = f"{years} tuổi"
        if years < 1:
            life_stage = "Thú cưng nhỏ (Puppy/Kitten)"
        elif years > 7:
            life_stage = "Cao tuổi (Senior)"

    insights = [
        {
            "category": "Cân nặng & Thể trạng",
            "status": weight_trend,
            "description": f"Ghi nhận {len(weights)} lần đo cân nặng. Thay đổi tích lũy: {weight_change_pct}% so với mốc ban đầu.",
            "recommendation": "Duy trì chế độ vận động tối thiểu 30 phút mỗi ngày và bổ sung đạm chất lượng cao."
        },
        {
            "category": "Miễn dịch & Tiêm chủng",
            "status": vaccine_status,
            "description": f"Đã ghi nhận {len(vaccines)} mũi tiêm phòng trong sổ y bạ số.",
            "recommendation": "Kiểm tra lịch tiêm nhắc lại hàng năm đối với bệnh dại và bệnh truyền nhiễm."
        }
    ]

    if conditions:
        insights.append({
            "category": "Bệnh lý đang quản lý",
            "status": f"{len(conditions)} bệnh lý ghi nhận",
            "description": ", ".join(c.name for c in conditions),
            "recommendation": "Tránh các hoạt động quá sức và tuân thủ đơn thuốc định kỳ của bác sĩ."
        })

    if allergies:
        insights.append({
            "category": "Dị ứng & Dinh dưỡng",
            "status": f"{len(allergies)} cảnh báo dị ứng",
            "description": ", ".join(a.name for a in allergies),
            "recommendation": "Đảm bảo thực phẩm không chứa thành phần gây kích ứng."
        })

    return {
        "pet_name": pet.name,
        "species": pet.species,
        "breed": pet.breed,
        "life_stage": life_stage,
        "age": age_str,
        "weight_trend": weight_trend,
        "weight_change_pct": weight_change_pct,
        "insights": insights
    }


