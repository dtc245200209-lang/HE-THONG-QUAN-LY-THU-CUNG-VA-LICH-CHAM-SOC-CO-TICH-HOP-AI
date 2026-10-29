# ROUTE ACTION MATRIX — PETCARE AI

Bản đồ liên kết hành động người dùng (Action Mapping) của từng trang giao diện tới Backend API và luồng điều hướng tương ứng.

---

## 1. Customer Pages

### `/customer` (Dashboard)
- **Xem tổng quan**: `GET /api/v1/appointments`, `GET /api/v1/pets`, `GET /api/v1/notifications`
- **Click "Đặt lịch mới"**: Điều hướng `/customer/appointments`
- **Click "Xem thú cưng"**: Điều hướng `/customer/pets`
- **Click vào thẻ Hộ chiếu**: Điều hướng `/customer/pets/[id]/passport`

### `/customer/pets` (Danh sách thú cưng)
- **Tải danh sách**: `GET /api/v1/pets`
- **Click "Thêm thú cưng mới"**: Điều hướng `/customer/pets/new`
- **Click vào thú cưng**: Điều hướng `/customer/pets/[id]`
- **Click "Hộ chiếu số"**: Điều hướng `/customer/pets/[id]/passport`
- **Click "Thẻ cấp cứu QR"**: Điều hướng `/customer/pets/[id]/emergency`

### `/customer/pets/new` (Thêm thú cưng)
- **Submit Form**: `POST /api/v1/pets` -> Điều hướng `/customer/pets`

### `/customer/pets/[id]/passport` (Hộ chiếu điện tử)
- **Tải dữ liệu Hộ chiếu**: `GET /api/v1/pets/{id}/passport`
- **Chuyển tab (Lý lịch, Tiêm phòng, Sổ khám, Cân nặng)**: Local State + Render Tab dữ liệu thật
- **Click "Dòng thời gian"**: Điều hướng `/customer/pets/[id]/timeline`
- **Click "Quét y bạ AI"**: Điều hướng `/customer/pets/[id]/documents`

### `/customer/pets/[id]/emergency` (Thẻ cấp cứu QR)
- **Tải trạng thái thất lạc**: `GET /api/v1/pets/{id}/lost_reports`
- **Bật/Tắt Lost Pet Mode**: `POST /api/v1/pets/{id}/lost_reports`
- **Xem mã QR thẻ**: Hiển thị QR link tới `/pet/emergency/{token}`
- **Click "In thẻ đeo vòng cổ"**: `window.print()`

### `/customer/pets/[id]/members` (Chia sẻ gia đình)
- **Tải danh sách thành viên**: `GET /api/v1/pets/{id}/members`
- **Mời thành viên mới**: `POST /api/v1/pets/{id}/members`
- **Xóa thành viên**: `DELETE /api/v1/pets/{id}/members/{id}`
- **Chuyển quyền sở hữu chính**: `POST /api/v1/pets/{id}/transfer-ownership`

### `/customer/appointments/[id]` (Chi tiết lịch hẹn)
- **Tải chi tiết**: `GET /api/v1/appointments/{id}`
- **Hủy lịch hẹn**: `PUT /api/v1/appointments/{id}/status` (`status: "CANCELLED"`)
- **Mở modal thanh toán**: `POST /api/v1/payments/checkout-session`
- **Xác nhận thanh toán online**: `POST /api/v1/payments/{payment_id}/confirm-online`
- **Click "Khám từ xa (Video Call)"**: Điều hướng `/customer/telehealth/{id}`
- **Xem Live Care Feed**: Kết nối WebSocket `/api/v1/ws/care-sessions/{id}`

### `/customer/telehealth/[id]` (Video Call tư vấn từ xa)
- **Kết nối WebRTC**: WebSocket `/api/v1/ws/telehealth/appt_{id}`
- **Bật/Tắt Mic**: Toggle local audio track
- **Bật/Tắt Camera**: Toggle local video track
- **Chia sẻ màn hình**: `navigator.mediaDevices.getDisplayMedia`
- **Gửi tin nhắn chat**: WebSocket message `CHAT_MESSAGE`
- **Kết thúc cuộc gọi**: Ngắt kết nối và điều hướng về `/customer/appointments/{id}`

---

## 2. Receptionist Pages

### `/receptionist/customers` (Quản lý khách hàng)
- **Tải danh sách**: `GET /api/v1/users` (filter role `CUSTOMER`)
- **Mở modal "Thêm khách hàng"**: Local State
- **Submit tạo khách hàng tại quầy**: `POST /api/v1/users` -> Reload danh sách

### `/receptionist/appointments` (Tiếp nhận & Điều phối)
- **Tải danh sách lịch hẹn**: `GET /api/v1/appointments`
- **Xác nhận lịch**: `PUT /api/v1/appointments/{id}/status` (`status: "CONFIRMED"`)
- **Check-in khách đến**: `PUT /api/v1/appointments/{id}/status` (`status: "CHECKED_IN"`)
- **Phân công chuyên viên**: `PATCH /api/v1/appointments/{id}/assign` (`caregiver_id: ...`)
- **Gợi ý Caregiver Matching**: `GET /api/v1/appointments/matching/suggestions`

### `/receptionist/payments` (Thu ngân & Xuất hóa đơn)
- **Tải danh sách hóa đơn**: `GET /api/v1/payments`
- **Mở modal thu tiền**: Local State
- **Chọn Chuyển khoản**: `POST /api/v1/payments/generate-qr` -> render VietQR Napas247
- **Xác nhận đã thu tiền**: `POST /api/v1/payments` (`status: "COMPLETED"`)

---

## 3. Veterinarian Pages

### `/veterinarian` (Dashboard Bác sĩ)
- **Tải ca khám trong ngày**: `GET /api/v1/appointments`, `GET /api/v1/pets`
- **Click "Khám Video"**: Điều hướng `/veterinarian/telehealth/{appt_id}`
- **Click "Mở bệnh án lâm sàng"**: Điều hướng `/veterinarian/patients/{pet_id}`

### `/veterinarian/patients/[id]` (Hồ sơ bệnh nhân lâm sàng)
- **Tải dữ liệu y bạ**: `GET /api/v1/pets/{id}/passport`
- **Phân tích AI Health Insights**: `GET /api/v1/pets/{id}/health-insights`
- **Kê đơn thuốc**: Điều hướng `/veterinarian/prescriptions/new?pet_id={id}`
- **Thêm bệnh án**: Form `POST /api/v1/pets/{id}/medical-records`

### `/veterinarian/telehealth/[id]` (Khám từ xa có ghi bệnh án song song)
- **Kết nối Video WebRTC**: WebSocket `/api/v1/ws/telehealth/appt_{id}`
- **Lưu ghi chép lâm sàng trực tiếp**: `POST /api/v1/pets/{pet_id}/medical-records`
- **Kê đơn thuốc nhanh**: Link tới `/veterinarian/prescriptions/new?pet_id={pet_id}`
- **Kết thúc ca khám**: Điều hướng `/veterinarian`

### `/veterinarian/inventory` (Tra cứu kho dược lâm sàng)
- **Tra cứu tồn kho & vị trí**: `GET /api/v1/inventory?category=...&search=...`
- **Vào kê đơn thuốc**: Link tới `/veterinarian/prescriptions`

### `/veterinarian/vaccinations` (Tiêm phòng)
- **Ghi nhận mũi tiêm**: `POST /api/v1/pets/{id}/vaccinations` (hệ thống tự động trừ 1 liều trong kho dược)

---

## 4. Caregiver Pages

### `/caregiver/sessions/[id]` (Live Care Console)
- **Bắt đầu ca trực**: `POST /api/v1/care-sessions/{id}/start`
- **Đăng ảnh khoảnh khắc**: `POST /api/v1/care-sessions/{id}/events` (`event_type: "PHOTO"`)
- **Cập nhật sinh hiệu**: `POST /api/v1/care-sessions/{id}/events` (`event_type: "VITALS_UPDATE"`)
- **Kết nối WebSocket Live Feed**: `/api/v1/ws/care-sessions/{id}`
- **Hoàn thành ca trực**: `POST /api/v1/care-sessions/{id}/complete`
- **Tạo báo cáo AI Care Report**: `POST /api/v1/care-sessions/{id}/report`

---

## 5. Admin Pages

### `/admin/users` (Quản lý người dùng)
- **Tải danh sách & tìm kiếm**: `GET /api/v1/users`
- **Thêm người dùng mới & gán Role**: `POST /api/v1/users`
- **Khóa / Mở khóa tài khoản**: `PATCH /api/v1/users/{id}/toggle-status`

### `/admin/inventory` (Quản trị kho dược & vật tư tiêu hao)
- **Tải danh mục & 4 thẻ KPI**: `GET /api/v1/inventory`, `GET /api/v1/inventory/stats`
- **Tải lịch sử biến động**: `GET /api/v1/inventory/transactions`
- **Thêm mặt hàng mới**: `POST /api/v1/inventory`
- **Nhập thêm / Xuất hủy / Cân bằng kho**: `POST /api/v1/inventory/{id}/adjust`
- **Xóa mặt hàng khỏi kho**: `DELETE /api/v1/inventory/{id}`
- **Nạp dữ liệu mẫu**: `POST /api/v1/inventory/seed`

### `/admin/services` (Danh mục dịch vụ)
- **Tải bảng giá**: `GET /api/v1/services`
- **Thêm dịch vụ**: `POST /api/v1/services`
- **Sửa giá / thời lượng**: `PUT /api/v1/services/{id}`
- **Xóa dịch vụ**: `DELETE /api/v1/services/{id}`

### `/admin/audit` (Nhật ký kiểm toán)
- **Tải danh sách audit logs**: `GET /api/v1/audit-logs`
- **Mở modal xem chi tiết JSON payload**: Local State Render JSON Viewer

### `/admin/ai` (Trung tâm giám sát AI)
- **Đo lường độ trễ & trạng thái**: `GET /api/v1/ai/health`, `GET /api/v1/ai/models`
- **Gửi prompt kiểm thử**: `POST /api/v1/ai/chat`
