import requests
import json

payload = {
    "name": "Đĩa Bay Silicon Thể Thao Huấn Luyện Cho Chó Ngoài Trời",
    "category": "TOY",
    "target_pet": "DOG",
    "brand": "PetCare Joy",
    "price": 85000,
    "original_price": 110000,
    "unit": "Cái (Đường kính 22cm)",
    "stock_quantity": 60,
    "image_url": "https://upload.wikimedia.org/wikipedia/commons/e/e7/Dog_with_red_kong.jpg",
    "badge": "HOT TREND",
    "description": "Đĩa bay dẻo mềm từ silicon tự nhiên đạt chuẩn, ném bay lượn êm ái giúp cún nhảy bắt an toàn không tổn thương răng miệng.",
    "ingredients": "100% Silicone dẻo dai thân thiện môi trường",
    "usage_instructions": "Dùng chơi ném bắt trên bãi cỏ hoặc bãi biển 20 phút mỗi ngày."
}

res = requests.post("http://localhost:8000/api/v1/products", json=payload)
print(f"Status: {res.status_code}")
created = res.json()
print("✅ Created new product directly in PostgreSQL:")
print(f"ID: {created.get('id')}")
print(f"SKU: {created.get('sku')}")
print(f"Name: {created.get('name')}")
print(f"Price: {created.get('price')}")
print(f"Discount: {created.get('discount_percent')}%")
print(f"Slug: {created.get('slug')}")

# Verify GET contains this new product
get_res = requests.get("http://localhost:8000/api/v1/products?search=Đĩa Bay")
items = get_res.json().get("items", [])
print(f"Found {len(items)} items matching 'Đĩa Bay': {[i['name'] for i in items]}")
