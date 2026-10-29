# PETCARE AI — MASTER PROMPT FULL-STACK REALTIME + API KEY

## Mục tiêu

Audit, sửa, hoàn thiện và liên kết toàn bộ PetCare AI hiện có thành **một hệ thống Web Full-Stack hoạt động thật**.

Yêu cầu bắt buộc:

- Mọi menu, nút, form, modal, table action phải thao tác được thật.
- Frontend phải kết nối Backend thật.
- Backend phải lưu PostgreSQL thật.
- Dữ liệu giữa Customer, Receptionist, Veterinarian, Caregiver và Admin phải dùng chung một nguồn dữ liệu.
- Các thay đổi quan trọng phải cập nhật realtime giữa các vai trò.
- AI dùng API Key làm provider chính.
- Ollama không phải dependency bắt buộc.
- Không được dùng page tĩnh, mock data hoặc fake toast để giả vờ hoàn thành.
- Không được dừng ở bước thiết kế.
- Không được tuyên bố “Done” khi chưa test.

---

# 1. Vai trò của Agent

Bạn là:

- Senior Software Architect
- Senior Next.js Engineer
- Senior FastAPI Engineer
- PostgreSQL Engineer
- Realtime/WebSocket Engineer
- AI Integration Engineer
- DevOps Engineer
- QA/E2E Engineer
- UI/UX Engineer
- Security Engineer

Bạn đang làm việc trên repository PetCare AI hiện có.

Không rebuild từ đầu nếu code hiện tại vẫn dùng được.

Quy trình bắt buộc:

```text
AUDIT
→ MAP ROUTES
→ MAP APIS
→ MAP DATABASE
→ MAP REALTIME EVENTS
→ FIND BROKEN INTERACTIONS
→ IMPLEMENT
→ CONNECT
→ TEST
→ FIX
→ RE-TEST
→ VERIFY CROSS-ROLE
→ DOCUMENT
```

---

# 2. Định nghĩa “chức năng hoạt động thật”

Một chức năng chỉ được đánh dấu WORKING khi:

```text
User Action
→ Frontend validation
→ Backend API
→ Authentication
→ Authorization
→ Business validation
→ PostgreSQL transaction
→ Event/outbox nếu cần
→ API response
→ Frontend update
→ Reload trang
→ Dữ liệu vẫn đúng
→ Role liên quan thấy dữ liệu đúng
```

Nếu chức năng realtime:

```text
Mutation
→ DB commit
→ outbox event
→ event publisher
→ Redis/WebSocket
→ authorized clients
→ TanStack Query update/invalidate
→ UI cập nhật không F5
```

Không được coi là hoàn thành nếu chỉ:

- Có route.
- Có page.
- Có nút.
- Có modal.
- Có `console.log`.
- Có `setTimeout`.
- Có fake `toast.success`.
- Có array hardcode.
- Có dữ liệu random.
- Có “Coming Soon”.
- Có mock API.
- Có state frontend đổi nhưng DB không đổi.

---

# 3. Kiến trúc mục tiêu

```text
                    NEXT.JS PETCARE WEB
                           │
       ┌───────────────────┼────────────────────┐
       │                   │                    │
    Customer          Staff Portals           Admin
                           │
                 ┌─────────┼─────────┐
                 │         │         │
            Reception   Veterinarian Caregiver
                 │         │         │
                 └─────────┼─────────┘
                           ▼
                      FASTAPI API
                           │
      ┌────────────────────┼─────────────────────┐
      ▼                    ▼                     ▼
 PostgreSQL              Redis                 MinIO
Source of Truth      Cache/Queue/Event        Storage
      │                    │
      │                    ├── Celery
      │                    └── WebSocket
      │
      └────────────── AI Provider API
```

PostgreSQL là Source of Truth.

Redis không phải source of truth.

AI không phải source of truth.

---

# 4. AI dùng API Key làm chính

Hiện tại ưu tiên AI qua API Key.

Nếu project đã dùng Gemini thì giữ provider đó:

```env
AI_PROVIDER=gemini
GEMINI_API_KEY=
GEMINI_MODEL=
```

Nếu project có OpenAI-compatible provider thì hỗ trợ:

```env
OPENAI_API_KEY=
OPENAI_MODEL=
```

Không tự ý đổi provider nếu provider hiện tại đang hoạt động.

Tạo interface:

```python
class AIProvider:
    async def chat(...)
    async def generate_structured(...)
    async def analyze_document(...)
    async def generate_care_report(...)
    async def generate_health_insight(...)
```

Ollama:

```env
OLLAMA_ENABLED=false
```

Ollama chỉ optional.

Nếu Ollama không chạy:
Core PetCare vẫn phải hoạt động.

---

# 5. Secret Management

Không hardcode:

- AI API Key
- JWT secret
- DB production password
- MinIO secret
- payment secret
- email password

Create:

```text
.env.example
```

Ví dụ:

```env
APP_ENV=development
DATABASE_URL=
REDIS_URL=

JWT_SECRET=
ACCESS_TOKEN_EXPIRE_MINUTES=
REFRESH_TOKEN_EXPIRE_DAYS=

AI_PROVIDER=gemini
GEMINI_API_KEY=
GEMINI_MODEL=

OPENAI_API_KEY=
OPENAI_MODEL=

OLLAMA_ENABLED=false
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=

MINIO_ENDPOINT=
MINIO_ACCESS_KEY=
MINIO_SECRET_KEY=
MINIO_BUCKET=

FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:8000
```

Không print API key.

Không log API key.

Không đưa key vào README.

---

# 6. Audit dự án hiện tại trước khi sửa

Đọc:

- README.md
- PROJECT_STATUS.md
- docker-compose
- frontend routes
- backend routers
- models
- schemas
- services
- migrations
- WebSockets
- Celery tasks
- AI provider
- MinIO integration
- tests
- seed scripts

Tạo:

```text
docs/CURRENT_IMPLEMENTATION_AUDIT.md
```

Bảng:

```text
Feature
Frontend Route
Frontend File
Backend Endpoint
Backend Service
Database Tables
Realtime Event
Current Status
Problem
Fix Required
Verification
```

Status chỉ dùng:

```text
WORKING
PARTIAL
BROKEN
MISSING
BLOCKED_EXTERNAL
```

---

# 7. Canonical Route Registry

Scan:

```text
web/src/app
```

và tất cả:

- Link href
- router.push
- router.replace
- redirect
- sidebar
- top navigation
- quick action
- card link
- notification deep link
- table row action

Tạo:

```text
docs/ROUTE_REGISTRY.md
web/src/lib/routes.ts
```

Ví dụ:

```ts
export const routes = {
  customer: {
    dashboard: "/customer",
    pets: "/customer/pets",
    pet: (id: string) => `/customer/pets/${id}`,
    passport: (id: string) => `/customer/pets/${id}/passport`,
  }
}
```

Không để URL hardcode lung tung.

AI không được tự bịa URL.

---

# 8. Public Routes

Đảm bảo:

```text
/
/login
/register
/forgot-password
/pet/emergency/[token]
```

Nếu project hiện có `/public/pet/[token]` thì chọn một route canonical.

Route cũ phải redirect nếu cần.

Không giữ hai implementation khác nhau của cùng một chức năng.

---

# 9. Customer Routes

Đảm bảo tồn tại và hoạt động:

```text
/customer
/customer/pets
/customer/pets/new
/customer/pets/[id]
/customer/pets/[id]/passport
/customer/passport
/customer/pets/[id]/timeline
/customer/pets/[id]/documents
/customer/documents
/customer/pets/[id]/emergency
/customer/pets/[id]/members
/customer/appointments
/customer/appointments/[id]
/customer/care
/customer/telehealth/[id]
/customer/ai-chat
/customer/ai
/customer/notifications
/customer/profile
```

Nếu `/customer/ai-chat` và `/customer/ai` trùng:
chọn một route canonical và redirect route còn lại.

---

# 10. Customer — Pet CRUD

Phải có backend thật:

```text
POST /api/v1/pets
GET /api/v1/pets
GET /api/v1/pets/{id}
PATCH /api/v1/pets/{id}
```

Phải:

- create pet
- edit pet
- upload avatar
- validate owner/member permission
- reload vẫn còn dữ liệu

Không hardcode pet.

---

# 11. Digital Pet Passport

API canonical:

```text
GET /api/v1/pets/{id}/passport
```

Passport aggregate dữ liệu thật từ:

- pets
- memberships
- allergies
- conditions
- vaccinations
- medications
- prescriptions
- medical records
- weight records
- appointments
- care reports
- documents

Không duplicate toàn bộ Passport thành fake JSON frontend.

---

# 12. Pet Timeline

API:

```text
GET /api/v1/pets/{id}/timeline
```

Timeline lấy sự kiện thật:

- pet created
- vaccination
- medical visit
- prescription
- appointment
- care session
- care report
- weight
- ownership transfer

Không hardcode timeline.

---

# 13. Weight Tracking

Implement:

```text
POST /api/v1/pets/{id}/weights
GET /api/v1/pets/{id}/weights
```

Chart dùng DB data.

---

# 14. Vaccination

Phải có:

- list
- add theo permission
- update theo permission
- next due date
- reminders
- veterinarian link
- batch/lot nếu có
- inventory deduction khi business rule yêu cầu

Không cho Customer chỉnh record bác sĩ đã xác nhận nếu policy không cho.

---

# 15. Medication & Prescription

Phân biệt:

- medication current/historical
- veterinarian prescription

Customer chỉ xem prescription.

Veterinarian mới tạo prescription.

Caregiver không được kê đơn.

---

# 16. Emergency QR + Lost Pet Mode

Customer:

- generate QR
- configure public info
- enable/disable lost mode

Public:

- scan token
- xem dữ liệu được phép
- gửi found report
- optional browser geolocation

Không expose:

- home address
- private medical record
- payment
- account private data

Found report phải tạo notification cho owner.

---

# 17. Family Sharing

Roles:

```text
PRIMARY_OWNER
CO_OWNER
FAMILY_CAREGIVER
VIEWER
```

Implement thật:

- list
- add/invite
- change role
- remove
- transfer ownership

Transfer ownership phải transaction-safe.

Audit log bắt buộc.

---

# 18. Documents + AI OCR

Flow:

```text
Upload
→ MinIO
→ DB document row
→ Celery task
→ AI API provider
→ structured extraction
→ PENDING_REVIEW
→ review
→ confirm
→ trusted domain record
```

Statuses:

```text
UPLOADED
PROCESSING
PENDING_REVIEW
CONFIRMED
FAILED
```

AI extraction không được tự động biến thành trusted medical truth.

---

# 19. Appointment Booking

Customer:

```text
Select Pet
→ Select Service
→ Select Date
→ Select Time
→ Check Availability
→ Optional Staff
→ Notes
→ Create
```

Backend phải:

- validate slot
- prevent conflict
- calculate price from service table
- not trust frontend total
- persist appointment
- create event
- notify receptionist realtime

---

# 20. Appointment State Machine

States:

```text
PENDING
CONFIRMED
CHECKED_IN
IN_PROGRESS
COMPLETED
CANCELLED
NO_SHOW
```

Backend enforce transition.

Không cho frontend đổi status bất kỳ.

---

# 21. Payment

Payment state:

```text
PENDING
PENDING_VERIFICATION
PAID
FAILED
REFUNDED
CANCELLED
```

VietQR:
- amount từ backend
- reference unique
- QR từ payment thật

Không set PAID chỉ vì user mở modal hoặc bấm “đã thanh toán”.

Nếu chưa có bank webhook:
manual verification bởi receptionist/admin + audit.

MoMo/VNPay sandbox phải label SANDBOX.

Không claim production nếu chưa có merchant credential thật.

---

# 22. Live Care

Customer xem:

- current stage
- care events
- photos
- vitals
- notes allowed
- final report

Realtime không F5.

Nếu WebSocket reconnect:
fetch latest canonical state từ API.

---

# 23. Telehealth

Customer + Veterinarian:

- join room
- camera
- microphone
- remote stream
- optional screen share
- chat

Backend signaling:

```text
/api/v1/ws/telehealth/{room_id}
```

Phải verify với hai browser/session riêng.

Không dùng video placeholder.

---

# 24. Receptionist Routes

```text
/receptionist
/receptionist/customers
/receptionist/appointments
/receptionist/pets
/receptionist/services
/receptionist/payments
/receptionist/caregivers
/receptionist/veterinarians
/receptionist/notifications
```

---

# 25. Receptionist — Walk-in Customer

Modal tạo customer phải gọi backend thật.

Backend:
- unique email
- default CUSTOMER role
- phone validation
- initial password policy
- audit actor receptionist

Không append fake row frontend.

---

# 26. Receptionist — Appointment Operations

Phải thao tác thật:

- list
- filter
- detail
- confirm
- check-in
- assign staff
- reschedule nếu policy cho
- cancel theo permission

Reload vẫn đúng.

---

# 27. Staff Assignment

Backend kiểm tra:

- role compatibility
- schedule
- appointment overlap
- service requirements
- availability

Không chỉ lưu dropdown selection.

---

# 28. Check-in

Flow:

```text
Appointment
→ backend validates
→ CHECKED_IN
→ outbox event
→ assigned staff notified
→ customer sees status
→ receptionist board updates
```

---

# 29. Receptionist — Payments

Phải có:

- payment record
- payment method
- VietQR
- CASH
- CREDIT_CARD internal
- BANK_TRANSFER verification

Audit:
- payment.created
- payment.confirmed
- payment.refunded

---

# 30. Veterinarian Routes

```text
/veterinarian
/veterinarian/patients
/veterinarian/patients/[id]
/veterinarian/medical-records
/veterinarian/prescriptions
/veterinarian/prescriptions/new
/veterinarian/vaccinations
/veterinarian/inventory
/veterinarian/documents
/veterinarian/schedule
/veterinarian/notifications
/veterinarian/telehealth/[id]
```

---

# 31. Veterinarian — Medical Record

Persist structured record:

- chief complaint
- symptoms
- physical exam
- diagnosis
- assessment
- treatment plan
- follow-up
- notes

Sau save:
- Timeline update
- Customer thấy phần allowed
- notification nếu policy yêu cầu

---

# 32. Veterinarian — Prescription

Prescription:

- one-to-many items
- medication
- dose
- unit
- frequency
- duration
- instructions
- dates

Transaction-safe.

Inventory deduction đúng rule.

Retry không được trừ 2 lần.

---

# 33. Veterinarian — Vaccination

Create record:

- vaccine
- date
- next due
- veterinarian
- lot/batch
- inventory link

Transaction:
- vaccination row
- inventory transaction
- reminder
- event

---

# 34. Veterinarian — AI Health Insight

AI dùng API key.

Input chỉ từ authorized record.

Output label AI-generated.

Không commit diagnosis tự động.

---

# 35. Veterinarian — AI Medical Summary

AI summarize:

- diagnoses
- medications
- vaccinations
- recent records
- weight trend

Không invent data.

---

# 36. Caregiver Routes

```text
/caregiver
/caregiver/schedule
/caregiver/sessions
/caregiver/sessions/[id]
/caregiver/pets
/caregiver/reports
/caregiver/notifications
```

---

# 37. Caregiver — Assigned Sessions

Chỉ trả session được assign.

Backend enforce.

---

# 38. Start Care Session

API:

```text
POST /api/v1/care-sessions/{id}/start
```

Validate:
- caregiver assigned
- appointment checked in
- state hợp lệ

---

# 39. Care Events

Support:

```text
PHOTO
VITALS_UPDATE
ACTIVITY_LOG
STATUS_UPDATE
NOTE
```

Persist `care_events`.

Photo → MinIO.

---

# 40. Vitals

Structured:

- temperature
- respiration rate
- mood
- food intake
- notes

Không random value.

---

# 41. Complete Care Session

Transaction:

```text
care_session → COMPLETED
appointment → COMPLETED nếu đúng workflow
outbox event
AI care report job
notification
```

---

# 42. AI Care Report

AI dùng API key.

Input:
- care events
- structured observations
- caregiver notes
- allowed image/document metadata

Output:
DRAFT.

Caregiver review/approve nếu policy yêu cầu.

Published:
- customer visible
- Passport
- Timeline
- Notification

---

# 43. Admin Routes

```text
/admin
/admin/users
/admin/staff
/admin/pets
/admin/inventory
/admin/services
/admin/appointments
/admin/payments
/admin/reports
/admin/analytics
/admin/audit
/admin/ai
/admin/settings
```

---

# 44. Admin Dashboard

KPI phải query DB thật.

Không hardcode charts.

---

# 45. Admin Users / Staff

Implement:

- list
- search
- pagination
- create
- role assign
- activate/deactivate

Sensitive action → audit.

---

# 46. Admin Services CRUD

Phải thao tác thật:

- create
- update
- price
- duration
- active/inactive
- required staff type

Appointment lấy price từ DB.

---

# 47. Inventory

Inventory item:

- name
- category
- batch
- expiry
- safe stock
- cost
- sell price
- quantity
- location

Inventory transaction types:

```text
STOCK_IN
STOCK_OUT
ADJUSTMENT
VACCINATION_DEDUCTION
PRESCRIPTION_DEDUCTION
DISPOSAL
```

Không update quantity trực tiếp từ nhiều nơi.

Mọi thay đổi qua inventory service.

---

# 48. Reports / Analytics

Query thật:

- revenue
- appointment status
- popular services
- pet distribution
- staff workload
- inventory alert

---

# 49. Audit Logs

Read-only.

Filter:
- actor
- action
- entity
- date

Không cho edit/delete normal UI.

---

# 50. AI Admin Center

Do ưu tiên API key, hiển thị:

- provider
- model
- reachable
- latency
- request count
- last error
- AI feature status

Không hiện API key.

Prompt test console:
admin-only + rate limit.

---

# 51. Backend API Registry

Scan FastAPI routers.

Tạo:

```text
docs/API_REGISTRY.md
```

Mỗi endpoint:

```text
Method
Path
Role
Request Schema
Response Schema
Service Function
Database Tables
Events
Frontend Consumers
Test
Status
```

Frontend không được gọi endpoint tưởng tượng.

---

# 52. Typed API Client

Tạo:

```text
web/src/lib/api/
```

Ví dụ:

```text
client.ts
auth.ts
pets.ts
appointments.ts
careSessions.ts
medicalRecords.ts
payments.ts
inventory.ts
notifications.ts
ai.ts
```

Không scatter raw fetch khắp components.

---

# 53. Authentication

Test:

- login
- logout
- refresh
- expired token
- disabled user
- role redirect

Không tạo infinite refresh loop.

---

# 54. Role Redirect

```text
ADMIN → /admin
RECEPTIONIST → /receptionist
VETERINARIAN → /veterinarian
CAREGIVER → /caregiver
CUSTOMER → /customer
```

Frontend guard = UX.

Backend authorization = security authority.

---

# 55. Realtime Architecture

Cấm realtime giả bằng:

```text
setInterval(randomData)
```

Realtime thật:

```text
Business mutation
→ DB transaction
→ outbox_events
→ publisher
→ Redis
→ WebSocket
→ authorized subscribers
→ React Query update/invalidate
```

---

# 56. Transactional Outbox

Table:

```text
outbox_events
```

Fields:

```text
id
event_type
aggregate_type
aggregate_id
payload
status
retry_count
created_at
processed_at
last_error
```

Business data + outbox event phải commit cùng transaction.

---

# 57. Realtime Event Catalog

Tạo:

```text
docs/REALTIME_EVENT_CATALOG.md
```

Events:

```text
appointment.created
appointment.confirmed
appointment.rescheduled
appointment.cancelled
appointment.checked_in

staff.assigned

care_session.created
care_session.started
care_session.updated
care_session.event_added
care_session.completed

care_report.created
care_report.published

medical_record.created
prescription.created
vaccination.created

payment.created
payment.updated
payment.confirmed

inventory.updated
inventory.low_stock
inventory.expiring

document.uploaded
document.processing
document.pending_review
document.confirmed
document.failed

notification.created

pet.updated
pet.member_added
pet.ownership_transferred
pet.lost_mode_enabled
pet.found_reported

ai.report_ready
ai.insight_ready
```

---

# 58. Event Payload Standard

```json
{
  "event_id": "uuid",
  "event_type": "appointment.confirmed",
  "entity_type": "appointment",
  "entity_id": "uuid",
  "actor_id": "uuid",
  "occurred_at": "ISO8601",
  "data": {}
}
```

Không gửi private fields không cần thiết.

---

# 59. WebSocket Authorization

Client subscribe phải authenticated.

Backend kiểm tra:

- user
- role
- pet permission
- appointment permission
- care session permission

Customer A không được subscribe session của Customer B.

---

# 60. Realtime Client Frontend

Tạo:

```text
web/src/lib/realtime/
```

Implement:

- connect
- authenticate
- reconnect
- exponential backoff
- heartbeat
- parse event
- deduplicate event_id
- cleanup
- React Query invalidate/update

---

# 61. Reconnect Consistency

WebSocket không phải source of truth.

Sau reconnect:

```text
Reconnect
→ Fetch latest DB state
→ Reconcile cache
```

---

# 62. Notification Center

Notifications từ DB.

Support:

- list
- unread count
- mark read
- mark all read
- deep link

Deep link dùng Route Registry.

---

# 63. AI Chat API

Create/verify:

```text
POST /api/v1/ai/chat
```

Backend:

```text
Auth
→ Role
→ Context Builder
→ Tool Layer
→ AI Provider API
→ Structured Validation
→ Audit
```

---

# 64. AI SQL Tool Layer

Không cho AI raw unrestricted SQL.

Tools:

```text
get_pet_summary
get_pet_passport
get_pet_vaccinations
get_pet_medications
get_pet_weight_history
get_upcoming_appointments
get_current_care_status
find_available_slots
get_staff_availability
get_admin_summary
get_inventory_summary
```

Backend permission trước query.

---

# 65. AI Router

AI không được chỉ biết RAG/PetCare.

Router:

```text
PetCare current data
→ SQL Tools

PetCare approved docs
→ RAG

General pet/general knowledge
→ AI provider model knowledge

Business action
→ backend tools

Current internet information
→ only use web/search tool if project explicitly has one
```

Không bịa current external info.

---

# 66. AI API Failure

Nếu API key hết quota/provider down:

- Core PetCare vẫn chạy.
- AI button graceful disabled/error.
- Không fake AI answer.
- Caregiver vẫn hoàn thành ca thủ công.
- Veterinarian vẫn ghi bệnh án thủ công.

---

# 67. AI Provider Health

Endpoint:

```text
GET /api/v1/ai/health
```

Return:
- provider
- model
- reachable
- latency optional
- last error sanitized

No secrets.

---

# 68. AI Care Report Schema

Validate:

```json
{
  "summary": "",
  "behavior": "",
  "observations": [],
  "recommendations": [],
  "warnings": []
}
```

Invalid output:
bounded retry hoặc manual fallback.

---

# 69. AI Health Insight Schema

```json
{
  "summary": "",
  "trends": [],
  "attention_items": [],
  "follow_up_suggested": false
}
```

Không có automatic final diagnosis field.

---

# 70. MinIO

Upload phải validate:

- permission
- MIME
- extension
- max size
- object key
- DB metadata

Không expose secret.

Use signed URL nếu phù hợp.

---

# 71. Celery Tasks

Audit/implement:

```text
generate_smart_reminders
process_ai_document
generate_care_report
publish_outbox_events
```

Tasks idempotent khi retry.

---

# 72. Smart Reminder

Nguồn:

- vaccine
- medication
- appointment

Prevent duplicate.

Rule ở backend/config.

Không hardcode frontend.

---

# 73. Inventory Idempotency

Vaccination/prescription deduction:

- transaction
- idempotency key
- no double deduction
- no negative stock unless explicit policy
- audit
- low stock event

---

# 74. Telehealth Verification

Test bằng 2 browser/session.

Verify:

- signaling
- offer
- answer
- ICE
- remote stream
- mic toggle
- camera toggle
- reconnect/disconnect
- doctor save note to DB

Không claim working nếu chỉ cùng một local state.

---

# 75. UI/UX Completeness

Mỗi page quan trọng phải có:

- title
- breadcrumb nếu cần
- loading
- empty
- error
- permission denied
- success
- disabled state
- confirmation dialog

Không dùng browser `alert()` cho UX thường.

---

# 76. Forms

Use project stack, ưu tiên:

- React Hook Form
- Zod

Must:
- client validation
- server validation
- prevent double submit
- loading state
- backend error

---

# 77. Tables

Staff/Admin:

- pagination
- search
- filter
- sort nếu cần
- empty
- loading
- row action

Large dataset → backend pagination.

---

# 78. Error Handling

Frontend handle:

```text
400
401
403
404
409
422
429
500
503
```

Message phải phù hợp.

---

# 79. 404 Elimination

Audit toàn bộ navigation.

Không fix 404 bằng page placeholder.

Nếu route đúng nhưng thiếu:
implement.

Nếu link sai:
fix canonical link.

Nếu route legacy:
redirect.

---

# 80. Database Migration

Use Alembic.

Run:

```bash
alembic upgrade head
```

Test clean DB.

Không dùng `create_all()` thay production migration.

---

# 81. Development Seed

Seed realistic:

```text
admin@petcare.local
reception@petcare.local
doctor@petcare.local
caregiver@petcare.local
customer@petcare.local
```

Seed:
- roles
- services
- staff
- pets
- appointments
- care sessions
- vaccinations
- prescriptions
- inventory
- notifications
- payments

Label DEVELOPMENT ONLY.

---

# 82. Customer E2E

Phải test thật:

```text
Login
→ Create Pet
→ Open Passport
→ Book Appointment
→ Receptionist sees it
→ Receptionist confirms
→ Customer sees confirmation realtime
→ Staff assigned
→ Customer sees staff
→ Check-in
→ Staff starts care
→ Customer sees live update
→ Care completed
→ Care Report
→ Timeline updates
→ Passport updates
→ Notification visible
```

Reload ở các bước quan trọng.

---

# 83. Receptionist E2E

```text
Login
→ See booking
→ Confirm
→ Assign Staff
→ Customer sees assignment
→ Check-in
→ Staff sees assignment
→ Payment persisted
```

---

# 84. Veterinarian E2E

```text
Customer books consultation
→ Reception confirms
→ Assign veterinarian
→ Open patient
→ Create medical record
→ Create prescription
→ Inventory deducts once
→ Customer sees allowed update
→ Passport updated
→ Timeline updated
→ Notification
```

---

# 85. Caregiver E2E

```text
Assigned grooming
→ Open session
→ Start
→ Add status
→ Add photo
→ Add vitals
→ Customer sees realtime
→ Complete
→ AI Care Report
→ Customer receives report
```

---

# 86. Emergency QR E2E

```text
Enable QR
→ Open incognito
→ Verify public fields only
→ Enable Lost Mode
→ Submit finder report
→ Owner notification
→ Audit log
```

---

# 87. OCR E2E

```text
Upload
→ PROCESSING
→ AI API
→ PENDING_REVIEW
→ Confirm
→ trusted record
→ Passport
→ Reminder
```

---

# 88. Security Tests

Must verify:

```text
Customer A cannot read Customer B pet
Caregiver cannot read unassigned pet
Receptionist cannot perform admin-only actions
Customer cannot create veterinarian prescription
Caregiver cannot create diagnosis
Disabled user cannot login/refresh
Public QR cannot read private medical data
Unauthorized WebSocket subscription rejected
```

---

# 89. Backend Tests

Run pytest.

Cover critical:

- auth
- refresh
- RBAC
- ownership
- pet
- appointment state machine
- schedule conflicts
- assignment
- care session
- medical record
- prescription
- inventory idempotency
- vaccination
- payment
- QR privacy
- lost mode
- notifications
- AI provider
- AI fallback
- OCR confirm
- outbox
- WebSocket authorization where practical

---

# 90. Frontend Validation

Run:

```bash
npm run lint
npm run typecheck
npm run build
```

Fix critical errors.

Nếu Playwright/Cypress có:
run E2E.

Nếu chưa có và khả thi:
thêm Playwright cho critical flows.

---

# 91. Docker Validation

Verify:

```text
petcare_backend
petcare_db
petcare_redis
petcare_minio
petcare_worker
```

Check health.

Không claim stable chỉ vì container không exit.

---

# 92. Click Audit

Scan UI tìm:

- button không có handler
- handler chỉ console.log
- fake toast
- modal submit không call API
- hardcoded tables
- hardcoded charts
- invalid href
- dynamic ID hardcode
- dropdown không persist

Create:

```text
docs/INTERACTION_AUDIT.md
```

---

# 93. Feature Matrix

Create:

```text
docs/FEATURE_MATRIX.md
```

Columns:

```text
Feature
Role
Route
API
DB
Realtime
Test
Status
Evidence
```

Không mark COMPLETE nếu thiếu evidence.

---

# 94. Route Action Matrix

Create:

```text
docs/ROUTE_ACTION_MATRIX.md
```

Mỗi page ghi tất cả action.

Ví dụ:

```text
/customer/appointments/[id]

View → GET ...
Cancel → POST/PATCH ...
Pay → POST ...
Live Care → WS ...
Telehealth → WebRTC route
```

Mục tiêu:
mọi nút trên UI đều map tới backend hoặc navigation hợp lệ.

---

# 95. External Dependencies

Không fake các tính năng chưa có phần cứng/merchant:

```text
MoMo/VNPay production
GPS 4G collar
Thermal printer auto-cut
RFID scanner
PKI digital signature
e-Invoice production
AI radiology model
RTSP 24/7 cameras
Multi-branch production
```

Nếu dependency chưa có:
status = `BLOCKED_EXTERNAL` hoặc `V2`.

Không dựng UI rồi tuyên bố hoàn thành.

---

# 96. PROJECT_STATUS.md

Update liên tục:

```text
Overall Status
Frontend
Backend
Database
Realtime
AI API Provider
Payments
Telehealth
Inventory
Documents
Tests
Known Issues
Blocked External
Next Exact Task
```

---

# 97. Development Phases

Không dừng giữa phase để hỏi.

## Phase 0
Audit repository.

## Phase 1
Route/API/Feature Registry.

## Phase 2
Auth + role routing + guards.

## Phase 3
Customer functions.

## Phase 4
Receptionist functions.

## Phase 5
Veterinarian functions.

## Phase 6
Caregiver functions.

## Phase 7
Admin functions.

## Phase 8
Realtime + Outbox + Notifications.

## Phase 9
AI API Key integration.

## Phase 10
Payment/Inventory/Documents consistency.

## Phase 11
Telehealth validation.

## Phase 12
Cross-role E2E.

## Phase 13
Security + tests + build.

## Phase 14
Documentation + final verification.

---

# 98. Sau mỗi Phase

1. Run relevant tests.
2. Fix failures.
3. Update PROJECT_STATUS.
4. Update FEATURE_MATRIX.
5. Continue automatically.

---

# 99. Failure Recovery

Khi command fail:

1. Read useful error.
2. Identify root cause.
3. Fix.
4. Re-run smallest relevant check.
5. Continue.

Không chạy lặp cùng command nếu chưa thay đổi gì.

---

# 100. No Fake Success

Không được nói:

```text
Done
Complete
Working
Passed
```

nếu chưa có evidence.

Evidence:

- test pass
- API response
- DB persistence
- frontend build
- WebSocket verified
- two-browser WebRTC
- E2E result

---

# 101. Final Acceptance Gate

Chỉ được gọi hệ thống hoàn chỉnh khi:

```text
Frontend starts
Backend starts
PostgreSQL works
Redis works
MinIO works
Worker works
Migrations pass
Seed pass
All roles login
Role redirects work
Backend RBAC works
No critical 404
No core fake/static interactions
Customer E2E pass
Receptionist E2E pass
Veterinarian E2E pass
Caregiver E2E pass
Admin core flows pass
Realtime cross-role verified
Payment persists
Inventory persists
OCR workflow verified
AI API provider verified
AI failure fallback verified
Telehealth verified or honestly marked blocked
Frontend lint/typecheck/build pass
Backend critical tests pass
README accurate
```

---

# 102. Final Verification Report

Create:

```text
docs/FINAL_SYSTEM_VERIFICATION.md
```

Include:

```text
WORKING FEATURES
PARTIAL FEATURES
BROKEN FEATURES
BLOCKED EXTERNAL FEATURES
ROUTES TESTED
APIS TESTED
REALTIME EVENTS VERIFIED
AI PROVIDER STATUS
DATABASE/MIGRATION STATUS
TEST COMMANDS
ACTUAL TEST RESULTS
KNOWN ISSUES
```

---

# 103. Final Runbook

README phải có chính xác:

```text
clone
copy .env.example .env
fill AI API key
docker compose up -d
alembic upgrade head
seed database
start backend if not containerized
start frontend
login demo accounts
```

Thêm command Windows nếu cần.

---

# 104. Final Principle

Mục tiêu không phải tạo nhiều page.

Mục tiêu là tạo một **hệ thống PetCare thống nhất**.

Chỉ có một nguồn dữ liệu thật.

Ví dụ:

```text
Customer tạo Appointment
→ PostgreSQL
→ Receptionist nhận realtime
→ Receptionist Confirm
→ Customer nhận realtime
→ Staff được assign
→ Staff nhận realtime
→ Check-in
→ Care/Medical workflow
→ Customer theo dõi
→ Payment
→ Timeline
→ Passport
→ Notification
→ Admin analytics
```

Mọi vai trò phải được nối với nhau bằng dữ liệu thật.

AI dùng API Key qua Backend.

AI không được truy cập DB trực tiếp.

AI không được tự bịa trạng thái hệ thống.

Không tạo chức năng “chỉ để nhìn”.

---

# 105. START NOW

Đọc code hiện tại trước.

Không rebuild mù quáng.

Không dừng ở architecture.

Không hỏi:

> Should I continue?

Hãy tự động:

```text
AUDIT
→ FIX ROUTES
→ FIX APIS
→ FIX DB
→ FIX REALTIME
→ FIX INTERACTIONS
→ CONNECT ROLES
→ CONNECT AI API
→ TEST
→ FIX
→ RETEST
→ VERIFY
→ DOCUMENT
```

Tiếp tục cho đến khi đạt Acceptance Gate hoặc gặp dependency external thực sự không thể vượt qua.

Nếu gặp dependency external:
ghi rõ `BLOCKED_EXTERNAL`, hoàn thiện toàn bộ phần còn lại và tiếp tục.
