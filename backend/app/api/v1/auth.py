from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.api import deps
from app.core.security import verify_password, create_access_token, get_password_hash
from app.models.user import User, Role
from app.schemas.user import Token, UserResponse, UserCreate, UserUpdate

router = APIRouter()

@router.post("/login", response_model=Token)
def login_access_token(
    db: Session = Depends(deps.get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    email_lower = form_data.username.lower()
    user = db.query(User).filter(User.email == email_lower).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password",
        )
    elif not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user"
        )
    return {
        "access_token": create_access_token(user.id),
        "token_type": "bearer",
    }

@router.post("/register", response_model=UserResponse)
def register_user(
    *,
    db: Session = Depends(deps.get_db),
    user_in: UserCreate,
) -> Any:
    """
    Create new user. (Customer role by default)
    """
    email_lower = user_in.email.lower()
    user = db.query(User).filter(User.email == email_lower).first()
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The user with this username already exists in the system.",
        )
    user_obj = User(
        email=email_lower,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
    )
    
    # Assign requested role (fallback to CUSTOMER if not provided or invalid)
    role_name = user_in.role if user_in.role in ["ADMIN", "RECEPTIONIST", "VETERINARIAN", "CAREGIVER", "CUSTOMER"] else "CUSTOMER"
    requested_role = db.query(Role).filter(Role.name == role_name).first()
    if requested_role:
        user_obj.roles.append(requested_role)
        
    db.add(user_obj)
    db.commit()
    db.refresh(user_obj)
    return user_obj

@router.get("/me", response_model=UserResponse)
def read_users_me(
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get current user.
    """
    return current_user


@router.put("/me", response_model=UserResponse)
def update_user_me(
    user_in: UserUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update own user profile.
    """
    if user_in.full_name is not None:
        current_user.full_name = user_in.full_name
    if user_in.password is not None and user_in.password.strip():
        current_user.hashed_password = get_password_hash(user_in.password)
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user
