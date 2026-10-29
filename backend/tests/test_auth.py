from fastapi.testclient import TestClient

def test_register_user(client: TestClient):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "test@example.com",
            "password": "password123",
            "full_name": "Test User"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@example.com"
    assert "id" in data
    # Check if CUSTOMER role was assigned
    roles = data.get("roles", [])
    assert any(role["name"] == "CUSTOMER" for role in roles)

def test_register_duplicate_user(client: TestClient):
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "test@example.com",
            "password": "password123",
            "full_name": "Test User"
        }
    )
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "test@example.com",
            "password": "password123",
            "full_name": "Test User"
        }
    )
    assert response.status_code == 400

def test_login_user(client: TestClient):
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "test2@example.com",
            "password": "password123",
            "full_name": "Test User 2"
        }
    )
    response = client.post(
        "/api/v1/auth/login",
        data={
            "username": "test2@example.com",
            "password": "password123"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
