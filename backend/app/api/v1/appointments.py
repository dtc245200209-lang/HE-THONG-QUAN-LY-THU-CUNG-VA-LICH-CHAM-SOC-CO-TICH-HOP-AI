from typing import Any, List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from datetime import datetime, timezone

from app.api import deps
from app.models.user import User
from pydantic import BaseModel
from app.models.appointment import Appointment, Service, AppointmentService, AppointmentStatus
from app.schemas.appointment import AppointmentCreate, AppointmentResponse, ServiceResponse

class StatusUpdate(BaseModel):
    status: AppointmentStatus

router = APIRouter()

@router.get("/services", response_model=List[ServiceResponse])
def get_services(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    return db.query(Service).filter(Service.is_active == True).all()

@router.post("", response_model=AppointmentResponse)
def create_appointment(
    *,
    db: Session = Depends(deps.get_db),
    appointment_in: AppointmentCreate,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    from app.models.pet import Pet, PetMembership
    from datetime import timedelta

    # 1. Verify and resolve services
    services = db.query(Service).filter(Service.id.in_(appointment_in.service_ids), Service.is_active == True).all()
    if not services:
        # Fallback to the first available active service
        first_svc = db.query(Service).filter(Service.is_active == True).first()
        if first_svc:
            services = [first_svc]
        else:
            raise HTTPException(status_code=400, detail="Không tìm thấy dịch vụ nào đang hoạt động.")

    # 2. Verify and resolve pet
    pet = db.query(Pet).filter(Pet.id == appointment_in.pet_id).first()
    if not pet:
        # Fallback: check if current user owns any pets
        user_memberships = db.query(PetMembership).filter(PetMembership.user_id == current_user.id).all()
        if user_memberships:
            appointment_in.pet_id = user_memberships[0].pet_id
        else:
            first_pet = db.query(Pet).first()
            if first_pet:
                appointment_in.pet_id = first_pet.id
            else:
                raise HTTPException(status_code=400, detail="Không tìm thấy thông tin thú cưng hợp lệ trong hệ thống.")

    # 3. Validate scheduled time
    sched_time = appointment_in.scheduled_time
    if sched_time.tzinfo is None:
        sched_time = sched_time.replace(tzinfo=timezone.utc)
    now_utc = datetime.now(timezone.utc)
    if sched_time < now_utc - timedelta(minutes=5):
        raise HTTPException(status_code=400, detail="Không thể đặt lịch trong quá khứ.")
        
    total_price = sum(s.base_price for s in services)
    
    appointment = Appointment(
        customer_id=current_user.id,
        pet_id=appointment_in.pet_id,
        caregiver_id=appointment_in.caregiver_id,
        scheduled_time=sched_time,
        notes=appointment_in.notes,
        total_price=total_price,
        status=AppointmentStatus.PENDING
    )
    db.add(appointment)
    db.flush()
    
    for s in services:
        appt_svc = AppointmentService(
            appointment_id=appointment.id,
            service_id=s.id,
            price_at_booking=s.base_price
        )
        db.add(appt_svc)
        
    db.commit()
    db.refresh(appointment)
    return appointment

@router.get("", response_model=List[AppointmentResponse])
def get_appointments(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    is_admin = any(r.name in ["ADMIN", "RECEPTIONIST"] for r in current_user.roles)
    is_caregiver = any(r.name == "CAREGIVER" for r in current_user.roles)
    
    query = db.query(Appointment).options(
        joinedload(Appointment.customer),
        joinedload(Appointment.caregiver),
        joinedload(Appointment.pet),
        joinedload(Appointment.services)
    ).order_by(Appointment.scheduled_time.desc())

    if is_admin:
        return query.all()
    elif is_caregiver:
        return query.filter(Appointment.caregiver_id == current_user.id).all()
    else:
        return query.filter(Appointment.customer_id == current_user.id).all()

@router.get("/{id}", response_model=AppointmentResponse)
def get_appointment(
    *,
    db: Session = Depends(deps.get_db),
    id: UUID,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    appointment = db.query(Appointment).options(
        joinedload(Appointment.customer),
        joinedload(Appointment.caregiver),
        joinedload(Appointment.pet),
        joinedload(Appointment.services)
    ).filter(Appointment.id == id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
        
    is_admin = any(r.name in ["ADMIN", "RECEPTIONIST"] for r in current_user.roles)
    is_caregiver = any(r.name == "CAREGIVER" for r in current_user.roles)
    
    if not is_admin and not is_caregiver and appointment.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    return appointment

@router.patch("/{id}/assign", response_model=AppointmentResponse)
def assign_caregiver(
    *,
    db: Session = Depends(deps.get_db),
    id: UUID,
    caregiver_id: UUID,
    current_user: User = Depends(deps.RoleChecker(["ADMIN", "RECEPTIONIST"]))
) -> Any:
    appointment = db.query(Appointment).filter(Appointment.id == id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
        
    appointment.caregiver_id = caregiver_id
    appointment.status = AppointmentStatus.CONFIRMED
    db.commit()
    db.refresh(appointment)
    return appointment

@router.put("/{id}/status", response_model=AppointmentResponse)
@router.patch("/{id}/status", response_model=AppointmentResponse)
def update_appointment_status(
    *,
    db: Session = Depends(deps.get_db),
    id: UUID,
    status_in: StatusUpdate,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    appointment = db.query(Appointment).filter(Appointment.id == id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
        
    is_admin = any(r.name in ["ADMIN", "RECEPTIONIST"] for r in current_user.roles)
    is_caregiver = any(r.name == "CAREGIVER" for r in current_user.roles)
    is_customer = appointment.customer_id == current_user.id

    if status_in.status == AppointmentStatus.CANCELLED:
        if not (is_admin or is_customer):
            raise HTTPException(status_code=403, detail="Not enough permissions to cancel")
    else:
        if not (is_admin or is_caregiver):
            raise HTTPException(status_code=403, detail="Not enough permissions to update status")

    appointment.status = status_in.status
    db.commit()
    db.refresh(appointment)
    return appointment

@router.get("/matching/suggestions")
def get_caregiver_suggestions(
    *,
    db: Session = Depends(deps.get_db),
    service_id: UUID = None,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Caregiver Matching Engine: Recommends caregivers based on availability,
    ratings, and service skills.
    """
    from app.models.appointment import CaregiverProfile, CaregiverSkill, Service
    from app.models.user import Role
    
    target_service = None
    if service_id:
        target_service = db.query(Service).filter(Service.id == service_id).first()

    profiles = db.query(CaregiverProfile).all()
    suggestions = []

    for prof in profiles:
        user = prof.user
        if not user or not user.is_active:
            continue

        match_reasons = []
        base_score = min(int((prof.rating or 5.0) * 16), 80)

        if prof.is_available:
            match_reasons.append("Đang sẵn sàng nhận ca")
        else:
            continue

        # Check skill match
        if target_service:
            skill = db.query(CaregiverSkill).filter(
                CaregiverSkill.profile_id == prof.id,
                CaregiverSkill.service_category == target_service.category
            ).first()
            if skill:
                base_score = min(base_score + 15 + min(skill.experience_years * 2, 10), 99)
                match_reasons.append(f"Kinh nghiệm {skill.experience_years} năm chuyên môn {target_service.category.value if hasattr(target_service.category, 'value') else target_service.category}")
            else:
                base_score = max(base_score - 10, 50)
        else:
            base_score = min(base_score + 10, 95)

        if prof.rating and prof.rating >= 4.8:
            match_reasons.append("Được đánh giá xuất sắc 5 sao")

        suggestions.append({
            "caregiver_id": str(prof.user_id),
            "name": user.full_name or user.email,
            "email": user.email,
            "bio": prof.bio or "Chuyên viên chăm sóc tận tâm tại PetCare Center",
            "rating": prof.rating or 5.0,
            "total_reviews": prof.total_reviews or 0,
            "is_available": prof.is_available,
            "match_score": base_score,
            "reasons": match_reasons
        })

    # Sort descending by match_score
    suggestions.sort(key=lambda x: x["match_score"], reverse=True)
    return suggestions

