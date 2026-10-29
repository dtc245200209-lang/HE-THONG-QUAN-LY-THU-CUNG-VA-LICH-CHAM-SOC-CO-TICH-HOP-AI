# MASTER DEVELOPMENT PROMPT — PETCARE AI

Bạn là Senior Software Architect + Senior Full-Stack Engineer + UI/UX Engineer.

Nhiệm vụ của bạn là thiết kế và xây dựng một hệ thống hoàn chỉnh có tên:

# PetCare AI

Tên đầy đủ:

**AI-Powered Pet Care Management and Health Monitoring System**

Đây là nền tảng quản lý trung tâm chăm sóc thú cưng tích hợp AI.

Không được xây dựng dưới dạng project CRUD đơn giản có gắn chatbot.

Hệ thống phải có nghiệp vụ thực tế, phân quyền rõ ràng, database quan hệ chuẩn, API chuẩn REST, hệ thống AI có context, notification, realtime care tracking và Digital Pet Passport.

---

# 1. MỤC TIÊU HỆ THỐNG

PetCare AI phục vụ 4 nhóm người dùng:

1. ADMIN
2. RECEPTIONIST
3. CAREGIVER
4. CUSTOMER

AI KHÔNG phải role.

AI phải được xây dựng như một service dùng chung cho toàn hệ thống.

AI Service hỗ trợ:

- Pet AI Assistant
- Pet profile summarization
- Caregiver care brief
- Care report generation
- Health trend insights
- Document extraction
- Smart scheduling suggestions
- Caregiver recommendations
- Reminder suggestions

---

# 2. TECHNOLOGY STACK

Sử dụng kiến trúc sau.

## Backend

Python 3.12+

FastAPI

SQLAlchemy 2

Pydantic

Alembic

JWT Authentication

PostgreSQL

Redis

Celery hoặc background worker tương đương

WebSocket hoặc Server-Sent Events nếu phù hợp

Pytest

---

## Customer Mobile App

React Native

Expo

TypeScript

TanStack Query

Zustand

React Hook Form

Zod nếu phù hợp

---

## Management Web

Sử dụng:

Next.js

TypeScript

TailwindCSS

shadcn/ui

TanStack Query

Zustand nếu cần

Web này phục vụ:

- Admin
- Receptionist
- Caregiver

---

## Storage

Development:

MinIO hoặc local storage abstraction.

Production-ready abstraction:

S3-compatible storage.

Lưu:

- pet avatar
- documents
- vaccination records
- care photos
- medical documents

---

## Infrastructure

Docker

Docker Compose

Các container development:

- backend
- postgres
- redis
- worker
- minio nếu cần

Frontend có thể chạy local trong development.

---

# 3. ARCHITECTURE

Kiến trúc tổng thể:

Customer Mobile App
        |
        |
Management Web
        |
        v
     FastAPI
        |
------------------------------------------------
|             |              |                 |
PostgreSQL   Redis        AI Service        Storage
|             |              |                 |
Database   Queue/Cache    LLM/Vision      S3 / MinIO

Background Worker sử dụng Redis làm broker nếu sử dụng Celery.

---

# 4. ROLE-BASED ACCESS CONTROL

Thiết kế RBAC tại BACKEND.

Không được chỉ ẩn button ở frontend.

Role:

ADMIN

RECEPTIONIST

CAREGIVER

CUSTOMER

---

# 5. ADMIN PERMISSIONS

Admin có quyền:

- quản lý user
- khóa/mở user
- tạo receptionist
- tạo caregiver
- cấp role
- xem toàn bộ pet
- quản lý service
- quản lý giá dịch vụ
- xem appointment
- quản lý nhân viên
- xem payment
- xem report
- xem analytics
- xem audit log
- cấu hình hệ thống
- cấu hình AI feature
- cấu hình notification
- xem system health

Admin dashboard:

- customers
- pets
- appointments today
- caregivers
- revenue
- appointment status
- most popular services
- customer retention
- caregiver workload

---

# 6. RECEPTIONIST

Receptionist được:

- xem customer
- tìm customer
- thêm customer
- xem pet cần thiết
- tạo appointment
- chỉnh sửa appointment
- xác nhận appointment
- check-in pet
- phân caregiver
- đổi caregiver
- xem lịch caregiver
- quản lý payment status
- gửi notification

Không được:

- thay đổi system configuration
- quản lý admin
- thay đổi quyền hệ thống

---

# 7. CAREGIVER

Caregiver được:

- xem lịch làm việc của mình
- xem appointment được assign
- xem pet liên quan tới appointment
- xem allergy
- xem medication cần thiết
- xem care instructions
- bắt đầu care session
- cập nhật care status
- upload care photo
- ghi care note
- ghi weight
- ghi behavior
- ghi skin condition
- complete care session

Caregiver KHÔNG được xem toàn bộ customer database.

Chỉ được truy cập pet có liên quan đến công việc được assign.

---

# 8. CUSTOMER

Customer được:

- đăng ký
- đăng nhập
- quản lý profile
- tạo pet
- sửa pet
- upload avatar
- quản lý Digital Pet Passport
- xem vaccine
- xem medication
- xem medical records
- xem weight
- xem care history
- đặt appointment
- hủy appointment theo business rule
- xem appointment
- theo dõi live care
- nhận notification
- xem care report
- sử dụng chatbot AI
- upload document
- sử dụng emergency QR
- bật Lost Pet Mode
- chia sẻ pet với family member

---

# 9. DIGITAL PET PASSPORT

Đây là MODULE TRUNG TÂM.

Digital Pet Passport không phải chỉ là một bảng database chứa tất cả dữ liệu.

Nó là aggregation layer tổng hợp dữ liệu liên quan đến một pet.

Passport gồm:

## Basic

- Pet ID
- name
- avatar
- species
- breed
- date of birth
- sex
- neutered
- microchip
- color
- distinguishing marks

## Owner

- primary owner
- shared users
- emergency contact

## Health

- allergy
- medical condition
- weight
- medication
- medical records

## Vaccination

- vaccine
- vaccination date
- next due date
- clinic
- document

## Care

- appointment history
- care session history
- caregiver report
- grooming
- daycare
- spa

## Documents

- vaccine certificates
- prescriptions
- medical documents

## AI

- AI summary
- health insights
- reminders

---

# 10. PET TIMELINE

Mỗi pet phải có timeline thống nhất.

Ví dụ:

12 Sep
Grooming completed

10 Sep
Weight 22.6kg

05 Sep
Rabies vaccination

28 Aug
Medical visit

15 Aug
Medication started

Timeline lấy dữ liệu từ nhiều module nhưng hiển thị theo chronological order.

---

# 11. AI DOCUMENT SCANNER

Customer có thể:

Take Photo

hoặc

Upload Document.

Hệ thống xử lý:

Document
→ Upload
→ AI/Vision
→ Document Classification
→ Structured Extraction
→ Validation
→ User Confirmation
→ Database

AI có thể nhận dạng:

- vaccination certificate
- prescription
- medical report
- lab result
- care document

Ví dụ output:

document_type

pet_name

vaccine_name

vaccination_date

next_due_date

veterinarian

clinic

confidence

IMPORTANT:

AI KHÔNG được tự động ghi dữ liệu quan trọng vào Passport.

Phải có trạng thái:

PENDING_REVIEW

Customer xác nhận:

CONFIRMED

sau đó mới ghi database chính.

---

# 12. LIVE CARE UPDATE

Appointment flow:

PENDING

→ CONFIRMED

→ CHECKED_IN

→ IN_PROGRESS

→ COMPLETED

hoặc

CANCELLED

NO_SHOW

Trong IN_PROGRESS có Care Session.

Ví dụ Grooming:

CHECKED_IN

→ BATHING

→ DRYING

→ GROOMING

→ NAIL_TRIMMING

→ FINAL_CHECK

→ COMPLETED

Caregiver update một trạng thái:

Backend lưu CareEvent.

Customer nhận realtime update.

CareEvent:

id

care_session_id

event_type

message

photo_url

created_by

created_at

---

# 13. AI CARE BRIEF

Trước khi caregiver chăm sóc pet, AI tạo summary ngắn từ:

- allergy
- medical conditions
- medication
- previous care reports
- owner note
- behavior
- recent health logs

Ví dụ:

AI CARE BRIEF

Milo

Important:

Sensitive skin

Chicken allergy

Previous grooming:
Mild redness

Owner preference:
Do not cut fur too short.

AI chỉ summarize dữ liệu đã có.

Không được tự tạo medical fact.

---

# 14. AI CARE REPORT

Sau care session caregiver nhập structured fields:

mood

appetite

weight

skin_condition

behavior

service_result

caregiver_notes

AI chuyển structured data thành customer-friendly care report.

Caregiver phải review trước khi gửi.

Report sau khi approve sẽ:

- gửi customer
- lưu Passport
- thêm Timeline event

---

# 15. AI HEALTH INSIGHT

AI được phép phân tích xu hướng.

Ví dụ:

weight decreasing

appetite decreasing

activity decreasing

repeated skin issue

missed medication

Nhưng AI KHÔNG được chẩn đoán bệnh.

Không sử dụng wording:

“You have disease X”

Thay bằng:

“Recent records show a change that may deserve attention.”

Nếu có emergency signal:

difficulty breathing

seizure

possible poisoning

uncontrolled bleeding

unconsciousness

phải ưu tiên emergency recommendation.

---

# 16. EMERGENCY QR CARD

Mỗi pet có unique QR.

QR trỏ tới:

/pet/emergency/{public_token}

Không được expose pet database ID trực tiếp.

Public emergency page được xem:

- pet photo
- pet name
- species
- emergency contact
- selected allergy
- selected medical warning
- medication emergency information
- owner-defined emergency note

KHÔNG show:

- full medical history
- home address
- private documents
- payment
- account information

---

# 17. LOST PET MODE

Customer có thể bật:

lost_mode = true

Khi bật:

QR page hiển thị Lost Pet warning.

Người tìm thấy có thể:

- call owner
- submit location
- upload photo
- send message

Owner nhận notification.

Lưu LostPetReport:

pet_id

location

message

photo

reported_at

---

# 18. SMART REMINDER ENGINE

Reminder tự tạo dựa vào:

Vaccination next_due_date

Medication

Appointment

Grooming interval

Medical follow-up

Document expiration nếu có

Ví dụ vaccine:

30 ngày trước

7 ngày trước

1 ngày trước

Reminder không hardcode hoàn toàn ở frontend.

Backend quản lý reminder rules.

---

# 19. FAMILY PET SHARING

Một pet có:

PRIMARY_OWNER

và shared members.

Permission:

VIEWER

CAREGIVER_MEMBER

CO_OWNER

Ví dụ:

CO_OWNER có thể đặt lịch.

VIEWER chỉ xem.

Không sử dụng ownership đơn giản bằng pet.user_id duy nhất.

Thiết kế bảng pet_memberships.

---

# 20. PET OWNERSHIP TRANSFER

Cho phép primary owner chuyển quyền sở hữu.

Transfer flow:

Owner request

→ New owner accepts

→ ownership change

→ Passport history vẫn được giữ lại.

Phải lưu Audit Log.

---

# 21. CAREGIVER MATCHING

Khi receptionist assign caregiver, hệ thống tính recommendation score.

Dựa trên:

availability

skill

service experience

pet size experience

previous interaction

rating

current workload

Không cần ML ở version đầu.

Dùng deterministic scoring algorithm.

Ví dụ:

availability = mandatory

skill = 30

experience = 20

rating = 15

previous pet experience = 15

workload balance = 20

Backend trả:

recommended caregivers

score

reasoning factors

Receptionist quyết định cuối cùng.

---

# 22. APPOINTMENT

Appointment fields cần xem xét:

id

customer_id

pet_id

appointment_date

start_time

end_time

status

caregiver_id

created_by

customer_note

receptionist_note

total_price

payment_status

created_at

updated_at

Appointment có nhiều service.

Thiết kế appointment_services.

---

# 23. SERVICE MANAGEMENT

Service:

id

name

description

base_price

duration_minutes

active

category

Có thể có:

GROOMING

BATH

NAIL_TRIM

DAYCARE

SPA

VET_CHECK

CUSTOM

---

# 24. DATABASE DESIGN

Thiết kế database normalized.

Các bảng tối thiểu:

users

roles

user_roles

pets

pet_memberships

pet_passports

pet_allergies

pet_conditions

weight_records

vaccinations

medications

medical_records

pet_documents

services

appointments

appointment_services

caregiver_profiles

caregiver_skills

caregiver_schedules

care_sessions

care_events

care_reports

notifications

reminders

qr_codes

lost_pet_reports

ai_conversations

ai_messages

ai_insights

payments

reviews

audit_logs

Nếu pet_passports không cần bảng vật lý riêng thì giải thích kiến trúc aggregation phù hợp.

Không duplicate dữ liệu không cần thiết.

---

# 25. DATABASE RULES

Sử dụng:

UUID cho public/business entities nếu phù hợp.

Foreign key.

Unique constraint.

Indexes.

created_at.

updated_at.

Soft delete nơi phù hợp.

Timezone-aware datetime.

Không lưu password plaintext.

Không lưu access token plaintext nếu không cần.

---

# 26. ALEMBIC

Mọi thay đổi schema phải dùng Alembic migration.

Không manually create production database.

Cần hỗ trợ:

alembic upgrade head

---

# 27. API DESIGN

API prefix:

/api/v1

Modules:

/auth

/users

/pets

/passports

/documents

/vaccinations

/medications

/appointments

/services

/caregivers

/care-sessions

/notifications

/reminders

/qr

/ai

/admin

Ví dụ:

GET /api/v1/pets

POST /api/v1/pets

GET /api/v1/pets/{pet_id}

GET /api/v1/pets/{pet_id}/passport

GET /api/v1/pets/{pet_id}/timeline

POST /api/v1/appointments

PATCH /api/v1/appointments/{id}

POST /api/v1/appointments/{id}/assign-caregiver

POST /api/v1/care-sessions/{id}/events

POST /api/v1/documents

POST /api/v1/documents/{id}/confirm

POST /api/v1/pets/{id}/lost-mode

GET /api/v1/public/emergency/{token}

---

# 28. AUTHENTICATION

Implement:

Register

Login

Refresh token

Logout

Forgot password architecture

RBAC

JWT access token

Refresh token

Password hashing dùng Argon2 hoặc secure equivalent.

---

# 29. SECURITY

Bắt buộc:

Input validation

Authorization check

Object ownership check

Rate limiting cho login và AI endpoint

File upload validation

File size limit

MIME validation

CORS configuration

Environment secrets

Không hardcode API key

Audit sensitive actions

Prevent IDOR

---

# 30. AUDIT LOG

Lưu các action quan trọng:

USER_CREATED

ROLE_CHANGED

PET_UPDATED

MEDICAL_RECORD_CREATED

APPOINTMENT_UPDATED

CAREGIVER_ASSIGNED

PASSPORT_SHARED

OWNERSHIP_TRANSFERRED

DOCUMENT_CONFIRMED

Log gồm:

actor_id

action

entity_type

entity_id

metadata

timestamp

---

# 31. NOTIFICATION

Hỗ trợ architecture cho:

In-app notification

Push notification

Email optional

Notification event:

appointment confirmed

appointment reminder

care update

care completed

vaccination due

medication reminder

lost pet QR scanned

AI document ready for review

---

# 32. UI/UX — CUSTOMER MOBILE

Bottom navigation:

Home

Calendar

AI

Pets

Profile

Home:

Pet selector

Today tasks

Next appointment

Recent care update

AI insight

Pets:

Pet list

Pet profile

Passport

Timeline

Vaccination

Medication

Documents

Weight

Emergency QR

AI:

Chat

Suggested questions

Pet selector

Booking:

Service

Date

Time

Pet

Notes

Confirmation

---

# 33. UI/UX — RECEPTIONIST

Sidebar:

Dashboard

Appointments

Customers

Pets

Services

Caregivers

Payments

Notifications

Appointment screen phải hỗ trợ:

calendar

filters

status

assign caregiver

check-in

search customer

search pet

---

# 34. UI/UX — CAREGIVER

Sidebar:

Today

Schedule

Assigned Pets

Care Sessions

Reports

Notifications

Today page:

appointment cards

time

pet

service

warning

AI Care Brief

Care session screen:

Start

Update status

Add note

Upload photo

Weight

Behavior

Health observation

Complete

---

# 35. UI/UX — ADMIN

Sidebar:

Dashboard

Users

Staff

Pets

Appointments

Services

Payments

Reports

AI Analytics

Audit Logs

System Settings

Admin dashboard phải có charts nhưng không quá nhiều.

UI hiện đại, clean, responsive.

Không sử dụng UI màu mè quá mức.

---

# 36. AI CHATBOT

AI chatbot phải có context của pet được chọn.

Không gửi toàn bộ database cho LLM.

Backend phải assemble contextual data cần thiết.

Context có thể gồm:

basic pet profile

allergies

current medication

recent appointments

recent weight

recent health events

recent care reports

AI conversation.

Có token/context management.

---

# 37. AI OUTPUT

Với structured AI tasks phải yêu cầu JSON output.

Pydantic validate output trước khi lưu.

Nếu invalid:

retry hoặc return failure.

Không lưu raw AI result như trusted medical data.

---

# 38. FILE STRUCTURE — BACKEND

Gợi ý:

backend/

app/

main.py

core/

config.py
security.py
database.py

models/

schemas/

repositories/

services/

api/

workers/

ai/

tests/

alembic/

Dockerfile

pyproject.toml hoặc requirements.txt

.env.example

README.md

---

# 39. FILE STRUCTURE — WEB

web/

src/

app/

components/

features/

auth/

appointments/

pets/

caregivers/

admin/

services/

lib/

api/

stores/

types/

---

# 40. FILE STRUCTURE — MOBILE

mobile/

src/

screens/

components/

features/

pets/

passport/

appointments/

ai/

notifications/

services/

stores/

types/

---

# 41. DOCKER COMPOSE

Tạo docker-compose.yml.

Services ban đầu:

postgres

redis

backend

worker

minio nếu sử dụng

Dùng healthcheck.

Backend không chỉ depend_on đơn giản nếu database chưa ready.

Environment variables thông qua .env.

Không commit secret.

---

# 42. DEVELOPMENT ENVIRONMENT

Một developer mới clone repository phải có thể:

copy .env.example .env

docker compose up -d

run migrations

seed database

start frontend

start mobile

README phải mô tả đầy đủ.

---

# 43. DATABASE SEED

Tạo seed development data.

Roles:

ADMIN

RECEPTIONIST

CAREGIVER

CUSTOMER

Tạo demo:

1 admin

1 receptionist

3 caregivers

3 customers

5 pets

services

appointments

care sessions

vaccination

medication

weight records.

Không sử dụng demo/mock data trong production code path.

---

# 44. TESTING

Backend phải có tests cho:

authentication

RBAC

pet ownership

appointments

caregiver assignment

care session

passport

document confirmation

QR privacy

lost pet

Không chỉ test happy path.

Test forbidden access.

---

# 45. ERROR FORMAT

API error phải consistent.

Ví dụ:

{
  "error": {
    "code": "PET_NOT_FOUND",
    "message": "Pet not found"
  }
}

---

# 46. LOGGING

Structured logging.

Không log:

password

JWT

API key

private medical documents.

---

# 47. IMPLEMENTATION STRATEGY

KHÔNG code toàn bộ project cùng lúc.

Xây theo PHASE.

---

# PHASE 0 — ARCHITECTURE

Trước khi code:

1. Phân tích requirement.
2. Tạo architecture overview.
3. Tạo ERD.
4. Tạo role permission matrix.
5. Tạo API map.
6. Tạo folder structure.
7. Tạo development roadmap.

Sau đó mới code.

---

# PHASE 1 — FOUNDATION

Implement:

Docker Compose

PostgreSQL

Redis

FastAPI

SQLAlchemy

Alembic

Config

Logging

Health endpoint

Authentication

RBAC

Users

Tests

---

# PHASE 2 — PET CORE

Implement:

pets

pet memberships

pet passport

weight

allergies

conditions

vaccination

medication

medical record

timeline

Tests.

---

# PHASE 3 — APPOINTMENT

Implement:

services

appointments

appointment services

caregiver profile

caregiver schedule

caregiver skill

caregiver matching

Receptionist flow.

Tests.

---

# PHASE 4 — CARE SESSION

Implement:

check-in

care sessions

care events

caregiver notes

photo upload

live update

care report.

Tests.

---

# PHASE 5 — DIGITAL PASSPORT ADVANCED

Implement:

documents

AI document extraction architecture

confirmation

passport timeline

smart reminder.

Tests.

---

# PHASE 6 — QR

Implement:

Emergency QR

privacy

Lost Pet Mode

lost pet report

notifications.

Tests.

---

# PHASE 7 — AI

Implement:

AI context builder

AI chatbot

AI Care Brief

AI Care Report

Health Insight

structured JSON output

guardrails

Tests.

---

# PHASE 8 — FRONTEND

Customer mobile.

Receptionist web.

Caregiver web.

Admin web.

Không dùng mock API nếu backend endpoint đã có.

---

# PHASE 9 — QA

Run:

format

lint

typecheck

backend tests

frontend build

migration test

docker startup test.

Fix all critical errors.

---

# 48. IMPORTANT DEVELOPMENT RULES

Không tạo placeholder rồi tuyên bố hoàn thành.

Không giả lập chức năng nếu requirement yêu cầu chức năng thật.

Không để TODO quan trọng mà không báo.

Không hardcode credentials.

Không bypass RBAC.

Không trust client-provided role.

Không lưu AI output trực tiếp thành medical truth.

Không để caregiver xem pet không được assign.

Không expose private passport qua QR.

Không dùng localhost hostname bên trong Docker network.

Không sửa migration cũ sau khi migration đã được apply; tạo migration mới.

---

# 49. CODING QUALITY

Code phải:

clean

typed

modular

testable

documented

production-oriented.

Avoid giant files.

Service layer phải tách business logic khỏi API router.

Database model không được sử dụng trực tiếp như public API schema.

---

# 50. ACCEPTANCE CRITERIA

MVP được xem là thành công khi có thể demo flow:

Customer Register

→ Add Milo

→ Create Digital Passport

→ Add vaccination

→ Upload vaccine document

→ Confirm extracted data

→ Create Appointment

→ Receptionist confirms

→ Assign Caregiver

→ Milo checks in

→ Caregiver receives AI Care Brief

→ Caregiver starts service

→ Customer sees live updates

→ Caregiver completes service

→ AI generates Care Report

→ Customer receives report

→ Report appears in Pet Timeline

→ Passport updated

→ Vaccine Reminder created

→ Emergency QR can be scanned

→ Private fields are protected

→ Lost Pet Mode can be enabled.

---

# 51. WORKING METHOD

Sau mỗi Phase:

1. Cho biết files đã tạo/thay đổi.
2. Cho biết migration mới.
3. Cho biết API mới.
4. Chạy test.
5. Báo test result.
6. Chạy lint/typecheck phù hợp.
7. Kiểm tra Docker nếu liên quan.
8. Chỉ chuyển phase khi phase hiện tại hoạt động.

Nếu gặp lỗi:

Phân tích nguyên nhân.

Fix.

Chạy lại test.

Không bỏ qua lỗi để tiếp tục.

---

# 52. FIRST TASK

Bắt đầu bằng PHASE 0.

KHÔNG CODE BUSINESS FEATURE NGAY.

Hãy thực hiện trước:

1. Phân tích architecture.
2. Đề xuất final repository structure.
3. Thiết kế complete ERD.
4. Thiết kế Role & Permission Matrix.
5. Thiết kế API map.
6. Đề xuất Docker architecture.
7. Chỉ ra các vấn đề/rủi ro kiến trúc.
8. Đưa development roadmap chi tiết.

Sau khi hoàn thành Phase 0 mới bắt đầu Phase 1.

Mục tiêu là xây PetCare AI thành một hệ thống có thể chạy thực tế, không phải project demo CRUD.