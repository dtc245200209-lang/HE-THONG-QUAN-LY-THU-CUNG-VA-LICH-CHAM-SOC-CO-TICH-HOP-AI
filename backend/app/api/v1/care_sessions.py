from typing import Any, List
from uuid import UUID
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api import deps
from app.models.user import User
from app.models.appointment import Appointment, AppointmentStatus
from app.models.care_session import CareSession, CareEvent, CareReport, CareSessionStatus
from app.schemas.care_session import (
    CareSessionResponse, CareEventResponse, CareEventCreate,
    CareReportDraftRequest, CareReportResponse, CareReportBase
)
from app.core.ai_service import ai_service
from app.api.v1.websockets import manager

router = APIRouter()

@router.get("/brief/{pet_id}")
def get_care_brief(
    *,
    db: Session = Depends(deps.get_db),
    pet_id: UUID,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    # Only CAREGIVER, ADMIN, RECEPTIONIST can access
    roles = [r.name for r in current_user.roles]
    if not any(r in roles for r in ["CAREGIVER", "ADMIN", "RECEPTIONIST"]):
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    brief = ai_service.generate_care_brief(db, str(pet_id))
    return {"brief": brief}


@router.post("/{appointment_id}/start", response_model=CareSessionResponse)
async def start_care_session(
    *,
    db: Session = Depends(deps.get_db),
    appointment_id: UUID,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    session = db.query(CareSession).filter(CareSession.appointment_id == appointment_id).first()
    if session:
        if session.status == CareSessionStatus.PENDING:
            session.status = CareSessionStatus.ACTIVE
            session.started_at = datetime.now(timezone.utc)
            appointment.status = AppointmentStatus.IN_PROGRESS
            db.commit()
            db.refresh(session)
    else:
        session = CareSession(
            appointment_id=appointment_id,
            caregiver_id=current_user.id,
            status=CareSessionStatus.ACTIVE,
            started_at=datetime.now(timezone.utc)
        )
        appointment.status = AppointmentStatus.IN_PROGRESS
        db.add(session)
        db.commit()
        db.refresh(session)

    # Realtime notification
    payload = {
        "type": "SESSION_STARTED",
        "session_id": str(session.id),
        "appointment_id": str(appointment_id),
        "started_at": str(session.started_at)
    }
    await manager.broadcast_to_session(str(session.id), payload)
    if appointment.customer_id:
        await manager.send_to_user(str(appointment.customer_id), payload)

    return session

@router.post("/{id}/events", response_model=CareEventResponse)
async def add_care_event(
    *,
    db: Session = Depends(deps.get_db),
    id: UUID,
    event_in: CareEventCreate,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    session = db.query(CareSession).filter(CareSession.id == id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Care session not found")
        
    event = CareEvent(
        session_id=id,
        event_type=event_in.event_type,
        content=event_in.content,
        media_url=event_in.media_url
    )
    db.add(event)
    db.commit()
    db.refresh(event)

    # Broadcast care event via WebSocket to session room and pet owner
    event_type_str = event.event_type.value if hasattr(event.event_type, "value") else str(event.event_type)
    event_payload = {
        "type": "NEW_CARE_EVENT",
        "session_id": str(id),
        "event": {
            "id": str(event.id),
            "session_id": str(event.session_id),
            "event_type": event_type_str,
            "content": event.content,
            "media_url": event.media_url,
            "timestamp": event.timestamp.isoformat() if event.timestamp else None
        }
    }
    await manager.broadcast_to_session(str(id), event_payload)
    if session.appointment and session.appointment.customer_id:
        await manager.send_to_user(str(session.appointment.customer_id), event_payload)

    return event

@router.get("/{id}", response_model=CareSessionResponse)
def get_care_session(
    *,
    db: Session = Depends(deps.get_db),
    id: UUID,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    session = db.query(CareSession).filter(CareSession.id == id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Care session not found")
    return session

@router.get("/appointment/{appointment_id}", response_model=CareSessionResponse)
def get_care_session_by_appointment(
    *,
    db: Session = Depends(deps.get_db),
    appointment_id: UUID,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    session = db.query(CareSession).filter(CareSession.appointment_id == appointment_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Care session not found for this appointment")
    return session

@router.post("/{id}/report/generate")
def generate_care_report(
    *,
    id: UUID,
    request: CareReportDraftRequest,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    result = ai_service.analyze_care_session(request.model_dump())
    return {
        "summary": result.get("summary", ""),
        "recommendations": result.get("recommendations", ""),
        "metrics": result.get("metrics", {})
    }

@router.post("/{id}/report/confirm", response_model=CareReportResponse)
async def confirm_care_report(
    *,
    db: Session = Depends(deps.get_db),
    id: UUID,
    report_in: CareReportBase,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    session = db.query(CareSession).filter(CareSession.id == id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Care session not found")
        
    if session.report:
        raise HTTPException(status_code=400, detail="Report already exists for this session")
        
    report = CareReport(
        session_id=id,
        summary=report_in.summary,
        recommendations=report_in.recommendations,
        health_metrics_json=report_in.health_metrics_json
    )
    db.add(report)
    
    session.status = CareSessionStatus.COMPLETED
    session.ended_at = datetime.now(timezone.utc)
    if session.appointment:
        session.appointment.status = AppointmentStatus.COMPLETED
    
    db.commit()
    db.refresh(report)

    # Realtime notification
    payload = {
        "type": "SESSION_COMPLETED",
        "session_id": str(id),
        "ended_at": str(session.ended_at),
        "report_id": str(report.id)
    }
    await manager.broadcast_to_session(str(id), payload)
    if session.appointment and session.appointment.customer_id:
        await manager.send_to_user(str(session.appointment.customer_id), payload)

    return report

@router.post("/{appointment_id}/complete")
async def complete_care_session_by_appointment(
    *,
    db: Session = Depends(deps.get_db),
    appointment_id: UUID,
    payload: dict,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    session = db.query(CareSession).filter(CareSession.appointment_id == appointment_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Care session not found")

    notes = payload.get("notes", "Đã hoàn thành ca chăm sóc")
    if not session.report:
        report = CareReport(
            session_id=session.id,
            summary=notes,
            recommendations="Tiếp tục theo dõi tình trạng ăn uống và vận động của thú cưng.",
            health_metrics_json={"status": "Good"}
        )
        db.add(report)

    session.status = CareSessionStatus.COMPLETED
    session.ended_at = datetime.now(timezone.utc)
    if session.appointment:
        session.appointment.status = AppointmentStatus.COMPLETED

    db.commit()

    finish_payload = {
        "type": "SESSION_COMPLETED",
        "session_id": str(session.id),
        "ended_at": str(session.ended_at)
    }
    await manager.broadcast_to_session(str(session.id), finish_payload)
    if session.appointment and session.appointment.customer_id:
        await manager.send_to_user(str(session.appointment.customer_id), finish_payload)

    return {"message": "Care session completed successfully", "session_id": str(session.id)}
