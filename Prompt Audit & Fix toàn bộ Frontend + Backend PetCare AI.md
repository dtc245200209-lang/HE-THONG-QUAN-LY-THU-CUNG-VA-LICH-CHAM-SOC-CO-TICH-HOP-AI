Audit và hoàn thiện toàn bộ project PetCare AI hiện tại ở cả FRONTEND và BACKEND.

Mục tiêu:

Mọi menu, button, page và chức năng trong UI phải:
- không còn 404
- không còn page rỗng
- không còn button không hoạt động
- không dùng fake data cho chức năng production
- frontend phải kết nối backend thật
- backend phải kết nối PostgreSQL thật
- realtime phải hoạt động thật
- role permission phải hoạt động thật

Không chỉ sửa giao diện.

Không chỉ sửa route.

Phải sửa end-to-end.

# 1. FRONTEND AUDIT

Scan toàn bộ:

web/src/app

web/src/components

web/src/features

web/src/lib

Kiểm tra tất cả:

Link href

router.push()

router.replace()

redirect()

Sidebar menu

Top navigation

Dashboard cards

Quick actions

Table actions

Buttons

Breadcrumb

Notification navigation

Pet links

Appointment links

Patient links

Care session links

# 2. ROUTE AUDIT

Kiểm tra đầy đủ:

CUSTOMER

/customer
/customer/pets
/customer/pets/[id]
/customer/pets/[id]/passport
/customer/pets/[id]/timeline
/customer/pets/[id]/documents
/customer/pets/[id]/emergency
/customer/appointments
/customer/ai
/customer/notifications
/customer/profile

RECEPTIONIST

/receptionist
/receptionist/appointments
/receptionist/customers
/receptionist/pets
/receptionist/veterinarians
/receptionist/caregivers
/receptionist/services
/receptionist/payments
/receptionist/notifications

VETERINARIAN

/veterinarian
/veterinarian/patients
/veterinarian/patients/[id]
/veterinarian/schedule
/veterinarian/medical-records
/veterinarian/prescriptions
/veterinarian/vaccinations
/veterinarian/documents
/veterinarian/notifications

CAREGIVER

/caregiver
/caregiver/schedule
/caregiver/pets
/caregiver/sessions
/caregiver/sessions/[id]
/caregiver/reports
/caregiver/notifications

ADMIN

/admin
/admin/users
/admin/staff
/admin/pets
/admin/appointments
/admin/services
/admin/payments
/admin/reports
/admin/analytics
/admin/ai
/admin/audit
/admin/settings

# 3. BACKEND AUDIT

Scan toàn bộ:

backend/app/api

backend/app/models

backend/app/schemas

backend/app/services

backend/app/repositories

backend/app/auth

backend/app/events

backend/app/ai

Kiểm tra frontend đang gọi API nào.

Mỗi frontend feature phải có backend endpoint tương ứng.

Nếu endpoint thiếu:
implement endpoint.

Không tạo API giả để che lỗi.

# 4. DATABASE AUDIT

Kiểm tra PostgreSQL schema.

Các module chính phải dùng database thật:

users

roles

pets

appointments

services

medical_records

prescriptions

vaccinations

medications

care_sessions

care_events

care_reports

notifications

payments

documents

audit_logs

ai_conversations

Không dùng hardcoded array thay cho database.

# 5. FRONTEND ↔ BACKEND CONNECTION

Kiểm tra:

API base URL

authentication token

refresh token

CORS

error handling

loading state

query invalidation

TanStack Query integration

Đảm bảo:

Frontend
→ FastAPI
→ PostgreSQL

hoạt động thật.

# 6. AUTHENTICATION

Test:

Login

Logout

Register

Refresh token

Role redirect

Ví dụ:

ADMIN → /admin

RECEPTIONIST → /receptionist

VETERINARIAN → /veterinarian

CAREGIVER → /caregiver

CUSTOMER → /customer

# 7. ROLE PERMISSION

Không chỉ ẩn UI.

Backend phải enforce permission.

Ví dụ:

Customer gọi admin API
→ 403

Caregiver truy cập pet không được assign
→ 403

Veterinarian được phép tạo medical record.

Caregiver không được tạo diagnosis.

# 8. CUSTOMER FLOW

Test end-to-end:

Login

→ Dashboard

→ My Pets

→ Open Pet

→ Passport

→ Timeline

→ Vaccination

→ Medication

→ Appointment

→ AI Assistant

→ Notification

Không route nào được 404.

# 9. RECEPTIONIST FLOW

Login

→ Dashboard

→ Appointment list

→ Appointment details

→ Confirm

→ Assign Staff

→ Check In

→ Payment

→ Customer search

Mọi chức năng phải gọi backend thật.

# 10. VETERINARIAN FLOW

Login

→ Today's patients

→ Open pet

→ View medical history

→ Add medical record

→ Add diagnosis

→ Create prescription

→ Vaccination

→ Follow-up

Customer phải xem được dữ liệu mới sau đó.

# 11. CAREGIVER FLOW

Login

→ Today

→ Assigned Pets

→ Care Session

→ Start

→ Update Status

→ Add Note

→ Add Photo

→ Complete

→ Generate Care Report

Customer phải nhận update.

# 12. ADMIN FLOW

Login

→ Dashboard

→ Users

→ Staff

→ Pets

→ Services

→ Appointments

→ Payments

→ Reports

→ Audit Logs

→ Settings

Không page nào là placeholder.

# 13. REALTIME

Kiểm tra WebSocket.

Flow:

Receptionist confirms appointment
→ Customer receives update

Receptionist assigns caregiver
→ Caregiver receives update
→ Customer receives update

Caregiver changes status
→ Customer receives live care update

No browser refresh required.

# 14. UI/UX

Các page phải có:

Loading

Error

Empty

Success

Permission denied

Responsive layout

Consistent design

Không dùng browser alert() cho normal UX.

# 15. DYNAMIC ROUTES

Kiểm tra:

pet UUID

appointment UUID

care session UUID

patient UUID

Không hardcode ID.

Không tạo href invalid.

# 16. API ERROR HANDLING

Không để frontend crash nếu backend trả:

401

403

404

409

422

500

Hiển thị lỗi phù hợp.

# 17. DOCKER

Kiểm tra:

postgres

redis

backend

worker

minio

Containers phải start được.

Backend phải kết nối PostgreSQL.

Backend phải kết nối Redis.

# 18. MIGRATIONS

Run:

alembic upgrade head

Nếu lỗi:
fix migration.

Không dùng create_all để thay migration production.

# 19. SEED

Run seed.

Đảm bảo demo accounts hoạt động:

admin@petcare.local

reception@petcare.local

doctor@petcare.local

caregiver@petcare.local

customer@petcare.local

# 20. FRONTEND BUILD

Run:

npm run lint

npm run typecheck

npm run build

Fix all critical errors.

# 21. BACKEND TEST

Run:

pytest

Fix critical failures.

# 22. ROUTE TEST

Login từng role.

Click toàn bộ sidebar.

Click dashboard cards.

Click quick actions.

Click detail links.

Không route MVP nào được 404.

# 23. FUNCTION TEST

Không chỉ kiểm tra page mở được.

Ví dụ Add Pet phải:

submit form

→ backend

→ database

→ response

→ UI refresh

Booking phải hoạt động tương tự.

# 24. NO FAKE DATA

Seed data được phép.

Hardcoded fake arrays trong final production page không được phép.

Nếu phát hiện:

const appointments = [...]

const pets = [...]

const users = [...]

hãy thay bằng backend API nếu đây là production feature.

# 25. FINAL DOCUMENTATION

Tạo:

docs/ROUTE_AUDIT.md

docs/API_AUDIT.md

docs/FEATURE_AUDIT.md

Ghi trạng thái:

WORKING

FIXED

MISSING

BLOCKED

# 26. PROJECT STATUS

Update:

PROJECT_STATUS.md

Bao gồm:

Frontend status

Backend status

Database status

Realtime status

AI status

Tests

Known issues

# 27. IMPORTANT RULE

Không sửa lỗi 404 bằng cách chỉ tạo một page có dòng:

"Coming Soon"

Không tạo placeholder chỉ để route trả HTTP 200.

Route phải có UI và chức năng thực sự theo specification nếu thuộc MVP.

# 28. AUTONOMOUS EXECUTION

Không hỏi:

"Should I continue?"

Không dừng sau audit.

Audit
→ Fix
→ Test
→ Fix errors
→ Re-test
→ Continue

Chỉ dừng nếu thật sự cần credential hoặc external resource không thể thay thế.

Nếu API AI chưa có:
dùng DevelopmentAIProvider và tiếp tục.

# 29. FINAL ACCEPTANCE

Project chỉ được coi là hoàn chỉnh khi:

Frontend chạy.

Backend chạy.

PostgreSQL chạy.

Redis chạy.

Authentication chạy.

All roles login được.

Main routes không còn 404.

Frontend kết nối backend.

Database lưu dữ liệu thật.

Realtime hoạt động.

Customer flow hoạt động.

Receptionist flow hoạt động.

Veterinarian flow hoạt động.

Caregiver flow hoạt động.

Admin flow hoạt động.

Critical tests pass.

Frontend build thành công.

# 30. START NOW

Đọc project hiện tại trước.

Không rebuild từ đầu nếu code hiện tại dùng được.

Audit toàn bộ frontend và backend.

Fix toàn bộ lỗi route và chức năng.

Sau đó test end-to-end từng role.

Tiếp tục tự động cho đến khi đạt acceptance criteria.