import urllib.request
import urllib.error
import json

BASE = "http://localhost:3000/api/v1"

# Test register through Next.js proxy
print("=== TEST REGISTER (qua Next.js proxy :3000) ===")
data = json.dumps({"email": "proxy_test@example.com", "password": "Test123!", "full_name": "Proxy Test"}).encode()
req = urllib.request.Request(f"{BASE}/auth/register", data=data, headers={"Content-Type": "application/json"}, method="POST")
try:
    with urllib.request.urlopen(req) as resp:
        result = json.loads(resp.read())
        print("REGISTER SUCCESS:", json.dumps(result, indent=2))
except urllib.error.HTTPError as e:
    body = e.read().decode()
    print(f"REGISTER ERROR {e.code}:", body)

# Test login through Next.js proxy
print("\n=== TEST LOGIN (qua Next.js proxy :3000) ===")
form_data = "username=proxy_test%40example.com&password=Test123!".encode()
req2 = urllib.request.Request(f"{BASE}/auth/login", data=form_data, headers={"Content-Type": "application/x-www-form-urlencoded"}, method="POST")
try:
    with urllib.request.urlopen(req2) as resp:
        result = json.loads(resp.read())
        print("LOGIN SUCCESS:", json.dumps(result, indent=2))
except urllib.error.HTTPError as e:
    body = e.read().decode()
    print(f"LOGIN ERROR {e.code}:", body)
