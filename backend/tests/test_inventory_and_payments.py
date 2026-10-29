import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from uuid import uuid4

from app.models.user import User, Role
from app.models.inventory import InventoryItem, InventoryTransaction

def get_admin_headers(client: TestClient, db: Session):
    admin_email = "admin_test_suite@example.com"
    client.post(
        "/api/v1/auth/register",
        json={"email": admin_email, "password": "password123", "full_name": "Admin Tester"}
    )
    # Ensure role is ADMIN
    user = db.query(User).filter(User.email == admin_email).first()
    admin_role = db.query(Role).filter(Role.name == "ADMIN").first()
    if not admin_role:
        admin_role = Role(id=uuid4(), name="ADMIN", description="Administrator")
        db.add(admin_role)
        db.commit()
    if admin_role not in user.roles:
        user.roles.append(admin_role)
        db.commit()

    resp = client.post(
        "/api/v1/auth/login",
        data={"username": admin_email, "password": "password123"}
    )
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}, user


def test_ai_health_check(client: TestClient):
    response = client.get("/api/v1/ai/health")
    assert response.status_code == 200
    data = response.json()
    assert "provider" in data
    assert "reachable" in data
    assert "latency_ms" in data


def test_update_user_profile(client: TestClient, db: Session):
    headers, user = get_admin_headers(client, db)
    response = client.put(
        "/api/v1/auth/me",
        headers=headers,
        json={"full_name": "Updated Admin Name"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["full_name"] == "Updated Admin Name"

    # Verify reload in DB
    db.refresh(user)
    assert user.full_name == "Updated Admin Name"


def test_inventory_crud_and_stock_adjustment(client: TestClient, db: Session):
    headers, _ = get_admin_headers(client, db)

    # 1. Create item
    create_payload = {
        "sku": f"TEST-MED-{uuid4().hex[:6].upper()}",
        "name": "Amoxicillin 250mg Test",
        "category": "MEDICINE",
        "unit": "Viên",
        "quantity": 100,
        "min_threshold": 20,
        "cost_price": 5000.0,
        "selling_price": 8000.0,
        "location": "Kệ A1",
        "batch_number": "BATCH-TEST-01"
    }
    res = client.post("/api/v1/inventory", headers=headers, json=create_payload)
    assert res.status_code == 200
    item_data = res.json()
    item_id = item_data["id"]
    assert item_data["quantity"] == 100

    # 2. Adjust stock (EXPORT / USE 10 items)
    adjust_payload = {
        "quantity_change": -10,
        "transaction_type": "EXPORT",
        "notes": "Sử dụng điều trị nội trú"
    }
    adj_res = client.post(f"/api/v1/inventory/{item_id}/adjust", headers=headers, json=adjust_payload)
    assert adj_res.status_code == 200
    updated_data = adj_res.json()
    assert updated_data["quantity"] == 90

    # 3. Check stats
    stats_res = client.get("/api/v1/inventory/stats", headers=headers)
    assert stats_res.status_code == 200
    stats = stats_res.json()
    assert stats["total_items"] >= 1
    assert stats["total_inventory_value"] >= 0

    # 4. Check item detail with transactions
    detail_res = client.get(f"/api/v1/inventory/{item_id}", headers=headers)
    assert detail_res.status_code == 200
    detail = detail_res.json()
    assert len(detail["transactions"]) >= 1
    assert detail["transactions"][0]["quantity_change"] == -10
