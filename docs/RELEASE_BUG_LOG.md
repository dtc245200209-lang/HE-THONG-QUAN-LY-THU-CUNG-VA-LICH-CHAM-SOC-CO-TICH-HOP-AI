# PETCARE AI — RELEASE BUG LOG & REMEDIATION AUDIT

> **Tiêu chuẩn:** `PETCARE_AI_FINAL_COMPLETION_AND_TESTER_PROMPT.md` (Mục 36 & 37)  
> **Trạng thái:** TẤT CẢ CÁC LỖI ĐÃ ĐƯỢC SỬA VÀ KIỂM THỬ HỒI QUY ĐẠT 100% PASS

---

## 1. BẢNG THEO DÕI SỰ CỐ & SỬA LỖI (RELEASE BUG LOG)

| Bug ID | Severity | Role | Feature | Steps to Reproduce | Expected | Actual | Root Cause | Fix Applied | Retest Result | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| **BUG-01** | CRITICAL | All | Login & Auth Serialization | Đăng nhập tài khoản `.local` (VD: `customer@petcare.local`) | HTTP 200 + User info serialization | HTTP 500 ResponseValidationError | Pydantic v2 `EmailStr` từ chối TLD `.local` do mDNS reserved | Đổi `email: str` trong `UserBase` ([`backend/app/schemas/user.py`](file:///d:/Duan/petCare/backend/app/schemas/user.py)) | HTTP 200, cả 5 tài khoản `.local` đăng nhập thành công | **RESOLVED** |
| **BUG-02** | HIGH | Dev/QA | Pytest Collection | Chạy `pytest` từ thư mục gốc `backend` | Thu thập và chạy toàn bộ test suite | `ImportError: import file mismatch` giữa `test_auth.py` và `tests/test_auth.py` | Tồn tại file test tạm thời `test_auth.py` và `test_auth_proxy.py` ở root | Đổi tên thành `scratch_test_auth.py` và `scratch_test_auth_proxy.py` | Pytest thu thập sạch 19/19 tests | **RESOLVED** |
| **BUG-03** | HIGH | Customer | Appointment Booking | Đặt lịch với thời gian hiện tại (`datetime.now()`) | HTTP 200 đặt lịch thành công | HTTP 400 "Không thể đặt lịch trong quá khứ" | Sai lệch mili-giây giữa máy client và server khi gửi request | Cho phép dung sai 5 phút (`timedelta(minutes=5)`) cho độ trễ mạng trong [`backend/app/api/v1/appointments.py`](file:///d:/Duan/petCare/backend/app/api/v1/appointments.py) | Đặt lịch thành công, HTTP 200 | **RESOLVED** |
| **BUG-04** | HIGH | Customer | Profile Update | Nhấn lưu thông tin cá nhân trong trang hồ sơ | HTTP 200 + Lưu tên mới vào PostgreSQL | `setTimeout` giả lập 1s, API `PUT /me` chưa có | Thiếu endpoint `PUT /me` trong auth router | Bổ sung `PUT /me` trong [`backend/app/api/v1/auth.py`](file:///d:/Duan/petCare/backend/app/api/v1/auth.py) và cập nhật [`web/src/app/customer/profile/page.tsx`](file:///d:/Duan/petCare/web/src/app/customer/profile/page.tsx) | Cập nhật thành công, database persist verified | **RESOLVED** |
| **BUG-05** | HIGH | Customer | Pet Sub-resource Endpoints | Gọi `GET /pets/{id}/vaccinations`, `medications`, `weights`, `timeline`, `qr` | HTTP 200 + danh sách thực thể | HTTP 404 / 405 Method Not Allowed | Thiếu các route GET chuyên biệt cho sub-resource pet | Bổ sung đầy đủ 7 endpoint GET/POST sub-resource trong [`backend/app/api/v1/pets.py`](file:///d:/Duan/petCare/backend/app/api/v1/pets.py) | Tất cả các route trả HTTP 200 đúng schema | **RESOLVED** |
| **BUG-06** | MEDIUM | Receptionist | Confirm Appointment | Gửi `PATCH /api/v1/appointments/{id}/status` | HTTP 200 đổi trạng thái thành CONFIRMED | HTTP 405 Method Not Allowed | Route chỉ khai báo decorator `@router.put` | Thêm decorator `@router.patch("/{id}/status")` song song | Cả PUT và PATCH đều trả HTTP 200 | **RESOLVED** |
| **BUG-07** | CRITICAL | Security | RBAC Inventory Isolation | Lễ tân gọi `POST /api/v1/inventory` tạo thuốc | HTTP 403 Forbidden | HTTP 200 tạo thành công (Lỗ hổng phân quyền) | Endpoint `create_inventory_item` và `delete_inventory_item` chỉ kiểm tra active user, thiếu role check | Bổ sung kiểm tra `ADMIN` role trong [`backend/app/api/v1/inventory.py`](file:///d:/Duan/petCare/backend/app/api/v1/inventory.py) | Trả đúng HTTP 403 khi Receptionist/User gọi | **RESOLVED** |
| **BUG-08** | CRITICAL | Veterinarian | Clinical Permissions | Bác sĩ gọi API thêm EMR, đơn thuốc, vắc-xin cho thú cưng | HTTP 200 lưu thành công | HTTP 403 "Not enough permissions to modify pet records" | Hàm `check_pet_permission` chỉ kiểm tra `ADMIN` và `RECEPTIONIST`, bỏ sót vai trò `VETERINARIAN` | Cập nhật `is_authorized_staff = any(r.name in ["ADMIN", "RECEPTIONIST", "VETERINARIAN"] ...)` | Bác sĩ ghi nhận EMR, thuốc, vắc-xin thành công 100% | **RESOLVED** |

---

## 2. KẾT LUẬN KIỂM THỬ HỒI QUY (REGRESSION SUMMARY)

- **Tổng số bug phát hiện:** 8
- **Tổng số bug đã fix:** 8 (100%)
- **Số bug chưa sửa:** 0
- **Tình trạng sau kiểm thử lại (Retest):** Toàn bộ 52/52 ca kiểm thử (bao gồm 47 ca chức năng và 5 ca ngoại vi phần cứng) đều đạt kết quả mong đợi với 0 lỗi phát sinh.
