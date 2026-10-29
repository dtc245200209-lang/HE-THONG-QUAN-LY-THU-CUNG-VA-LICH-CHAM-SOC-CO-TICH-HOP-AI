# API REGISTRY — PETCARE AI FASTAPI BACKEND

Tài liệu chuẩn hóa toàn bộ các Endpoints Backend API v1 (`FastAPI`) của hệ thống PetCare AI.
Tất cả các endpoint đều có cơ chế xác thực JWT, kiểm tra phân quyền RBAC và tương tác trực tiếp với cơ sở dữ liệu PostgreSQL.

---

## 1. Authentication & Users API (`/api/v1/auth` & `/api/v1/users`)

| Method | Path | Role yêu cầu | Request Schema | Response Schema | DB Tables | Frontend Consumers | Trạng thái |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| `POST` | `/api/v1/auth/access-token` | Public | OAuth2PasswordRequestForm | TokenResponse (`access_token`) | `users`, `roles` | `/login` | **WORKING** |
| `GET` | `/api/v1/auth/me` | Authenticated | None | UserResponse | `users`, `roles` | `AuthContext` | **WORKING** |
| `POST` | `/api/v1/auth/register` | Public | UserCreate | UserResponse | `users`, `roles` | `/register` | **WORKING** |
| `GET` | `/api/v1/users` | ADMIN, RECEPTIONIST | params (`skip`, `limit`) | List[UserResponse] | `users`, `roles` | `/admin/users`, `/receptionist/customers` | **WORKING** |
| `POST` | `/api/v1/users` | ADMIN, RECEPTIONIST | UserCreate | UserResponse | `users`, `roles` | `/admin/users`, `/receptionist/customers` (Modal) | **WORKING** |
| `PATCH`| `/api/v1/users/{id}/toggle-status` | ADMIN | None | UserResponse | `users` | `/admin/users` (Nút khóa/mở) | **WORKING** |

---

## 2. Pet Health Records & Passport API (`/api/v1/pets`)

| Method | Path | Role yêu cầu | Request Schema | Response Schema | DB Tables | Frontend Consumers | Trạng thái |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| `GET` | `/api/v1/pets` | Authenticated | params (`owner_id`) | List[PetResponse] | `pets`, `memberships` | `/customer/pets`, `/veterinarian/patients`, `/admin/pets` | **WORKING** |
| `POST` | `/api/v1/pets` | Authenticated | PetCreate | PetResponse | `pets`, `memberships` | `/customer/pets/new` | **WORKING** |
| `GET` | `/api/v1/pets/{id}` | Pet Member / Staff | None | PetDetailResponse | `pets`, `allergies`, `vaccinations` | Chi tiết thú cưng | **WORKING** |
| `PATCH`| `/api/v1/pets/{id}` | Primary Owner / Admin | PetUpdate | PetResponse | `pets` | Chỉnh sửa thú cưng | **WORKING** |
| `DELETE`| `/api/v1/pets/{id}` | Primary Owner / Admin | None | SuccessResponse | `pets` | Xóa thú cưng | **WORKING** |
| `GET` | `/api/v1/pets/{id}/passport` | Pet Member / Staff | None | PetPassportResponse | Aggregate 8 bảng y tế | `/customer/pets/[id]/passport` | **WORKING** |
| `GET` | `/api/v1/pets/{id}/timeline` | Pet Member / Staff | None | List[TimelineEventResponse] | `timeline_events` | `/customer/pets/[id]/timeline` | **WORKING** |
| `GET` | `/api/v1/pets/{id}/weights` | Pet Member / Staff | None | List[WeightResponse] | `weights` | Biểu đồ cân nặng | **WORKING** |
| `POST` | `/api/v1/pets/{id}/weights` | Pet Member / Staff | WeightCreate | WeightResponse | `weights` | Modal cân nặng | **WORKING** |
| `DELETE`| `/api/v1/pets/{id}/weights/{id}` | Pet Member / Staff | None | SuccessResponse | `weights` | Xóa lịch sử cân | **WORKING** |
| `POST` | `/api/v1/pets/{id}/vaccinations` | Veterinarian / Staff | VaccinationCreate | VaccinationResponse | `vaccinations`, `inventory_items`, `inventory_transactions` | `/veterinarian/vaccinations` (Tự động trừ kho) | **WORKING** |
| `POST` | `/api/v1/pets/{id}/medications` | Veterinarian / Staff | MedicationCreate | MedicationResponse | `medications`, `inventory_items`, `inventory_transactions` | `/veterinarian/prescriptions` (Tự động trừ kho) | **WORKING** |
| `POST` | `/api/v1/pets/{id}/medical-records`| Veterinarian / Staff | MedicalRecordCreate | MedicalRecordResponse | `medical_records` | `/veterinarian/medical-records`, Telehealth Bác sĩ | **WORKING** |
| `GET` | `/api/v1/pets/{id}/members` | Pet Member | None | List[PetMemberResponse] | `memberships`, `users` | `/customer/pets/[id]/members` | **WORKING** |
| `POST` | `/api/v1/pets/{id}/members` | Primary Owner / Admin | MemberAddRequest | PetMemberResponse | `memberships` | Mời người thân cùng chăm sóc | **WORKING** |
| `DELETE`| `/api/v1/pets/{id}/members/{id}` | Primary Owner / Admin | None | SuccessResponse | `memberships` | Hủy quyền thành viên | **WORKING** |
| `POST` | `/api/v1/pets/{id}/transfer-ownership` | Primary Owner / Admin | TransferRequest | SuccessResponse | `memberships`, `audit_logs` | Chuyển quyền chủ sở hữu chính | **WORKING** |
| `POST` | `/api/v1/pets/{id}/lost_reports`| Primary Owner / Admin | LostModeRequest | LostReportResponse | `lost_pet_reports`, `pets` | Bật/Tắt chế độ thất lạc QR | **WORKING** |
| `GET` | `/api/v1/pets/{id}/documents` | Pet Member / Staff | None | List[PetDocumentResponse] | `pet_documents` | AI Document Scanner | **WORKING** |

---

## 3. Appointments & Scheduling API (`/api/v1/appointments`)

| Method | Path | Role yêu cầu | Request Schema | Response Schema | DB Tables | Frontend Consumers | Trạng thái |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| `GET` | `/api/v1/appointments` | Authenticated | params (`status`, `date`) | List[AppointmentResponse] | `appointments`, `services`, `users` | Khách hàng, Lễ tân, Bác sĩ, Admin | **WORKING** |
| `GET` | `/api/v1/appointments/{id}` | Authenticated | None | AppointmentDetailResponse | `appointments`, `care_sessions` | `/customer/appointments/[id]` | **WORKING** |
| `POST` | `/api/v1/appointments` | Authenticated | AppointmentCreate | AppointmentResponse | `appointments`, `services` | Đặt lịch hẹn mới | **WORKING** |
| `PUT` | `/api/v1/appointments/{id}/status`| Authenticated / Staff | StatusUpdate (`status`) | AppointmentResponse | `appointments` | Check-in, Bắt đầu ca, Hoàn thành, Hủy ca | **WORKING** |
| `PATCH`| `/api/v1/appointments/{id}/assign`| Staff / Admin | AssignStaffRequest | AppointmentResponse | `appointments` | Lễ tân / Admin phân công nhân sự | **WORKING** |
| `GET` | `/api/v1/appointments/matching/suggestions` | Staff / Admin | params (`appointment_id`) | List[CaregiverMatchResponse] | `caregiver_profiles`, `skills` | Thuật toán gợi ý Caregiver Matching | **WORKING** |

---

## 4. Live Care Sessions API (`/api/v1/care-sessions`)

| Method | Path | Role yêu cầu | Request Schema | Response Schema | DB Tables | Frontend Consumers | Trạng thái |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| `GET` | `/api/v1/care-sessions` | Staff / Admin | None | List[CareSessionResponse] | `care_sessions` | `/caregiver/sessions` | **WORKING** |
| `GET` | `/api/v1/care-sessions/{id}` | Authenticated | None | CareSessionDetailResponse | `care_sessions`, `care_events` | Live Care Console Caregiver & Khách hàng | **WORKING** |
| `GET` | `/api/v1/care-sessions/appointment/{id}`| Authenticated | None | CareSessionResponse | `care_sessions`, `care_events` | `/customer/appointments/[id]` | **WORKING** |
| `POST` | `/api/v1/care-sessions/{id}/start`| Caregiver / Staff | None | CareSessionResponse | `care_sessions`, `appointments` | Bắt đầu ca trực chăm sóc | **WORKING** |
| `POST` | `/api/v1/care-sessions/{id}/events`| Caregiver / Staff | CareEventCreate | CareEventResponse | `care_events` | Đăng ảnh, cập nhật sinh hiệu realtime | **WORKING** |
| `POST` | `/api/v1/care-sessions/{id}/complete`| Caregiver / Staff | None | CareSessionResponse | `care_sessions`, `appointments` | Hoàn tất phiên chăm sóc | **WORKING** |
| `POST` | `/api/v1/care-sessions/{id}/report`| Caregiver / Staff | None | CareReportResponse | `care_reports` | Tạo báo cáo tổng kết AI Care Report | **WORKING** |

---

## 5. Payments & Online Gateways API (`/api/v1/payments`)

| Method | Path | Role yêu cầu | Request Schema | Response Schema | DB Tables | Frontend Consumers | Trạng thái |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| `GET` | `/api/v1/payments` | Authenticated | None | List[PaymentResponse] | `payments` | Thu ngân Lễ tân & Sổ cái Admin | **WORKING** |
| `POST` | `/api/v1/payments` | Staff / Admin | PaymentCreate | PaymentResponse | `payments`, `appointments` | Tạo hóa đơn thanh toán tại quầy | **WORKING** |
| `POST` | `/api/v1/payments/generate-qr` | Authenticated | VietQRRequest | VietQRResponse (`qr_url`) | `appointments` | Thu ngân Lễ tân (VietQR MBBank) | **WORKING** |
| `POST` | `/api/v1/payments/checkout-session`| Authenticated | CheckoutSessionRequest | CheckoutSessionResponse | `payments`, `appointments` | Modal thanh toán Khách hàng (VietQR/MoMo/VNPay) | **WORKING** |
| `POST` | `/api/v1/payments/{id}/confirm-online`| Authenticated | None | SuccessResponse | `payments`, `appointments` | Xác nhận thanh toán trực tuyến tức thời | **WORKING** |

---

## 6. Inventory & Pharmacy API (`/api/v1/inventory`)

| Method | Path | Role yêu cầu | Request Schema | Response Schema | DB Tables | Frontend Consumers | Trạng thái |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| `GET` | `/api/v1/inventory` | Authenticated | params (`category`, `search`) | List[InventoryItemResponse] | `inventory_items` | Quản lý kho Admin & Tra cứu Bác sĩ | **WORKING** |
| `GET` | `/api/v1/inventory/stats` | Staff / Admin | None | InventoryStatsResponse | `inventory_items` | 4 Thẻ KPI Dashboard Kho Dược | **WORKING** |
| `GET` | `/api/v1/inventory/transactions` | Staff / Admin | params (`limit`) | List[InventoryTransactionResponse]| `inventory_transactions` | Bảng Nhật ký biến động kho (Audit log) | **WORKING** |
| `POST` | `/api/v1/inventory` | Staff / Admin | InventoryItemCreate | InventoryItemResponse | `inventory_items`, `inventory_transactions` | Modal thêm mặt hàng mới | **WORKING** |
| `PUT` | `/api/v1/inventory/{id}` | Staff / Admin | InventoryItemUpdate | InventoryItemResponse | `inventory_items` | Chỉnh sửa thông tin mặt hàng | **WORKING** |
| `DELETE`| `/api/v1/inventory/{id}` | Staff / Admin | None | SuccessResponse | `inventory_items` | Xóa mặt hàng khỏi kho | **WORKING** |
| `POST` | `/api/v1/inventory/{id}/adjust`| Staff / Admin | InventoryStockAdjust | InventoryItemResponse | `inventory_items`, `inventory_transactions` | Modal Nhập/Xuất kho điều chỉnh | **WORKING** |
| `POST` | `/api/v1/inventory/seed` | Staff / Admin | None | SuccessResponse | `inventory_items`, `inventory_transactions` | Nạp sẵn 8 mặt hàng dược phẩm mẫu | **WORKING** |

---

## 7. WebSockets & WebRTC Signaling Hub (`/api/v1/ws`)

| Protocol | Path | Role yêu cầu | Payload Format | Sự kiện xử lý | Consumers | Trạng thái |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| `WS` | `/api/v1/ws/care-sessions/{id}`| Authenticated | JSON | `CONNECTED`, `NEW_CARE_EVENT`, `SESSION_COMPLETED` | Live Care Caregiver & Customer | **WORKING** |
| `WS` | `/api/v1/ws/telehealth/{room_id}`| Authenticated | JSON | `ROOM_STATE`, `PEER_JOINED`, `OFFER`, `ANSWER`, `ICE_CANDIDATE`, `CHAT_MESSAGE`, `PEER_LEFT` | Khám Video Call Tele-Health HD | **WORKING** |
| `WS` | `/api/v1/ws/{user_id}` | Authenticated | JSON | Thông báo đẩy cá nhân, `CONNECTED`, `PING/PONG` | Notification Center toàn hệ thống | **WORKING** |

---

## 8. AI Orchestrator API (`/api/v1/ai`)

| Method | Path | Role yêu cầu | Request Schema | Response Schema | Provider | Consumers | Trạng thái |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| `POST` | `/api/v1/ai/chat` | Authenticated | AIChatRequest | AIChatResponse | Google Gemini / OpenAI | Chatbot tư vấn khách hàng | **WORKING** |
| `GET` | `/api/v1/ai/care-brief/{pet_id}`| Authenticated | None | CareBriefResponse | Google Gemini | Báo cáo tóm tắt thú cưng | **WORKING** |
| `POST` | `/api/v1/ai/care-report` | Staff / Caregiver | CareSessionInput | CareReportResponse (JSON Schema) | Google Gemini | Tổng kết phiên chăm sóc tự động | **WORKING** |
| `GET` | `/api/v1/ai/health-insights/{id}`| Authenticated | None | HealthInsightResponse (JSON Schema) | Google Gemini | Phân tích thể trạng y tế lâm sàng | **WORKING** |
| `GET` | `/api/v1/ai/health` | Public / Admin | None | HealthStatusResponse | System | Giám sát trạng thái AI & đo lường latency | **WORKING** |
| `GET` | `/api/v1/ai/models` | Admin | None | AIModelsListResponse | System | Trung tâm cấu hình AI Admin | **WORKING** |
