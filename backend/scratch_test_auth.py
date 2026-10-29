import urllib.request
import urllib.error
import json

BASE = "http://localhost:8000/api/v1"

# Test register
print("=== TEST REGISTER ===")
data = json.dumps({"email": "test_debug99@example.com", "password": "Test123!", "full_name": "Test User"}).encode()
req = urllib.request.Request(f"{BASE}/auth/register", data=data, headers={"Content-Type": "application/json"}, method="POST")
try:
    with urllib.request.urlopen(req) as resp:
        result = json.loads(resp.read())
        print("REGISTER SUCCESS:", result)
except urllib.error.HTTPError as e:
    body = json.loads(e.read())
    print(f"REGISTER ERROR {e.code}:", json.dumps(body, indent=2))

# Test login
print("\n=== TEST LOGIN ===")
form_data = "username=test_debug99%40example.com&password=Test123!".encode()
req2 = urllib.request.Request(f"{BASE}/auth/login", data=form_data, headers={"Content-Type": "application/x-www-form-urlencoded"}, method="POST")
try:
    with urllib.request.urlopen(req2) as resp:
        result = json.loads(resp.read())
        print("LOGIN SUCCESS:", result)
except urllib.error.HTTPError as e:
    body = json.loads(e.read())
    print(f"LOGIN ERROR {e.code}:", json.dumps(body, indent=2))
