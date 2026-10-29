# ROUTE REGISTRY — PETCARE AI FULL-STACK

Tài liệu chuẩn hóa toàn bộ các tuyến đường (Frontend Canonical Routes) của hệ thống PetCare AI.
Tất cả các thành phần giao diện, chuyển hướng (router.push, Link href) bắt buộc sử dụng định dạng canonical này thông qua `web/src/lib/routes.ts`.

---

## 1. Public Routes (Công khai)

| Route Path | File Component | Mô tả | Quyền truy cập |
| :--- | :--- | :--- | :--- |
| `/` | `web/src/app/page.tsx` | Landing page giới thiệu dịch vụ PetCare AI | Public |
| `/login` | `web/src/app/login/page.tsx` | Đăng nhập tài khoản (JWT) | Public |
| `/register` | `web/src/app/register/page.tsx` | Đăng ký tài khoản Khách hàng mới | Public |
| `/forgot-password` | `web/src/app/forgot-password/page.tsx` | Quên mật khẩu & khôi phục tài khoản | Public |
| `/pet/emergency/[token]` | `web/src/app/pet/emergency/[token]/page.tsx` | Hồ sơ cấp cứu công khai & Form báo nhặt được thú cưng (GPS) | Public |

---

## 2. Customer Routes (Chủ nuôi thú cưng)

| Route Path | File Component | Mô tả | Quyền truy cập |
| :--- | :--- | :--- | :--- |
| `/customer` | `web/src/app/customer/page.tsx` | Dashboard tổng quan khách hàng | CUSTOMER |
| `/customer/pets` | `web/src/app/customer/pets/page.tsx` | Danh sách thú cưng của gia đình | CUSTOMER |
| `/customer/pets/new` | `web/src/app/customer/pets/new/page.tsx` | Thêm hồ sơ thú cưng mới | CUSTOMER |
| `/customer/pets/[id]` | `web/src/app/customer/pets/[id]/page.tsx` | Chi tiết hồ sơ thú cưng | CUSTOMER |
| `/customer/passport` | `web/src/app/customer/passport/page.tsx` | Hub chuyển hướng nhanh Hộ chiếu thú cưng | CUSTOMER |
| `/customer/pets/[id]/passport` | `web/src/app/customer/pets/[id]/passport/page.tsx` | Hộ chiếu điện tử chuẩn y tế (Pet Passport) | CUSTOMER |
| `/customer/pets/[id]/timeline` | `web/src/app/customer/pets/[id]/timeline/page.tsx` | Dòng thời gian phát triển & lịch sử y tế | CUSTOMER |
| `/customer/documents` | `web/src/app/customer/documents/page.tsx` | Hub tài liệu & sổ y bạ số hóa | CUSTOMER |
| `/customer/pets/[id]/documents` | `web/src/app/customer/pets/[id]/documents/page.tsx` | Quét sổ tiêm & tài liệu y tế bằng AI OCR | CUSTOMER |
| `/customer/pets/[id]/emergency` | `web/src/app/customer/pets/[id]/emergency/page.tsx` | Cấu hình thẻ QR cấp cứu & Bật/Tắt Lost Mode | CUSTOMER |
| `/customer/pets/[id]/members` | `web/src/app/customer/pets/[id]/members/page.tsx` | Chia sẻ hồ sơ chăm sóc gia đình & Chuyển quyền | CUSTOMER |
| `/customer/appointments` | `web/src/app/customer/appointments/page.tsx` | Đặt lịch dịch vụ & Danh sách lịch hẹn | CUSTOMER |
| `/customer/appointments/[id]` | `web/src/app/customer/appointments/[id]/page.tsx` | Chi tiết lịch hẹn, Live Care Feed & Thanh toán VietQR | CUSTOMER |
| `/customer/care` | `web/src/app/customer/care/page.tsx` | Hub theo dõi phiên chăm sóc trực tiếp (Live Care) | CUSTOMER |
| `/customer/telehealth/[id]` | `web/src/app/customer/telehealth/[id]/page.tsx` | Khám thú y từ xa qua Video Call (WebRTC HD) | CUSTOMER |
| `/customer/ai-chat` | `web/src/app/customer/ai-chat/page.tsx` | Trợ lý tư vấn sức khỏe & dinh dưỡng AI 24/7 | CUSTOMER |
| `/customer/notifications` | `web/src/app/customer/notifications/page.tsx` | Trung tâm thông báo & nhắc hẹn thông minh | CUSTOMER |
| `/customer/orders` | `web/src/app/customer/orders/page.tsx` | Quản lý đơn hàng mua sắm, tiến trình giao hàng, hủy đơn & đổi trả | CUSTOMER |
| `/customer/profile` | `web/src/app/customer/profile/page.tsx` | Quản lý thông tin tài khoản cá nhân | CUSTOMER |

---

## 3. Receptionist Routes (Lễ tân & Thu ngân)

| Route Path | File Component | Mô tả | Quyền truy cập |
| :--- | :--- | :--- | :--- |
| `/receptionist` | `web/src/app/receptionist/page.tsx` | Tổng quan sảnh tiếp đón phòng khám | RECEPTIONIST, ADMIN |
| `/receptionist/customers` | `web/src/app/receptionist/customers/page.tsx` | Quản lý khách hàng & Đăng ký nhanh tại quầy | RECEPTIONIST, ADMIN |
| `/receptionist/appointments` | `web/src/app/receptionist/appointments/page.tsx` | Tiếp nhận lịch hẹn, check-in, phân công staff | RECEPTIONIST, ADMIN |
| `/receptionist/orders` | `web/src/app/receptionist/orders/page.tsx` | Duyệt đơn mua hàng siêu thị, bàn giao bưu tá & xử lý đổi trả | RECEPTIONIST, ADMIN |
| `/receptionist/pets` | `web/src/app/receptionist/pets/page.tsx` | Tra cứu hồ sơ thú cưng và thẻ định danh | RECEPTIONIST, ADMIN |
| `/receptionist/services` | `web/src/app/receptionist/services/page.tsx` | Bảng giá và menu dịch vụ phòng khám | RECEPTIONIST, ADMIN |
| `/receptionist/payments` | `web/src/app/receptionist/payments/page.tsx` | Thu ngân, xuất hóa đơn biên lai & VietQR động | RECEPTIONIST, ADMIN |
| `/receptionist/caregivers` | `web/src/app/receptionist/caregivers/page.tsx` | Giám sát trạng thái ca trực đội ngũ Caregivers | RECEPTIONIST, ADMIN |
| `/receptionist/veterinarians` | `web/src/app/receptionist/veterinarians/page.tsx` | Giám sát lịch trực phòng khám Bác sĩ | RECEPTIONIST, ADMIN |
| `/receptionist/notifications` | `web/src/app/receptionist/notifications/page.tsx` | Thông báo sảnh lễ tân | RECEPTIONIST, ADMIN |

---

## 4. Veterinarian Routes (Bác sĩ Thú y)

| Route Path | File Component | Mô tả | Quyền truy cập |
| :--- | :--- | :--- | :--- |
| `/veterinarian` | `web/src/app/veterinarian/page.tsx` | Dashboard ca khám & cảnh báo lâm sàng trong ngày | VETERINARIAN, ADMIN |
| `/veterinarian/patients` | `web/src/app/veterinarian/patients/page.tsx` | Danh sách bệnh nhân 4 chân & tra cứu hồ sơ | VETERINARIAN, ADMIN |
| `/veterinarian/patients/[id]` | `web/src/app/veterinarian/patients/[id]/page.tsx` | Bệnh án chi tiết, biểu mẫu khám & AI Health Insights | VETERINARIAN, ADMIN |
| `/veterinarian/schedule` | `web/src/app/veterinarian/schedule/page.tsx` | Lịch trực phòng khám và lịch phẫu thuật | VETERINARIAN, ADMIN |
| `/veterinarian/medical-records` | `web/src/app/veterinarian/medical-records/page.tsx` | Sổ khám bệnh và lưu trữ chẩn đoán | VETERINARIAN, ADMIN |
| `/veterinarian/prescriptions` | `web/src/app/veterinarian/prescriptions/page.tsx` | Đơn thuốc điện tử & liều lượng điều trị | VETERINARIAN, ADMIN |
| `/veterinarian/prescriptions/new` | `web/src/app/veterinarian/prescriptions/new/page.tsx` | Biểu mẫu kê đơn thuốc mới cho thú cưng | VETERINARIAN, ADMIN |
| `/veterinarian/vaccinations` | `web/src/app/veterinarian/vaccinations/page.tsx` | Quản lý tiêm phòng & cấp chứng nhận tiêm chủng | VETERINARIAN, ADMIN |
| `/veterinarian/inventory` | `web/src/app/veterinarian/inventory/page.tsx` | Tra cứu kho dược lâm sàng (tồn kho, vị trí kệ, HSD) | VETERINARIAN, ADMIN |
| `/veterinarian/documents` | `web/src/app/veterinarian/documents/page.tsx` | Quản lý phim X-quang, kết quả siêu âm, xét nghiệm | VETERINARIAN, ADMIN |
| `/veterinarian/notifications` | `web/src/app/veterinarian/notifications/page.tsx` | Thông báo y tế, ca tái khám và cảnh báo | VETERINARIAN, ADMIN |
| `/veterinarian/telehealth/[id]` | `web/src/app/veterinarian/telehealth/[id]/page.tsx` | Khám Tele-Health Video Call kèm ghi chép bệnh án | VETERINARIAN, ADMIN |

---

## 5. Caregiver Routes (Người chăm sóc)

| Route Path | File Component | Mô tả | Quyền truy cập |
| :--- | :--- | :--- | :--- |
| `/caregiver` | `web/src/app/caregiver/page.tsx` | Ca trực và công việc hôm nay | CAREGIVER, ADMIN |
| `/caregiver/schedule` | `web/src/app/caregiver/schedule/page.tsx` | Lịch làm việc cá nhân theo tuần/tháng | CAREGIVER, ADMIN |
| `/caregiver/sessions` | `web/src/app/caregiver/sessions/page.tsx` | Danh sách ca chăm sóc được phân công | CAREGIVER, ADMIN |
| `/caregiver/sessions/[id]` | `web/src/app/caregiver/sessions/[id]/page.tsx` | Live Care Console: phát sóng ảnh, sinh hiệu, AI Report | CAREGIVER, ADMIN |
| `/caregiver/pets` | `web/src/app/caregiver/pets/page.tsx` | Tra cứu thông tin thú cưng phụ trách | CAREGIVER, ADMIN |
| `/caregiver/reports` | `web/src/app/caregiver/reports/page.tsx` | Nhật ký và báo cáo ca chăm sóc | CAREGIVER, ADMIN |
| `/caregiver/notifications` | `web/src/app/caregiver/notifications/page.tsx` | Cảnh báo phân công ca chăm sóc mới | CAREGIVER, ADMIN |

---

## 6. Admin Routes (Quản trị viên)

| Route Path | File Component | Mô tả | Quyền truy cập |
| :--- | :--- | :--- | :--- |
| `/admin` | `web/src/app/admin/page.tsx` | Dashboard KPI tài chính & vận hành toàn hệ thống | ADMIN |
| `/admin/users` | `web/src/app/admin/users/page.tsx` | Quản lý người dùng, tạo tài khoản, RBAC, khóa/mở | ADMIN |
| `/admin/staff` | `web/src/app/admin/staff/page.tsx` | Quản lý nhân sự phòng khám (Bác sĩ, Caregiver, Lễ tân) | ADMIN |
| `/admin/pets` | `web/src/app/admin/pets/page.tsx` | Cơ sở dữ liệu thú cưng toàn viện & thẻ định danh | ADMIN |
| `/admin/products` | `web/src/app/admin/products/page.tsx` | Quản trị danh mục sản phẩm đồ ăn & phụ kiện Pet Shop | ADMIN |
| `/admin/orders` | `web/src/app/admin/orders/page.tsx` | Thống kê & giám sát số lượng đơn hàng đi, đơn hoàn trả & dòng tiền | ADMIN |
| `/admin/inventory` | `web/src/app/admin/inventory/page.tsx` | Quản trị kho dược, nhập/xuất kho, HSD <45 ngày, Audit log | ADMIN |
| `/admin/services` | `web/src/app/admin/services/page.tsx` | Quản lý danh mục gói dịch vụ và bảng giá (CRUD) | ADMIN |
| `/admin/appointments` | `web/src/app/admin/appointments/page.tsx` | Điều phối tổng thể lịch hẹn, phân bổ chuyên viên | ADMIN |
| `/admin/payments` | `web/src/app/admin/payments/page.tsx` | Sổ cái tài chính, đối soát doanh thu thực thu | ADMIN |
| `/admin/reports` | `web/src/app/admin/reports/page.tsx` | Báo cáo hiệu suất kinh doanh và năng suất nhân viên | ADMIN |
| `/admin/analytics` | `web/src/app/admin/analytics/page.tsx` | Phân tích cơ cấu thú cưng, tỷ lệ hoàn thành ca hẹn | ADMIN |
| `/admin/audit` | `web/src/app/admin/audit/page.tsx` | Nhật ký bảo mật kiểm toán hệ thống (JSON Viewer) | ADMIN |
| `/admin/ai` | `web/src/app/admin/ai/page.tsx` | Trung tâm giám sát AI Orchestrator & console test prompt | ADMIN |
| `/admin/settings` | `web/src/app/admin/settings/page.tsx` | Cấu hình thương hiệu phòng khám, giờ mở cửa | ADMIN |
