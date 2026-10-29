# REALTIME EVENT CATALOG — PETCARE AI

Danh mục sự kiện thời gian thực (Realtime Events) chuẩn hóa trong toàn bộ hệ thống PetCare AI.
Sử dụng qua WebSockets (`/api/v1/ws`) và Redis Pub/Sub Outbox Pattern.

---

## 1. Cấu Trúc Payload Chuẩn (Event Envelope Standard)

Mọi sự kiện phát tán qua WebSocket bắt buộc tuân theo cấu trúc JSON:

```json
{
  "event_id": "550e8400-e29b-41d4-a716-446655440000",
  "event_type": "appointment.confirmed",
  "entity_type": "appointment",
  "entity_id": "c8b1a432-8433-4f4f-b64d-905a5a1f26f1",
  "actor_id": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
  "occurred_at": "2026-09-21T00:15:30Z",
  "data": {
    "status": "CONFIRMED",
    "scheduled_time": "2026-09-22T09:00:00Z"
  }
}
```

---

## 2. Danh Mục Sự Kiện Chi Tiết (Event Catalog)

### A. Nhóm Lịch Hẹn (Appointments)

| Event Type | Mô tả sự kiện | Người phát (Publisher) | Người nhận (Subscribers) | Tác vụ Client xử lý |
| :--- | :--- | :--- | :--- | :--- |
| `appointment.created` | Khách hàng đặt lịch mới | Customer API | Receptionist, Admin | Cập nhật danh sách ca chờ duyệt, phát chuông báo sảnh |
| `appointment.confirmed` | Lễ tân/Hệ thống xác nhận lịch | Receptionist API | Customer, Staff | Đổi trạng thái lịch hẹn sang `CONFIRMED` realtime |
| `appointment.checked_in` | Khách hàng và thú cưng đã đến sảnh | Receptionist API | Assigned Doctor/Caregiver | Đổi badge `ĐÃ ĐẾN`, hiển thị bệnh nhân vào phòng chờ khám |
| `appointment.rescheduled` | Thay đổi thời gian lịch hẹn | Receptionist / Customer | Customer, Staff | Cập nhật lại lịch hẹn trên màn hình |
| `appointment.cancelled` | Lịch hẹn bị hủy | Customer / Receptionist | Customer, Receptionist | Giải phóng khung giờ slot, đổi badge `ĐÃ HỦY` |
| `staff.assigned` | Phân công chuyên viên phụ trách | Receptionist / Admin | Assigned Staff, Customer | Hiển thị tên bác sĩ / caregiver phụ trách ca |

### B. Nhóm Phiên Chăm Sóc Trực Tiếp (Live Care Sessions)

| Event Type | Mô tả sự kiện | Người phát (Publisher) | Người nhận (Subscribers) | Tác vụ Client xử lý |
| :--- | :--- | :--- | :--- | :--- |
| `care_session.started` | Bắt đầu ca chăm sóc | Caregiver API | Customer, Receptionist | Kích hoạt Live Care badge đỏ nhấp nháy, mở live feed |
| `care_session.event_added` | Đăng ảnh/cập nhật sinh hiệu mới | Caregiver API | Customer (qua WebSocket) | Chèn khoảnh khắc mới vào dòng sự kiện Live Care |
| `care_session.completed` | Hoàn thành ca chăm sóc | Caregiver API | Customer, Receptionist | Đổi trạng thái `COMPLETED`, mở xem báo cáo AI tổng kết |
| `care_report.published` | Báo cáo AI Care Report được duyệt | Caregiver API / AI | Customer | Hiển thị tóm tắt, khuyến nghị và ghi vào Timeline bé |

### C. Nhóm Y Tế & Điều Trị (Clinical & Medical)

| Event Type | Mô tả sự kiện | Người phát (Publisher) | Người nhận (Subscribers) | Tác vụ Client xử lý |
| :--- | :--- | :--- | :--- | :--- |
| `medical_record.created` | Bác sĩ hoàn thành bệnh án | Veterinarian API | Customer, Admin | Cập nhật sổ khám bệnh, tự động thêm vào Timeline |
| `prescription.created` | Kê đơn thuốc điện tử | Veterinarian API | Customer | Hiển thị danh mục thuốc cần uống và hướng dẫn liều dùng |
| `vaccination.created` | Ghi nhận mũi tiêm vắc-xin mới | Veterinarian API | Customer | Cấp chứng nhận tiêm chủng, tạo lịch hẹn mũi nhắc lại |

### D. Nhóm Thanh Toán (Payments)

| Event Type | Mô tả sự kiện | Người phát (Publisher) | Người nhận (Subscribers) | Tác vụ Client xử lý |
| :--- | :--- | :--- | :--- | :--- |
| `payment.created` | Khởi tạo hóa đơn thanh toán | Receptionist / Online API | Customer, Cashier | Hiển thị mã VietQR động để quét thanh toán |
| `payment.confirmed` | Giao dịch thanh toán thành công | Cashier / Online Confirm | Customer, Cashier, Admin | Đổi huy hiệu sang `ĐÃ THANH TOÁN`, xác nhận lịch hẹn |

### E. Nhóm Kho Dược & Vật Tư (Inventory)

| Event Type | Mô tả sự kiện | Người phát (Publisher) | Người nhận (Subscribers) | Tác vụ Client xử lý |
| :--- | :--- | :--- | :--- | :--- |
| `inventory.updated` | Nhập kho, xuất kho hoặc trừ tồn | Inventory API / Auto Deduct | Admin, Veterinarian | Cập nhật số lượng khả dụng trên bảng kho |
| `inventory.low_stock` | Lượng tồn dưới định mức an toàn | Auto Trigger | Admin, Pharmacist | Đổi màu cảnh báo vàng "Cần nhập thêm" trên KPI |
| `inventory.expiring` | Lô thuốc có hạn sử dụng < 45 ngày | Auto Scan | Admin, Veterinarian | Đổi màu cảnh báo đỏ "Sắp hết hạn" |

### F. Nhóm Video Call Tư Vấn Từ Xa (Tele-Health WebRTC Signaling)

| Event Type | Mô tả sự kiện | Người phát (Publisher) | Người nhận (Subscribers) | Tác vụ Client xử lý |
| :--- | :--- | :--- | :--- | :--- |
| `ROOM_STATE` | Đồng bộ danh sách người trong phòng | WebSocket Hub | Thành viên mới vào phòng | Khởi tạo WebRTC PeerConnection và gửi Offer |
| `PEER_JOINED` | Bác sĩ hoặc Khách hàng tham gia | WebSocket Hub | Đối tác trong phòng | Hiển thị thông báo kết nối, bắt đầu bắt tay P2P |
| `OFFER` / `ANSWER` | Trao đổi SDP Session Description | Client Peer A / B | Client đối tác | Thiết lập đường truyền media video/audio P2P |
| `ICE_CANDIDATE` | Trao đổi ứng viên mạng ICE | Client Peer A / B | Client đối tác | Tìm kiếm đường truyền mạng tối ưu giữa 2 thiết bị |
| `CHAT_MESSAGE` | Tin nhắn văn bản trong phòng khám | Bác sĩ / Khách hàng | Cả 2 thành viên trong phòng | Hiển thị tin nhắn tức thời vào hộp thoại chat |
| `PEER_LEFT` | Người tham gia ngắt kết nối/rời phòng | WebSocket Hub | Người còn lại trong phòng | Dừng remote video stream, thông báo kết thúc cuộc gọi |

### G. Nhóm Định Danh & Cấp Cứu Thất Lạc (Emergency & Lost Pet)

| Event Type | Mô tả sự kiện | Người phát (Publisher) | Người nhận (Subscribers) | Tác vụ Client xử lý |
| :--- | :--- | :--- | :--- | :--- |
| `pet.lost_mode_enabled` | Bật chế độ tìm kiếm khẩn cấp | Chủ nuôi | Public QR Scanner | Kích hoạt banner màu đỏ báo mất trên trang QR |
| `pet.found_reported` | Người lạ gửi tin báo tìm thấy kèm GPS | Public Finder Form | Chủ nuôi (qua WebSocket/Noti)| Gửi thông báo khẩn cấp kèm tọa độ bản đồ cho chủ |
