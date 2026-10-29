from typing import Any, List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.api import deps
from app.models.user import User, Role
from app.schemas.user import UserResponse, UserCreate, UserUpdate
from app.core.security import get_password_hash

router = APIRouter()

@router.get("", response_model=List[UserResponse])
def get_users(
    role: Optional[str] = Query(None, description="Filter by role (e.g. CAREGIVER)"),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    # Only Admin and Receptionist can list users
    roles = [r.name for r in current_user.roles]
    if not any(r in roles for r in ["ADMIN", "RECEPTIONIST"]):
        raise HTTPException(status_code=403, detail="Not enough permissions")

    query = db.query(User)
    if role:
        query = query.join(User.roles).filter(Role.name == role.upper())
        
    return query.all()

@router.post("", response_model=UserResponse)
def create_user_admin(
    *,
    db: Session = Depends(deps.get_db),
    user_in: UserCreate,
    current_user: User = Depends(deps.RoleChecker(["ADMIN", "RECEPTIONIST"]))
) -> Any:
    """Admin or Receptionist creates a new user or customer."""
    user_roles = [r.name for r in current_user.roles]
    role_name = (user_in.role or "CUSTOMER").upper()
    if "ADMIN" not in user_roles and role_name != "CUSTOMER":
        raise HTTPException(status_code=403, detail="Lễ tân chỉ có quyền đăng ký tài khoản Khách hàng (CUSTOMER)")

    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        is_active=True
    )
    db.add(user)
    db.flush()

    role_name = (user_in.role or "CUSTOMER").upper()
    role = db.query(Role).filter(Role.name == role_name).first()
    if not role:
        role = Role(name=role_name, description=f"Role {role_name}")
        db.add(role)
        db.flush()

    user.roles.append(role)
    db.commit()
    db.refresh(user)
    return user

@router.put("/{id}", response_model=UserResponse)
def update_user_admin(
    *,
    db: Session = Depends(deps.get_db),
    id: UUID,
    user_in: UserUpdate,
    current_user: User = Depends(deps.RoleChecker(["ADMIN", "RECEPTIONIST"]))
) -> Any:
    """Admin or Receptionist updates user profile or status."""
    user = db.query(User).filter(User.id == id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user_in.email is not None:
        user.email = user_in.email
    if user_in.full_name is not None:
        user.full_name = user_in.full_name
    if user_in.is_active is not None:
        user.is_active = user_in.is_active
    if user_in.password:
        user.hashed_password = get_password_hash(user_in.password)

    db.commit()
    db.refresh(user)
    return user

@router.patch("/{id}/toggle-status", response_model=UserResponse)
def toggle_user_status(
    *,
    db: Session = Depends(deps.get_db),
    id: UUID,
    current_user: User = Depends(deps.RoleChecker(["ADMIN", "RECEPTIONIST"]))
) -> Any:
    """Toggle user active status."""
    user = db.query(User).filter(User.id == id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = not user.is_active
    db.commit()
    db.refresh(user)
    return user

