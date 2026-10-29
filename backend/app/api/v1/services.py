from typing import List, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from uuid import UUID

from app.api import deps
from app.models.appointment import Service
from app.models.user import User
from app.schemas.service import ServiceCreate, ServiceResponse, ServiceUpdate

router = APIRouter()

@router.get("", response_model=List[ServiceResponse])
def get_services(
    include_inactive: bool = Query(False, description="Include inactive services"),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    is_admin = any(r.name in ["ADMIN", "RECEPTIONIST"] for r in current_user.roles)
    if is_admin and include_inactive:
        services = db.query(Service).all()
    else:
        services = db.query(Service).filter(Service.is_active == True).all()
    return services

@router.post("", response_model=ServiceResponse)
def create_service(
    *,
    db: Session = Depends(deps.get_db),
    service_in: ServiceCreate,
    current_user: User = Depends(deps.RoleChecker(["ADMIN"]))
) -> Any:
    service = Service(**service_in.model_dump())
    db.add(service)
    db.commit()
    db.refresh(service)
    return service

@router.put("/{id}", response_model=ServiceResponse)
def update_service(
    *,
    db: Session = Depends(deps.get_db),
    id: UUID,
    service_in: ServiceUpdate,
    current_user: User = Depends(deps.RoleChecker(["ADMIN"]))
) -> Any:
    service = db.query(Service).filter(Service.id == id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    update_data = service_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(service, field, value)

    db.commit()
    db.refresh(service)
    return service

@router.delete("/{id}")
def delete_service(
    *,
    db: Session = Depends(deps.get_db),
    id: UUID,
    current_user: User = Depends(deps.RoleChecker(["ADMIN"]))
) -> Any:
    service = db.query(Service).filter(Service.id == id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    service.is_active = False
    db.commit()
    return {"status": "success", "message": "Service deactivated"}

