import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from uuid import uuid4

from app.models.pet import Pet, PetSpecies, QRCode

def test_get_public_pet_success(db: Session, client: TestClient):
    # Setup: Create a pet and a QR code
    pet = Pet(name="PublicDog", species=PetSpecies.DOG)
    db.add(pet)
    db.flush()

    qr_token = str(uuid4())
    qr = QRCode(pet_id=pet.id, token=qr_token, is_active=True)
    db.add(qr)
    db.commit()

    # Act
    response = client.get(f"/api/v1/public/pets/emergency/{qr_token}")

    # Assert
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "PublicDog"
    assert data["species"] == "DOG"
    assert data["lost_mode"] == False
    assert "id" not in data # Ensure sensitive/internal ID is not exposed

def test_get_public_pet_invalid_token(client: TestClient):
    response = client.get(f"/api/v1/public/pets/emergency/invalid-token-123")
    assert response.status_code == 404

def test_report_lost_pet(db: Session, client: TestClient):
    # Setup
    pet = Pet(name="LostDog", species=PetSpecies.DOG)
    db.add(pet)
    db.flush()

    qr_token = str(uuid4())
    qr = QRCode(pet_id=pet.id, token=qr_token, is_active=True)
    db.add(qr)
    db.commit()

    # Act
    report_data = {
        "contact_phone": "123-456-7890",
        "message": "Found your dog near the park."
    }
    response = client.post(f"/api/v1/public/pets/emergency/{qr_token}/report", json=report_data)

    # Assert
    assert response.status_code == 200
    data = response.json()
    assert data["contact_phone"] == "123-456-7890"
    assert data["message"] == "Found your dog near the park."
    assert "id" in data
