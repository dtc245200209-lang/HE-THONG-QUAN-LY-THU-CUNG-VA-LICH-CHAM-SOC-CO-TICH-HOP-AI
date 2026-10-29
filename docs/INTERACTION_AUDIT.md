# INTERACTION AUDIT — PETCARE AI UI INTERACTION INTEGRITY

Kiểm định toàn bộ các nút bấm (Buttons), Biểu mẫu (Forms), Hộp thoại (Modals), Bảng dữ liệu (Tables) và Thao tác hàng (Row Actions) trên toàn bộ các phân hệ của PetCare AI.
Tiêu chuẩn bắt buộc: 100% tương tác người dùng phải kích hoạt logic nghiệp vụ thật, gọi Backend API hoặc chuyển hướng hợp lệ — cấm hoàn toàn fake `console.log`, `setTimeout` giả vờ, fake toast hoặc dữ liệu hardcode.

---

## 1. Phân hệ Khách hàng (Customer)

| Tuyến trang | Thành phần tương tác | Loại hành động | Hành vi thực tế | Kiểm tra kết nối Backend | Trạng thái |
| :--- | :--- | :--- | :--- | :--- | :---: |
| `/customer/pets/new` | Form "Thêm thú cưng" | Submit Form | Gửi dữ liệu về API | `POST /api/v1/pets` -> lưu PostgreSQL -> chuyển về `/customer/pets` | **VERIFIED** |
| `/customer/pets/[id]` | Nút "Chỉnh sửa hồ sơ" | Modal Submit | Gửi dữ liệu cập nhật | `PATCH /api/v1/pets/{id}` -> cập nhật DB | **VERIFIED** |
| `/customer/pets/[id]/emergency` | Toggle "Bật chế độ tìm kiếm" | Toggle Switch | Lưu trạng thái thất lạc | `POST /api/v1/pets/{id}/lost_reports` | **VERIFIED** |
| `/customer/pets/[id]/members` | Form "Mời người chăm sóc" | Submit Form | Thêm quyền thành viên | `POST /api/v1/pets/{id}/members` | **VERIFIED** |
| `/customer/pets/[id]/members` | Nút "Xóa thành viên" | Button Click | Xóa quyền thành viên | `DELETE /api/v1/pets/{id}/members/{id}` | **VERIFIED** |
| `/customer/pets/[id]/members` | Nút "Chuyển quyền chủ chính" | Dialog Confirm | Chuyển quyền sở hữu | `POST /api/v1/pets/{id}/transfer-ownership` | **VERIFIED** |
| `/customer/appointments/[id]` | Nút "Hủy lịch hẹn" | Dialog Confirm | Chuyển trạng thái CANCELLED | `PUT /api/v1/appointments/{id}/status` | **VERIFIED** |
| `/customer/appointments/[id]` | Nút "Thanh toán VietQR / MoMo"| Modal Open | Mở phiên thanh toán online | `POST /api/v1/payments/checkout-session` | **VERIFIED** |
| `/customer/appointments/[id]` | Nút "Xác nhận đã chuyển khoản"| Modal Action | Hoàn tất thanh toán | `POST /api/v1/payments/{id}/confirm-online` -> Lịch hẹn CONFIRMED | **VERIFIED** |
| `/customer/appointments/[id]` | Nút "Khám từ xa (Video Call)" | Link Click | Chuyển vào phòng WebRTC | Điều hướng `/customer/telehealth/{id}` | **VERIFIED** |
| `/customer/telehealth/[id]` | Nút Bật/Tắt Mic, Camera | Media Control | Bật/tắt track audio/video | Điều khiển stream thật trên PeerConnection | **VERIFIED** |
| `/customer/telehealth/[id]` | Form gửi tin nhắn trong phòng | Submit Form | Gửi tin nhắn tức thì | WebSocket `/api/v1/ws/telehealth/{room_id}` | **VERIFIED** |
| `/customer/ai-chat` | Form hỏi đáp trợ lý AI | Submit Form | Gửi câu hỏi về Orchestrator | `POST /api/v1/ai/chat` -> nhận câu trả lời AI | **VERIFIED** |

---

## 2. Phân hệ Lễ tân (Receptionist)

| Tuyến trang | Thành phần tương tác | Loại hành động | Hành vi thực tế | Kiểm tra kết nối Backend | Trạng thái |
| :--- | :--- | :--- | :--- | :--- | :---: |
| `/receptionist/customers` | Nút "Thêm khách hàng" | Modal Open | Mở form đăng ký tại quầy | Modal đăng ký khách hàng | **VERIFIED** |
| `/receptionist/customers` | Form tạo khách hàng mới | Submit Form | Lưu khách hàng vào DB | `POST /api/v1/users` -> trả về user thật | **VERIFIED** |
| `/receptionist/appointments` | Nút "Xác nhận lịch hẹn" | Row Action | Đổi status CONFIRMED | `PUT /api/v1/appointments/{id}/status` | **VERIFIED** |
| `/receptionist/appointments` | Nút "Check-in khách đến" | Row Action | Đổi status CHECKED_IN | `PUT /api/v1/appointments/{id}/status` | **VERIFIED** |
| `/receptionist/appointments` | Dropdown "Phân công chuyên viên"| Change Selection | Lưu caregiver/bác sĩ phụ trách | `PATCH /api/v1/appointments/{id}/assign` | **VERIFIED** |
| `/receptionist/payments` | Nút "Thanh toán hóa đơn" | Modal Open | Mở modal thu ngân | Modal thu ngân sảnh | **VERIFIED** |
| `/receptionist/payments` | Chọn "Chuyển khoản" | Tab Switch | Sinh mã VietQR động | `POST /api/v1/payments/generate-qr` -> render ảnh QR Napas247 | **VERIFIED** |
| `/receptionist/payments` | Nút "Xác nhận đã thu tiền" | Submit Action | Đổi status COMPLETED | `POST /api/v1/payments` -> lưu DB | **VERIFIED** |

---

## 3. Phân hệ Bác sĩ Thú y (Veterinarian)

| Tuyến trang | Thành phần tương tác | Loại hành động | Hành vi thực tế | Kiểm tra kết nối Backend | Trạng thái |
| :--- | :--- | :--- | :--- | :--- | :---: |
| `/veterinarian` | Nút "Khám Video" trên lịch hẹn | Link Click | Vào phòng Tele-Health Bác sĩ | Điều hướng `/veterinarian/telehealth/{id}` | **VERIFIED** |
| `/veterinarian` | Nút "Mở bệnh án lâm sàng" | Link Click | Vào chi tiết hồ sơ bệnh nhân | Điều hướng `/veterinarian/patients/{pet_id}` | **VERIFIED** |
| `/veterinarian/telehealth/[id]` | Nút "Lưu Vào Hồ Sơ Bệnh Án" | Button Action | Lưu chẩn đoán & phác đồ | `POST /api/v1/pets/{id}/medical-records` | **VERIFIED** |
| `/veterinarian/prescriptions/new` | Form kê đơn thuốc | Submit Form | Lưu đơn thuốc & trừ kho dược | `POST /api/v1/prescriptions`, `POST /pets/{id}/medications` | **VERIFIED** |
| `/veterinarian/vaccinations` | Form ghi nhận mũi tiêm vắc-xin | Submit Form | Lưu mũi tiêm & trừ vắc-xin kho | `POST /api/v1/pets/{id}/vaccinations` (trừ kho tự động) | **VERIFIED** |
| `/veterinarian/inventory` | Thanh tìm kiếm & bộ lọc thuốc | Filter / Search | Tra cứu kho dược lâm sàng | `GET /api/v1/inventory?category=...&search=...` | **VERIFIED** |

---

## 4. Phân hệ Người chăm sóc (Caregiver)

| Tuyến trang | Thành phần tương tác | Loại hành động | Hành vi thực tế | Kiểm tra kết nối Backend | Trạng thái |
| :--- | :--- | :--- | :--- | :--- | :---: |
| `/caregiver/sessions/[id]` | Nút "Bắt đầu ca chăm sóc" | Button Action | Đổi trạng thái IN_PROGRESS | `POST /api/v1/care-sessions/{id}/start` | **VERIFIED** |
| `/caregiver/sessions/[id]` | Form đăng ảnh & khoảnh khắc | Submit Action | Đăng ảnh & phát sóng realtime | `POST /api/v1/care-sessions/{id}/events` -> WebSocket broadcast | **VERIFIED** |
| `/caregiver/sessions/[id]` | Form cập nhật sinh hiệu | Submit Action | Lưu sinh hiệu vào DB | `POST /api/v1/care-sessions/{id}/events` | **VERIFIED** |
| `/caregiver/sessions/[id]` | Nút "Hoàn tất ca chăm sóc" | Button Action | Đổi trạng thái COMPLETED | `POST /api/v1/care-sessions/{id}/complete` | **VERIFIED** |
| `/caregiver/sessions/[id]` | Nút "Tạo báo cáo AI Care Report" | Button Action | AI Orchestrator tổng hợp báo cáo | `POST /api/v1/care-sessions/{id}/report` | **VERIFIED** |

---

## 5. Phân hệ Quản trị viên (Admin)

| Tuyến trang | Thành phần tương tác | Loại hành động | Hành vi thực tế | Kiểm tra kết nối Backend | Trạng thái |
| :--- | :--- | :--- | :--- | :--- | :---: |
| `/admin/users` | Nút "Thêm người dùng" | Modal Submit | Tạo user mới kèm phân quyền role | `POST /api/v1/users` | **VERIFIED** |
| `/admin/users` | Nút "Khóa / Mở tài khoản" | Button Click | Đổi trạng thái is_active | `PATCH /api/v1/users/{id}/toggle-status` | **VERIFIED** |
| `/admin/services` | Form thêm/sửa dịch vụ | Modal Submit | CRUD gói dịch vụ & giá niêm yết | `POST/PUT /api/v1/services` | **VERIFIED** |
| `/admin/inventory` | Nút "Thêm mặt hàng mới" | Modal Submit | Tạo SKU & mặt hàng dược phẩm mới | `POST /api/v1/inventory` | **VERIFIED** |
| `/admin/inventory` | Nút "Nhập/Xuất kho" | Modal Submit | Tăng/giảm tồn kho & lưu audit log | `POST /api/v1/inventory/{id}/adjust` | **VERIFIED** |
| `/admin/inventory` | Nút "Xóa mặt hàng" | Dialog Confirm | Xóa mặt hàng khỏi kho | `DELETE /api/v1/inventory/{id}` | **VERIFIED** |
| `/admin/audit` | Nút "Xem chi tiết JSON" | Modal Open | Xem payload bảo mật kiểm toán | Đọc trực tiếp payload từ `audit_logs` DB | **VERIFIED** |
| `/admin/ai` | Console test prompt AI | Submit Form | Gửi test prompt kiểm tra LLM | `POST /api/v1/ai/chat` | **VERIFIED** |
