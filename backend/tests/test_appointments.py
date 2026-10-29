import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from uuid import uuid4
from datetime import datetime, timezone, timedelta

from app.models.appointment import Appointment, Service, AppointmentStatus, ServiceCategory
from app.models.care_session import CareSession, CareSessionStatus
from app.models.user import User, Role
from app.models.pet import Pet, PetSpecies

def get_token_headers(client: TestClient, role_name: str = "CUSTOMER"):
    email = f"{role_name.lower()}@example.com"
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

def test_create_appointment(client: TestClient, db: Session):
    headers, _ = get_token_headers(client)
    
    # First create a service
    service = Service(
        id=uuid4(),
        name="Basic Bath",
        category=ServiceCategory.GROOMING,
        base_price=50.0,
        estimated_duration_minutes=30
    )
    db.add(service)
    db.commit()

    pet_res = client.post(
        "/api/v1/pets/",
        headers=headers,
        json={"name": "Test Doggy", "species": "DOG"}
    )
    pet_id = pet_res.json()["id"]
    
    response = client.post(
        "/api/v1/appointments/",
        headers=headers,
        json={
            "pet_id": str(pet_id),
            "service_ids": [str(service.id)],
            "scheduled_time": (datetime.now(timezone.utc) + timedelta(days=1)).isoformat(),
            "notes": "Please be gentle"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["pet_id"] == str(pet_id)
    assert data["notes"] == "Please be gentle"
    assert data["status"] == "PENDING"
    assert data["total_price"] == 50.0

def test_update_appointment_status_and_care_session(client: TestClient, db: Session):
    normal_headers, _ = get_token_headers(client, "CUSTOMER")
    admin_headers, admin_email = get_token_headers(client, "ADMIN")
    
    # Give the admin user the ADMIN role
    admin_user = db.query(User).filter(User.email == admin_email).first()
    admin_role = db.query(Role).filter(Role.name == "ADMIN").first()
    if admin_role not in admin_user.roles:
        admin_user.roles.append(admin_role)
        db.commit()
    # Create appointment
    appt_id = uuid4()
    appt = Appointment(
        id=appt_id,
        customer_id=uuid4(),
        pet_id=uuid4(),
        scheduled_time=datetime.now(timezone.utc),
        total_price=50.0,
        status=AppointmentStatus.PENDING
    )
    db.add(appt)
    db.commit()
    
    # Superuser (Admin) updates status to CHECKED_IN
    response = client.put(
        f"/api/v1/appointments/{appt_id}/status",
        headers=admin_headers,
        json={"status": "CHECKED_IN"}
    )
    assert response.status_code == 200
    assert response.json()["status"] == "CHECKED_IN"
    
    # Superuser starts CareSession
    response = client.post(
        f"/api/v1/care-sessions/{appt_id}/start",
        headers=admin_headers
    )
    assert response.status_code == 200
    session_data = response.json()
    assert session_data["appointment_id"] == str(appt_id)
    assert session_data["status"] == "ACTIVE"
    session_id = session_data["id"]
    
    # Add an event
    response = client.post(
        f"/api/v1/care-sessions/{session_id}/events",
        headers=admin_headers,
        json={
            "session_id": session_id,
            "event_type": "TEXT",
            "content": "Pet is relaxing in the bath"
        }
    )
    assert response.status_code == 200
    assert response.json()["content"] == "Pet is relaxing in the bath"
    
    # Get the care session via appointment endpoint
    response = client.get(
        f"/api/v1/care-sessions/appointment/{appt_id}",
        headers=normal_headers
    )
    assert response.status_code == 200
    assert response.json()["id"] == session_id
    assert len(response.json()["events"]) == 1
