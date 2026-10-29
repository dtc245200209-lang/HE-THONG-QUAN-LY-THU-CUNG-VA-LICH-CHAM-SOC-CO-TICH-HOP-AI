import pytest
from fastapi.testclient import TestClient

def get_token_headers(client: TestClient):
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "petowner@example.com",
            "password": "password123",
            "full_name": "Pet Owner"
        }
    )
    response = client.post(
        "/api/v1/auth/login",
        data={
            "username": "petowner@example.com",
            "password": "password123"
        }
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_create_pet(client: TestClient):
    headers = get_token_headers(client)
    response = client.post(
        "/api/v1/pets/",
        headers=headers,
        json={
            "name": "Buddy",
            "species": "DOG",
            "breed": "Golden Retriever",
            "date_of_birth": "2020-01-01"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Buddy"
    assert data["species"] == "DOG"
    assert "id" in data

def test_get_pets(client: TestClient):
    headers = get_token_headers(client)
    client.post(
        "/api/v1/pets/",
        headers=headers,
        json={
            "name": "Buddy",
            "species": "DOG"
        }
    )
    
    response = client.get("/api/v1/pets/", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert data[0]["name"] == "Buddy"

def test_get_pet_passport(client: TestClient):
    headers = get_token_headers(client)
    create_response = client.post(
        "/api/v1/pets/",
        headers=headers,
        json={
            "name": "Max",
            "species": "CAT"
        }
    )
    pet_id = create_response.json()["id"]
    
    response = client.get(f"/api/v1/pets/{pet_id}/passport", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["pet"]["name"] == "Max"
    assert "allergies" in data
    assert "vaccinations" in data

def test_add_pet_allergy(client: TestClient):
    headers = get_token_headers(client)
    create_response = client.post(
        "/api/v1/pets/",
        headers=headers,
        json={
            "name": "Luna",
            "species": "CAT"
        }
    )
    pet_id = create_response.json()["id"]
    
    response = client.post(
        f"/api/v1/pets/{pet_id}/allergies",
        headers=headers,
        json={
            "name": "Peanuts",
            "severity": "SEVERE"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Peanuts"
    assert data["severity"] == "SEVERE"
    
    # Verify it appears in passport
    passport_response = client.get(f"/api/v1/pets/{pet_id}/passport", headers=headers)
    passport_data = passport_response.json()
    assert len(passport_data["allergies"]) == 1
    assert passport_data["allergies"][0]["name"] == "Peanuts"

from unittest.mock import patch
import io

def test_scan_document(client: TestClient):
    headers = get_token_headers(client)
    create_response = client.post(
        "/api/v1/pets/",
        headers=headers,
        json={"name": "Rex", "species": "DOG"}
    )
    pet_id = create_response.json()["id"]

    mock_result = {
        "document_type": "VACCINATION",
        "vaccine_name": "Rabies",
        "vaccination_date": "2023-10-15",
        "confidence": 0.95
    }

    with patch("app.core.ai_service.AIService.scan_document", return_value=mock_result):
        file_content = b"fake image data"
        response = client.post(
            f"/api/v1/pets/{pet_id}/documents/scan",
            headers=headers,
            files={"file": ("test.jpg", io.BytesIO(file_content), "image/jpeg")}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "test.jpg"
        assert data["status"] == "PENDING_REVIEW"
        assert data["extracted_data"]["document_type"] == "VACCINATION"
        assert data["extracted_data"]["vaccine_name"] == "Rabies"

def test_confirm_document(client: TestClient):
    headers = get_token_headers(client)
    create_response = client.post(
        "/api/v1/pets/",
        headers=headers,
        json={"name": "Rex", "species": "DOG"}
    )
    pet_id = create_response.json()["id"]

    mock_result = {
        "document_type": "VACCINATION",
        "vaccine_name": "Rabies",
        "vaccination_date": "2023-10-15",
        "confidence": 0.95
    }

    with patch("app.core.ai_service.AIService.scan_document", return_value=mock_result):
        file_content = b"fake image data"
        scan_response = client.post(
            f"/api/v1/pets/{pet_id}/documents/scan",
            headers=headers,
            files={"file": ("test.jpg", io.BytesIO(file_content), "image/jpeg")}
        )
        doc_id = scan_response.json()["id"]

    confirm_response = client.put(
        f"/api/v1/pets/{pet_id}/documents/{doc_id}/confirm",
        headers=headers,
        json={
            "title": "Rabies Certificate",
            "document_type": "VACCINATION",
            "vaccine_name": "Rabies",
            "vaccination_date": "2023-10-15"
        }
    )
    assert confirm_response.status_code == 200
    confirm_data = confirm_response.json()
    assert confirm_data["status"] == "CONFIRMED"
    assert confirm_data["title"] == "Rabies Certificate"
    
    passport_response = client.get(f"/api/v1/pets/{pet_id}/passport", headers=headers)
    passport_data = passport_response.json()
    assert len(passport_data["vaccinations"]) == 1
    assert passport_data["vaccinations"][0]["name"] == "Rabies"
