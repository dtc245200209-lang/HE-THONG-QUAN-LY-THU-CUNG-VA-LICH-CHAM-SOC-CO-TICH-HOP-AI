from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

from app.api import deps
from app.models.notification import Notification
from app.models.user import User
from app.schemas.notification import NotificationCreate, NotificationResponse
from app.workers.celery_worker import run_smart_reminders_sync

router = APIRouter()

@router.get("", response_model=List[NotificationResponse])
def get_notifications(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    notifications = db.query(Notification).filter(Notification.user_id == current_user.id).order_by(Notification.created_at.desc()).all()
    return notifications

@router.put("/{id}/read", response_model=NotificationResponse)
def read_notification(
    *,
    db: Session = Depends(deps.get_db),
    id: UUID,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    notification = db.query(Notification).filter(Notification.id == id, Notification.user_id == current_user.id).first()
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
        
    notification.is_read = True
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification

@router.post("/trigger-reminders")
def trigger_smart_reminders(
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Run smart reminder engine to scan vaccinations, medications, and upcoming visits.
    """
    result = run_smart_reminders_sync()
    return result
