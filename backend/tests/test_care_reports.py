import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from uuid import uuid4
from datetime import datetime, timezone

from app.models.appointment import Appointment, AppointmentStatus
from app.models.care_session import CareSession
from app.models.user import User, Role
from app.core.ai_service import AIService

def get_token_headers(client: TestClient, role_name: str = "CUSTOMER"):
    email = f"{role_name.lower()}_report@example.com"
    client.post(
        "/api/v1/auth/register",
        json={
            "email": email,
            "password": "password123",
            "full_name": f"Test {role_name}"
        }
    )
    response = client.post(
        "/api/v1/auth/login",
        data={
            "username": email,
            "password": "password123"
        }
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}, email

def test_generate_and_confirm_care_report(client: TestClient, db: Session, monkeypatch):
    normal_headers, _ = get_token_headers(client, "CUSTOMER")
    admin_headers, admin_email = get_token_headers(client, "ADMIN")
    
    # Give the admin user the ADMIN role
    admin_user = db.query(User).filter(User.email == admin_email).first()
    admin_role = db.query(Role).filter(Role.name == "ADMIN").first()
    if admin_role not in admin_user.roles:
        admin_user.roles.append(admin_role)
        db.commit()

    # Create an appointment directly in DB
    appt_id = uuid4()
    appt = Appointment(
        id=appt_id,
        customer_id=uuid4(),
        pet_id=uuid4(),
        scheduled_time=datetime.now(timezone.utc),
        total_price=50.0,
        status=AppointmentStatus.CHECKED_IN
    )
    db.add(appt)
    db.commit()

    # Admin starts care session
    response = client.post(
        f"/api/v1/care-sessions/{appt_id}/start",
        headers=admin_headers
    )
    assert response.status_code == 200
    session_id = response.json()["id"]

    # Mock AI Service
    def mock_analyze(self, data):
        return {
            "summary": "Rex was a good boy.",
            "recommendations": "Give him treats.",
            "metrics": {"mood": data.get("mood")}
        }
    monkeypatch.setattr(AIService, "analyze_care_session", mock_analyze)
    
    # Generate Draft
    draft_data = {
        "mood": "Happy",
        "appetite": "Good",
        "weight": 25.5,
        "skin_condition": "Normal",
        "behavior": "Calm",
        "service_result": "Grooming completed",
        "caregiver_notes": "No issues"
    }
    
    response = client.post(
        f"/api/v1/care-sessions/{session_id}/report/generate",
        json=draft_data,
        headers=admin_headers
    )
    assert response.status_code == 200
    draft_resp = response.json()
    assert draft_resp["summary"] == "Rex was a good boy."
    assert draft_resp["recommendations"] == "Give him treats."
    assert draft_resp["metrics"]["mood"] == "Happy"
    
    # Confirm Report
    confirm_data = {
        "summary": "Rex was a great boy. Edited summary.",
        "recommendations": "Give him lots of treats.",
        "health_metrics_json": draft_resp["metrics"]
    }
    
    response = client.post(
        f"/api/v1/care-sessions/{session_id}/report/confirm",
        json=confirm_data,
        headers=admin_headers
    )
    assert response.status_code == 200
    confirm_resp = response.json()
    
    assert confirm_resp["summary"] == "Rex was a great boy. Edited summary."
    assert confirm_resp["health_metrics_json"]["mood"] == "Happy"
    
    # Check session status is COMPLETED
    response = client.get(
        f"/api/v1/care-sessions/appointment/{appt_id}",
        headers=admin_headers
    )
    assert response.status_code == 200
    assert response.json()["status"] == "COMPLETED"
    assert response.json()["report"] is not None
    assert response.json()["report"]["summary"] == "Rex was a great boy. Edited summary."
