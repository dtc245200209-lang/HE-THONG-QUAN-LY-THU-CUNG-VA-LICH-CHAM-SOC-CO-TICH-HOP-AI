# PETCARE AI — FINAL COMPLETION + RELEASE VERIFICATION + ROLE TESTER MASTER PROMPT

> Mục tiêu: Ép Agent hoàn thiện toàn bộ các hạng mục còn thiếu của PetCare AI, sau đó chuyển sang chế độ **Release Tester / QA Auditor** để kiểm tra toàn bộ chức năng theo từng vai trò. Không được tự đánh dấu hoàn thành nếu chưa có bằng chứng runtime. Mọi tiêu chí phải được chấm `PASS` hoặc `FAIL`.

---

# 0. VAI TRÒ CỦA AGENT

Trong nhiệm vụ này, bạn phải hoạt động theo **2 giai đoạn bắt buộc**:

## GIAI ĐOẠN A — COMPLETION ENGINEER

Bạn là:

- Senior Software Architect
- Senior Next.js Engineer
- Senior FastAPI Engineer
- PostgreSQL Engineer
- Realtime/WebSocket Engineer
- AI Integration Engineer
- DevOps Engineer
- Security Engineer

Nhiệm vụ:
- đọc toàn bộ repository hiện tại
- đối chiếu Master Prompt
- tìm tất cả phần còn thiếu / giả / tĩnh / chưa nối
- hoàn thiện chúng
- sửa lỗi
- chạy test
- không dừng cho đến khi đạt điều kiện chuyển sang QA

## GIAI ĐOẠN B — INDEPENDENT RELEASE TESTER

Sau khi Giai đoạn A kết thúc, **không được tiếp tục tự tin tuyên bố hệ thống hoàn chỉnh**.

Bạn phải đổi vai trò thành:

- Release QA Engineer
- E2E Tester
- Security Tester
- Realtime Integration Tester
- Role Permission Tester
- Regression Tester

Sau đó kiểm tra toàn bộ hệ thống như một tester độc lập.

---

# 1. NGUYÊN TẮC KHÔNG ĐƯỢC VI PHẠM

## 1.1. CẤM FAKE PASS

Không được chấm PASS chỉ vì:

- page tồn tại
- route trả HTTP 200
- TypeScript compile
- Python compile
- container đang chạy
- button nhìn thấy
- modal mở được
- API file tồn tại
- WebSocket class tồn tại
- documentation nói "working"

PASS chỉ được ghi khi hành vi thực tế được kiểm tra.

---

## 1.2. PASS PHẢI CÓ EVIDENCE

Mỗi PASS phải có ít nhất một bằng chứng phù hợp:

```text
API response
DB persisted row
E2E interaction
WebSocket event
Role access result
Screenshot/log reference
Test case result
Build result
Migration result
Reload persistence
Cross-role visibility
```

Nếu không có evidence:

```text
FAIL
```

hoặc:

```text
NOT VERIFIED
```

Nhưng bảng cuối cùng chỉ được dùng:

```text
PASS
FAIL
BLOCKED_EXTERNAL
```

`NOT VERIFIED` phải được xử lý tiếp cho đến khi thành PASS hoặc FAIL.

---

# 2. ĐỌC CÁC TÀI LIỆU HIỆN TẠI

Bắt buộc đọc:

```text
README.md
PROJECT_STATUS.md
docs/CURRENT_IMPLEMENTATION_AUDIT.md
docs/ROUTE_REGISTRY.md
docs/API_REGISTRY.md
docs/REALTIME_EVENT_CATALOG.md
docs/INTERACTION_AUDIT.md
docs/FEATURE_MATRIX.md
docs/ROUTE_ACTION_MATRIX.md
docs/FINAL_SYSTEM_VERIFICATION.md
```

Nếu file thiếu:
tạo file.

Không tin tuyệt đối trạng thái cũ.

Phải re-verify.

---

# 3. TẠO FILE THEO DÕI RELEASE

Tạo:

```text
docs/RELEASE_VERIFICATION_MATRIX.md
```

Đây là file quan trọng nhất.

Mỗi tiêu chí phải có:

```text
ID
Role
Feature
Route
API
Database
Realtime
Test Method
Expected
Actual
Evidence
Status
Notes
```

Status:

```text
PASS
FAIL
BLOCKED_EXTERNAL
```

---

# 4. KHÔNG ĐƯỢC DỪNG Ở AUDIT

Flow bắt buộc:

```text
AUDIT
→ FIND FAILURE
→ FIX
→ RUN TEST
→ IF FAIL → FIX AGAIN
→ IF PASS → RECORD EVIDENCE
→ CONTINUE
```

Không hỏi:

```text
Should I continue?
Do you want me to fix this?
```

Tự động tiếp tục.

---

# 5. ĐIỀU KIỆN CHUYỂN TỪ COMPLETION SANG TESTER

Chỉ chuyển sang Tester khi:

```text
Backend starts
Frontend starts
PostgreSQL reachable
Redis reachable
MinIO reachable
Worker reachable
Migrations successful
Seed successful
Login all roles successful
No critical build error
No critical 404
AI provider configured or clearly unavailable
```

Nếu chưa đạt:
tiếp tục sửa.

---

# 6. AI PHẢI DÙNG API KEY THẬT NẾU ĐÃ ĐƯỢC CẤU HÌNH

Ưu tiên:

```text
AI_PROVIDER=gemini
```

hoặc provider API hiện có.

Nếu `.env` có API key thật:
test API thật.

Không được chấm AI PASS nếu:

```text
provider=mock
```

trừ test fallback.

Phải tách:

```text
AI_REAL_PROVIDER
AI_FALLBACK_PROVIDER
```

Test cả hai.

---

# 7. CẤM OLLAMA LÀ BLOCKER

Ollama không bắt buộc.

Nếu:

```text
OLLAMA_ENABLED=false
```

thì không được đánh FAIL hệ thống chỉ vì Ollama không chạy.

Core AI dùng API key.

---

# 8. BẮT BUỘC AUDIT TẤT CẢ INTERACTION

Scan frontend tìm:

```text
button
form
modal
dropdown
table action
quick action
Link
router.push
router.replace
```

Flag nếu:

- không có handler
- handler chỉ `console.log`
- chỉ đổi local state
- fake `setTimeout`
- fake `toast.success`
- hardcoded response
- fake data
- route không tồn tại
- API không tồn tại
- API không persist

Fix tất cả core functionality.

---

# 9. FRONTEND BUILD VERIFICATION

Bắt buộc chạy:

```bash
npm run lint
npm run typecheck
npm run build
```

Nếu script không tồn tại:
dùng command tương đương.

Không chấp nhận chỉ:

```bash
npx tsc --noEmit
```

---

# 10. BACKEND VERIFICATION

Bắt buộc chạy:

```bash
pytest
```

Nếu test suite còn thiếu:
thêm test cho critical flows.

Python compile không thay thế pytest.

---

# 11. DATABASE CLEAN TEST

Tạo môi trường test/dev sạch.

Run:

```text
Empty Database
→ alembic upgrade head
→ seed
→ backend start
```

PASS chỉ khi migration chạy thành công từ DB sạch.

---

# 12. DEMO ACCOUNTS

Verify login thật:

```text
admin@petcare.local
reception@petcare.local
doctor@petcare.local
caregiver@petcare.local
customer@petcare.local
```

Nếu seed dùng credential khác:
ghi credential development đúng vào README.

Không expose production secret.

---

# 13. ROLE TESTER — CUSTOMER

Tester phải đăng nhập Customer và test từng mục.

## CUSTOMER-01 Login

Expected:

```text
login success
redirect /customer
```

## CUSTOMER-02 Dashboard

- dữ liệu load từ backend
- không hardcode

## CUSTOMER-03 Create Pet

```text
Create
→ API
→ DB
→ pet visible
→ reload vẫn tồn tại
```

## CUSTOMER-04 Edit Pet

- edit
- reload
- persisted

## CUSTOMER-05 Pet Passport

Kiểm tra:

- identity
- vaccination
- medication
- medical history
- weight
- care history

Data thật.

## CUSTOMER-06 Weight

- add record
- chart update
- reload persist

## CUSTOMER-07 Vaccination Read

- hiển thị đúng record từ DB

## CUSTOMER-08 Medication Read

- hiển thị record thật

## CUSTOMER-09 Timeline

- event mới xuất hiện đúng sau nghiệp vụ

## CUSTOMER-10 Documents

- upload file
- MinIO object tồn tại
- DB row tồn tại

## CUSTOMER-11 AI OCR

```text
Upload
→ PROCESSING
→ AI API
→ PENDING_REVIEW
→ confirm
→ trusted record
```

Nếu API provider thật unavailable:
FAIL hoặc BLOCKED_EXTERNAL theo nguyên nhân.

## CUSTOMER-12 Emergency QR

- token public
- incognito access
- private data hidden

## CUSTOMER-13 Lost Pet Mode

- enable
- public page changes
- found report
- owner notification

## CUSTOMER-14 Family Sharing

- add member
- role
- permission
- removal

## CUSTOMER-15 Ownership Transfer

- transfer
- DB transaction
- audit log

## CUSTOMER-16 Appointment Booking

- choose pet
- service
- slot
- submit
- DB row
- receptionist receives

## CUSTOMER-17 Cancel Appointment

- business rule enforced

## CUSTOMER-18 Payment

- payment row
- amount correct
- state correct

## CUSTOMER-19 Live Care

- receives actual WebSocket events
- no refresh

## CUSTOMER-20 Care Report

- final report visible
- Passport/timeline updated

## CUSTOMER-21 Telehealth

- joins actual WebRTC room

## CUSTOMER-22 AI Chat

- real provider if key configured
- pet-context query works
- unauthorized data not leaked

## CUSTOMER-23 Notifications

- unread
- read
- deep link

## CUSTOMER-24 Profile

- update
- persisted

---

# 14. ROLE TESTER — RECEPTIONIST

## RECEPTION-01 Login

Redirect:

```text
/receptionist
```

## RECEPTION-02 Dashboard

Backend data.

## RECEPTION-03 Create Walk-in Customer

- DB persisted
- CUSTOMER role
- new customer searchable

## RECEPTION-04 Customer Search

- search backend

## RECEPTION-05 Pet Search

- backend data

## RECEPTION-06 Appointment List

- data from DB

## RECEPTION-07 Confirm Appointment

- valid state transition
- customer realtime update

## RECEPTION-08 Assign Caregiver

- availability check
- conflict prevention
- caregiver sees task

## RECEPTION-09 Assign Veterinarian

- role check
- conflict prevention
- veterinarian sees patient

## RECEPTION-10 Check-in

- status changed
- staff realtime
- customer realtime

## RECEPTION-11 Reschedule

Nếu feature có:
- persist
- notify

## RECEPTION-12 Service Catalog

- DB pricing

## RECEPTION-13 Payment Creation

- payment record

## RECEPTION-14 CASH Payment

- confirm
- audit

## RECEPTION-15 Bank/VietQR

- correct amount/reference

## RECEPTION-16 Staff Availability

- real schedules

## RECEPTION-17 Notification

- operational notifications

## RECEPTION-18 Security

Must fail:

```text
admin-only action
```

Expected:

```text
403
```

---

# 15. ROLE TESTER — VETERINARIAN / BÁC SĨ

## VET-01 Login

Redirect:

```text
/veterinarian
```

## VET-02 Dashboard

Real patient appointments.

## VET-03 Patient Access

Assigned/allowed patient accessible.

Unauthorized patient denied.

## VET-04 Medical History

Real DB.

## VET-05 Create Medical Record

- persisted
- timeline updated
- customer allowed view updated

## VET-06 Diagnosis

- stored in medical record

## VET-07 Treatment Plan

- persisted

## VET-08 Prescription

- multiple items
- persisted

## VET-09 Inventory Deduction

- stock decreased exactly once
- transaction log exists

## VET-10 Retry Idempotency

Retry prescription/vaccine request:
must not deduct stock twice.

## VET-11 Vaccination

- persisted
- batch
- next due
- reminder

## VET-12 Inventory View

Real stock.

## VET-13 Documents

Real storage/retrieval.

## VET-14 AI Medical Summary

API provider result based on authorized context.

## VET-15 AI Health Insight

Structured output valid.

## VET-16 Telehealth

Test with Customer browser.

## VET-17 Save Telehealth Note

DB persisted.

## VET-18 Schedule

Real appointments.

## VET-19 Notifications

Working.

## VET-20 Security

Must NOT access admin operations.

---

# 16. ROLE TESTER — CAREGIVER

Mặc dù trọng tâm người dùng yêu cầu Admin/Bác sĩ/Lễ tân/Chủ thú cưng, Caregiver là thành phần bắt buộc của cross-role workflow nên phải test.

## CARE-01 Login

## CARE-02 Schedule

Real assignments.

## CARE-03 Assigned Pet Authorization

Unassigned pet → 403.

## CARE-04 Start Session

State transition valid.

## CARE-05 Status Event

Persist + realtime.

## CARE-06 Photo

Upload MinIO.

## CARE-07 Vitals

Persist real values.

## CARE-08 Activity Log

Persist.

## CARE-09 Customer Realtime

Customer sees updates.

## CARE-10 Complete Session

Persist.

## CARE-11 AI Care Report

Real AI provider if configured.

## CARE-12 Publish Report

Customer sees report.

## CARE-13 Passport Timeline

Updated.

## CARE-14 Notification

Customer notified.

## CARE-15 Medical Restriction

Caregiver cannot create diagnosis/prescription.

Expected 403.

---

# 17. ROLE TESTER — ADMIN

## ADMIN-01 Login

Redirect:

```text
/admin
```

## ADMIN-02 Dashboard KPI

Query DB.

## ADMIN-03 Users

List/search/paginate.

## ADMIN-04 Create User

Persist.

## ADMIN-05 Role Assignment

Persist + audit.

## ADMIN-06 Activate/Deactivate

Disabled user must lose access.

## ADMIN-07 Staff

Real staff.

## ADMIN-08 Pets

Real pet database.

## ADMIN-09 Services CRUD

Create/update/activate.

Customer appointment uses updated service.

## ADMIN-10 Appointments

Real system appointments.

## ADMIN-11 Payments

Real payment ledger.

## ADMIN-12 Inventory CRUD

Persist.

## ADMIN-13 Stock In

Inventory transaction + quantity.

## ADMIN-14 Stock Out

Transaction + quantity.

## ADMIN-15 Low Stock

Alert logic.

## ADMIN-16 Expiry

Expiry logic.

## ADMIN-17 Reports

Real DB aggregation.

## ADMIN-18 Analytics

No hardcoded chart data.

## ADMIN-19 Audit Logs

Real security/business events.

## ADMIN-20 AI Control Center

- real provider state
- model
- latency
- no key leak

## ADMIN-21 AI Test Prompt

Real provider call if key configured.

## ADMIN-22 Settings

Persist config if designed persistent.

## ADMIN-23 Security

Audit sensitive operations.

---

# 18. CROSS-ROLE TEST — APPOINTMENT

Must execute:

```text
Customer creates appointment
→ Receptionist receives it
→ Receptionist confirms
→ Customer sees CONFIRMED realtime
→ Receptionist assigns staff
→ Staff receives assignment
→ Receptionist checks in
→ Customer sees CHECKED_IN
→ Staff sees ready workflow
```

If any link fails:
FAIL.

---

# 19. CROSS-ROLE TEST — CARE

```text
Caregiver starts
→ Customer sees STARTED

Caregiver uploads photo
→ Customer sees photo

Caregiver adds vitals
→ Customer sees update

Caregiver completes
→ Customer sees COMPLETED

AI report
→ Customer sees report

Timeline
→ updated
```

---

# 20. CROSS-ROLE TEST — VETERINARY

```text
Customer books consult
→ Reception confirms
→ Vet assigned
→ Vet sees patient
→ Vet creates EMR
→ Vet prescribes
→ Inventory deduction
→ Customer Passport updated
→ Timeline updated
→ Notification
```

---

# 21. CROSS-ROLE TEST — PAYMENT

```text
Appointment
→ Payment created
→ Correct amount
→ Payment confirmed
→ Admin ledger updates
→ Customer sees current status
```

No fake state.

---

# 22. CROSS-ROLE TEST — LOST PET

```text
Owner Lost Mode ON
→ Public QR reflects lost mode
→ Finder submits report
→ Owner receives notification
→ Admin audit event exists if designed
```

---

# 23. CROSS-ROLE TEST — DOCUMENT OCR

```text
Customer uploads
→ MinIO
→ Worker
→ AI provider
→ Pending Review
→ Confirm
→ Domain record
→ Passport
→ Reminder
```

---

# 24. REALTIME TEST REQUIREMENTS

For every realtime test record:

```text
Publisher action
Event Type
event_id
Recipient Role
Recipient Session
Received?
Latency
UI Updated?
Reload DB state correct?
```

Must test disconnect/reconnect at least once.

---

# 25. WEBSOCKET SECURITY TEST

Attempt unauthorized subscribe.

Expected:

```text
Denied/closed
```

If user can subscribe other customer/session:
FAIL CRITICAL.

---

# 26. AI TEST REQUIREMENTS

Test:

```text
GET /api/v1/ai/health
```

PASS for real AI only when:

```text
provider != mock
reachable = true
actual model configured
```

Test fallback separately:

```text
remove/disable API key
→ app still boots
→ AI unavailable/fallback handled
```

---

# 27. AI PET CONTEXT TEST

Customer asks:

```text
"Milo có lịch gì?"
```

Expected:
- data matches DB.

Change appointment in DB through app.

Ask again.

Expected:
- updated answer.

If AI uses stale/hallucinated value:
FAIL.

---

# 28. AI AUTHORIZATION TEST

Customer A asks about Customer B's pet.

Expected:

```text
Denied / not accessible
```

No leaked record.

---

# 29. ROUTE TEST

Test every canonical route.

Record:

```text
URL
Role
HTTP/UI Result
Expected
Status
```

No core 404.

---

# 30. DYNAMIC ROUTE TEST

Use real UUID from DB.

Test:

```text
pet/[id]
appointments/[id]
sessions/[id]
patients/[id]
telehealth/[id]
emergency/[token]
```

No hardcoded `1`.

---

# 31. API TEST

Every core API in `docs/API_REGISTRY.md` must be tested.

At minimum:
- authenticated success
- invalid data
- unauthorized role
- not found
- conflict where relevant

---

# 32. UI STATE TEST

Every major page must have:

```text
loading
empty
error
success
permission denied
```

If blank crash:
FAIL.

---

# 33. PAYMENT EXTERNAL LIMITATION

MoMo/VNPay production credentials unavailable:

```text
BLOCKED_EXTERNAL
```

Sandbox may be PASS as sandbox only.

Do not call it production PASS.

---

# 34. HARDWARE FEATURES

These can be:

```text
BLOCKED_EXTERNAL
```

if hardware unavailable:

- GPS 4G collar
- RFID scanner
- thermal printer auto-cut
- RTSP cameras
- PKI token

They must not cause core release FAIL unless defined core.

---

# 35. RELEASE SEVERITY

Failures classified:

```text
CRITICAL
HIGH
MEDIUM
LOW
```

CRITICAL examples:

- authorization bypass
- DB corruption
- payment incorrect
- double stock deduction
- cross-user data leak
- core login failure

HIGH:
- appointment flow broken
- care realtime broken
- medical record cannot save

MEDIUM:
- report filter broken
- notification deep link broken

LOW:
- visual spacing
- minor copy issue

---

# 36. BUG FIX LOOP

Tester discovers bug:

```text
FAIL
→ create bug entry
→ switch temporarily to Engineer
→ fix
→ regression test
→ tester retest
→ PASS/FAIL
```

Do not leave fix unverified.

---

# 37. BUG LOG

Create:

```text
docs/RELEASE_BUG_LOG.md
```

Columns:

```text
Bug ID
Severity
Role
Feature
Steps
Expected
Actual
Root Cause
Fix
Retest
Status
```

---

# 38. FINAL PASS/FAIL TABLE

At the end create:

```text
docs/FINAL_PASS_FAIL_SCORECARD.md
```

Required table:

| ID | Role | Feature | Route | API | DB | Realtime | Security | Evidence | Result |
|---|---|---|---|---|---|---|---|---|---|
| CUSTOMER-01 | Customer | Login | /login | /auth/token | users | N/A | PASS | ... | PASS |
| ... | ... | ... | ... | ... | ... | ... | ... | ... | PASS/FAIL |

Every row MUST have:

```text
PASS
FAIL
BLOCKED_EXTERNAL
```

No blank values.

---

# 39. ROLE SUMMARY TABLE

At end include:

| Role | Total Tests | PASS | FAIL | BLOCKED | Completion % |
|---|---:|---:|---:|---:|---:|
| Customer | | | | | |
| Receptionist | | | | | |
| Veterinarian | | | | | |
| Caregiver | | | | | |
| Admin | | | | | |

Completion formula:

```text
PASS / (PASS + FAIL) * 100
```

BLOCKED_EXTERNAL excluded from denominator.

---

# 40. SYSTEM SUMMARY TABLE

| Domain | PASS | FAIL | BLOCKED | Status |
|---|---:|---:|---:|---|
| Frontend Routes | | | | |
| Backend API | | | | |
| Database | | | | |
| Auth/RBAC | | | | |
| Customer | | | | |
| Receptionist | | | | |
| Veterinarian | | | | |
| Caregiver | | | | |
| Admin | | | | |
| Realtime | | | | |
| AI | | | | |
| Payment | | | | |
| Inventory | | | | |
| Documents/OCR | | | | |
| Telehealth | | | | |
| Security | | | | |
| Docker | | | | |
| Tests/Build | | | | |

---

# 41. RELEASE DECISION

Use exact logic:

## RELEASE_CANDIDATE

Only if:

```text
0 CRITICAL FAIL
0 HIGH FAIL
All core role flows PASS
Auth/RBAC PASS
Cross-role Appointment PASS
Cross-role Care PASS
Veterinary flow PASS
Database clean migration PASS
Frontend production build PASS
Backend critical tests PASS
Realtime core PASS
```

## NOT_RELEASE_CANDIDATE

If any required condition fails.

Do not use subjective judgment.

---

# 42. AI RELEASE CONDITION

If API key is configured:

AI core features must use real provider.

If:

```text
provider=mock
```

then:

```text
AI_REAL_PROVIDER = FAIL
```

Mock fallback may separately PASS.

---

# 43. TEST COMMAND EVIDENCE

Final report must include actual commands executed:

```text
docker compose ...
alembic ...
pytest ...
npm ...
HTTP/API tests ...
```

And actual results.

Do not invent output.

---

# 44. CLEAN START TEST

Final run:

```text
stop stack
clean test database/volumes as appropriate
start infrastructure
migrate
seed
start backend
start frontend
run smoke tests
```

Be careful not to destroy real user data.

Use development/test environment only.

---

# 45. REGRESSION

After last bug fix, rerun:

```text
Auth
Appointment
Care
Medical
Payment
Inventory
Realtime
AI
```

Do not assume previous PASS remains valid after code changes.

---

# 46. FINAL FILES REQUIRED

Before finishing, these files must exist:

```text
PROJECT_STATUS.md

docs/CURRENT_IMPLEMENTATION_AUDIT.md
docs/ROUTE_REGISTRY.md
docs/API_REGISTRY.md
docs/REALTIME_EVENT_CATALOG.md
docs/INTERACTION_AUDIT.md
docs/FEATURE_MATRIX.md
docs/ROUTE_ACTION_MATRIX.md

docs/RELEASE_VERIFICATION_MATRIX.md
docs/RELEASE_BUG_LOG.md
docs/FINAL_PASS_FAIL_SCORECARD.md
docs/FINAL_SYSTEM_VERIFICATION.md
```

---

# 47. FINAL_SYSTEM_VERIFICATION FORMAT

Must contain:

```text
FINAL_STATUS =
RELEASE_CANDIDATE
or
NOT_RELEASE_CANDIDATE
```

Then:

```text
Critical Failures
High Failures
Medium Failures
Low Failures
Blocked External
Total Tests
Total PASS
Total FAIL
PASS Rate
```

---

# 48. KHÔNG ĐƯỢC TỰ HỢP THỨC HÓA LỖI

Không được biến:

```text
"chưa test"
```

thành PASS.

Không được biến:

```text
"code có vẻ đúng"
```

thành PASS.

Không được biến:

```text
"route tồn tại"
```

thành PASS functionality.

Không được biến:

```text
"mock trả lời"
```

thành PASS AI production.

---

# 49. KHÔNG ĐƯỢC DỪNG SỚM

Nếu tester phát hiện FAIL mà có thể sửa trong repository:

```text
phải sửa
→ retest
```

Không chỉ ghi FAIL rồi dừng.

Chỉ để FAIL cuối cùng khi:
- không thể sửa trong môi trường hiện tại
- thiếu dependency không thay thế được
- hoặc phát hiện vấn đề cần quyết định con người

---

# 50. START NOW

Bắt đầu:

```text
1. Read repository
2. Read audit docs
3. Complete missing implementation
4. Run build/test
5. Enter Tester Mode
6. Login every role
7. Test every feature
8. Test cross-role realtime
9. Test permissions
10. Fix all fixable failures
11. Retest
12. Generate PASS/FAIL scorecard
13. Make deterministic release decision
```

Không hỏi:

```text
Should I continue?
```

Không dừng sau khi viết báo cáo.

Chỉ hoàn thành nhiệm vụ sau khi:

- mọi chức năng core đã được test
- bảng PASS/FAIL đầy đủ
- mọi FAIL sửa được đã được sửa và retest
- release decision được tạo bằng tiêu chí ở trên

---

# 51. FINAL USER-FACING RESPONSE

Khi kết thúc, chỉ báo cáo ngắn gọn:

```text
FINAL_STATUS
Total tests
PASS
FAIL
BLOCKED_EXTERNAL
Critical failures
High failures
Scorecard path
Bug log path
Verification report path
```

Không nói "hoàn thành 100%" nếu scorecard còn FAIL.
