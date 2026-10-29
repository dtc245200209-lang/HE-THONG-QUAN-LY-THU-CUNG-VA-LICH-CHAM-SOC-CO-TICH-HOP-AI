# FEATURE MATRIX — PETCARE AI FULL-STACK

Bảng ma trận tính năng toàn diện của hệ thống PetCare AI.
Tiêu chuẩn bằng chứng (Evidence): Chỉ đánh dấu `COMPLETE` khi tính năng có API Backend thật, bảng cơ sở dữ liệu PostgreSQL thật và kiểm thử tương tác thành công.

---

| Feature | Role | Route | API Endpoint | DB Table | Realtime | Test | Status | Evidence |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| **User Authentication** | All | `/login`, `/register` | `POST /auth/access-token`, `POST /auth/register` | `users`, `roles` | None | E2E Login | **COMPLETE** | Token trả về, giải mã JWT hợp lệ, điều hướng đúng role |
| **Pet CRUD & Details** | Customer, Staff | `/customer/pets`, `/customer/pets/new` | `CRUD /pets` | `pets`, `memberships` | None | API & UI | **COMPLETE** | Thú cưng được lưu vào PostgreSQL, reload trang vẫn giữ nguyên |
| **Digital Pet Passport** | Customer, Staff | `/customer/pets/[id]/passport` | `GET /pets/{id}/passport` | Aggregate 8 bảng | `pet.updated` | UI Test | **COMPLETE** | Hiển thị thông tin tổng hợp lịch sử tiêm, sổ khám, cân nặng |
| **Emergency QR & Lost Mode** | Customer, Public | `/customer/pets/[id]/emergency`, `/pet/emergency/[token]` | `GET/POST /pets/{id}/lost_reports` | `lost_pet_reports`, `pets` | `pet.lost_mode_enabled` | E2E QR | **COMPLETE** | Quét mã QR ra trang cấp cứu, form gửi tin kèm tọa độ GPS |
| **Family Pet Sharing** | Customer | `/customer/pets/[id]/members` | `CRUD /pets/{id}/members`, `POST /pets/{id}/transfer-ownership` | `memberships`, `audit_logs` | None | API & UI | **COMPLETE** | Phân quyền 4 cấp, chuyển chủ sở hữu ghi nhận vào AuditLog |
| **AI Document Scanner** | Customer, Staff | `/customer/pets/[id]/documents` | `GET /pets/{id}/documents`, OCR Pipeline | `pet_documents` | None | OCR Test | **COMPLETE** | OCR đọc sổ tiêm, hiển thị bảng đối soát trước khi ghi vào DB |
| **Appointment Booking** | Customer | `/customer/appointments` | `POST /appointments` | `appointments`, `services` | `appointment.created` | E2E Booking | **COMPLETE** | Lịch hẹn lưu vào DB, giá lấy từ DB dịch vụ, xuất hiện ở Lễ tân |
| **Appointment State Machine**| Customer, Staff | `/customer/appointments/[id]` | `PUT /appointments/{id}/status` | `appointments` | `appointment.confirmed` | Status Test | **COMPLETE** | Chuyển trạng thái đúng quy trình: PENDING -> CONFIRMED -> CHECKED_IN -> COMPLETED |
| **VietQR Napas247 Payment** | Customer, Cashier | Chi tiết lịch hẹn, Thu ngân | `POST /payments/checkout-session`, `POST /payments/generate-qr`, `POST /payments/{id}/confirm-online` | `payments`, `appointments` | `payment.confirmed` | QR Test | **COMPLETE** | Sinh URL ảnh QR Napas247 chuẩn MBBank, xác nhận online đổi trạng thái COMPLETED |
| **Live Care Updates** | Caregiver, Customer | `/caregiver/sessions/[id]`, Chi tiết lịch hẹn | `/ws/care-sessions/{id}`, `POST /care-sessions/{id}/events` | `care_sessions`, `care_events` | `care_session.event_added` | WS Test | **COMPLETE** | Caregiver gửi ảnh & sinh hiệu, Customer nhận tức thì không cần F5 |
| **AI Care Report** | Caregiver, Customer | `/caregiver/sessions/[id]` | `POST /care-sessions/{id}/report`, `POST /ai/care-report` | `care_reports` | `care_report.published` | AI Test | **COMPLETE** | AI Orchestrator tổng hợp báo cáo chuyên nghiệp theo JSON schema |
| **Tele-Health Video Call** | Customer, Vet | `/customer/telehealth/[id]`, `/veterinarian/telehealth/[id]` | `/ws/telehealth/{room_id}` | `medical_records` | Signaling WebRTC | P2P Test | **COMPLETE** | Video HD 2 chiều, mic/cam control, chat realtime, bác sĩ lưu bệnh án song song |
| **Walk-in Customer Reg** | Receptionist | `/receptionist/customers` | `POST /users` | `users`, `roles` | None | Form Test | **COMPLETE** | Lễ tân tạo tài khoản tại quầy, user mới có thể đăng nhập ngay |
| **Staff Assignment** | Receptionist, Admin | `/receptionist/appointments` | `PATCH /appointments/{id}/assign` | `appointments`, `users` | `staff.assigned` | Assign Test | **COMPLETE** | Gán Bác sĩ/Caregiver vào ca hẹn, hiển thị trên giao diện nhân viên |
| **Caregiver Matching** | Receptionist, Admin | `/receptionist/appointments` | `GET /appointments/matching/suggestions` | `caregiver_profiles` | None | Match Test | **COMPLETE** | Thuật toán tính Match Score (0-100) theo kỹ năng và rating |
| **Electronic Medical Record** | Veterinarian | `/veterinarian/medical-records` | `POST /pets/{id}/medical-records` | `medical_records` | `medical_record.created` | EMR Test | **COMPLETE** | Ghi nhận chẩn đoán, phác đồ, triệu chứng, tự động gắn vào Timeline |
| **Prescription & Stock Out** | Veterinarian | `/veterinarian/prescriptions` | `POST /prescriptions`, `POST /pets/{id}/medications` | `prescriptions`, `inventory_items`, `inventory_transactions` | `inventory.updated` | Idempotent Test | **COMPLETE** | Kê đơn thuốc điện tử, tự động trừ số lượng tồn kho tương ứng |
| **Vaccination & Stock Out** | Veterinarian | `/veterinarian/vaccinations` | `POST /pets/{id}/vaccinations` | `vaccinations`, `inventory_items`, `inventory_transactions` | `inventory.updated` | Idempotent Test | **COMPLETE** | Ghi nhận mũi tiêm vắc-xin, tự động trừ 1 liều trong kho dược |
| **Clinical Pharmacy Lookup** | Veterinarian | `/veterinarian/inventory` | `GET /inventory` | `inventory_items` | None | Search Test | **COMPLETE** | Bác sĩ tra cứu tồn kho khả dụng, vị trí tủ thuốc, số lô và hạn dùng |
| **Admin Inventory Control** | Admin | `/admin/inventory` | `CRUD /inventory`, `POST /inventory/{id}/adjust`, `GET /inventory/stats` | `inventory_items`, `inventory_transactions` | `inventory.updated` | CRUD & Adjust | **COMPLETE** | 4 thẻ KPI, bộ lọc, Modal nhập/xuất kho, nhật ký biến động kho |
| **Admin Services CRUD** | Admin | `/admin/services` | `CRUD /services` | `services` | None | CRUD Test | **COMPLETE** | Thêm, sửa giá, sửa thời lượng dịch vụ, cập nhật bảng giá toàn hệ thống |
| **Admin System Audit Log** | Admin | `/admin/audit` | `GET /audit-logs` | `audit_logs` | None | Audit Test | **COMPLETE** | Nhật ký kiểm toán bảo mật chi tiết, xem JSON payload từng thao tác |
| **Admin AI Orchestrator** | Admin | `/admin/ai` | `GET /ai/health`, `GET /ai/models`, `POST /ai/chat` | None | None | Health Test | **COMPLETE** | Giám sát provider, latency, console kiểm thử prompt trực tiếp |
| **Smart Reminders Engine** | System | Chạy ngầm Celery | `POST /notifications/trigger-reminders` | `notifications` | `notification.created` | Celery Test | **COMPLETE** | Quét vắc-xin đến hạn (7 ngày) & lịch hẹn (24h) sinh notification tự động |
| **POS Thermal Printer** | Receptionist | Quầy thu ngân | N/A | N/A | None | Driver Test | **BLOCKED_EXT** | Chưa có máy in nhiệt mini 80mm phần cứng để kết nối WebUSB |
| **Mobile App Production** | All | Thư mục `/mobile` | RESTful API | N/A | None | Mobile Build | **PARTIAL** | Bộ khung React Native đã sẵn sàng, chưa đóng gói build IPA/APK store |
