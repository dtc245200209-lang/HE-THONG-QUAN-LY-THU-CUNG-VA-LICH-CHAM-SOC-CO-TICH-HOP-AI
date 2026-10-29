from fastapi.testclient import TestClient

def test_rbac_admin_only_forbidden(client: TestClient):
    # Register a new customer
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "customer@example.com",
            "password": "password123",
            "full_name": "Customer User"
        }
    )
    # Login
    response = client.post(
        "/api/v1/auth/login",
        data={
            "username": "customer@example.com",
            "password": "password123"
        }
    )
    token = response.json()["access_token"]
    
    # Access admin endpoint
    response = client.get(
        "/api/v1/admin-only",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 403
    assert response.json()["detail"] == "Operation not permitted"
