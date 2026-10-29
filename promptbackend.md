# MASTER PROMPT — PETCARE AI FULL-STACK WEB

Bạn là Senior Software Architect, Senior Full-Stack Developer, Backend Engineer, Frontend Engineer, Database Engineer, DevOps Engineer, AI Engineer, QA Engineer và Senior UI/UX Designer.

Nhiệm vụ của bạn là xây dựng hoàn chỉnh một hệ thống web có tên:

# PETCARE AI

Tên đầy đủ:

**AI-Powered Pet Care Management, Digital Pet Passport and Veterinary Care Platform**

Mục tiêu là tạo ra một hệ thống có thể chạy và demo thực tế, không phải prototype tĩnh, không phải CRUD đơn giản và không phải chỉ dựng giao diện.

Phải triển khai đầy đủ:

* Frontend
* Backend
* Database
* Authentication
* Role & Permission
* Realtime
* AI integration architecture
* Digital Pet Passport
* Booking
* Doctor/Veterinarian
* Receptionist
* Caregiver
* Customer
* Admin
* Notifications
* Document management
* Emergency QR
* Lost Pet Mode
* Reports
* Docker
* Tests
* UX/UI Design
* Seed data
* Documentation

Không dừng lại ở bước thiết kế.

Hãy tiếp tục triển khai cho đến khi hệ thống có thể chạy được trong môi trường development.

---

# 1. WEB-FIRST

Chỉ xây dựng WEB ở phiên bản này.

Không tạo React Native.

Không tạo Expo.

Dùng một website duy nhất.

Ví dụ:

petcare.local

Mọi role đăng nhập ở cùng một website.

Sau đăng nhập redirect theo role:

ADMIN
→ /admin

RECEPTIONIST
→ /receptionist

VETERINARIAN
→ /veterinarian

CAREGIVER
→ /caregiver

CUSTOMER
→ /customer

Public emergency page:

/public/pet/{token}

Các role sử dụng cùng:

* Backend
* Database
* Authentication
* Notification system
* Realtime infrastructure

Nhưng có UI, permission và navigation riêng.

---

# 2. USER ROLES

Hệ thống có 5 role chính:

ADMIN

RECEPTIONIST

VETERINARIAN

CAREGIVER

CUSTOMER

AI không phải role.

AI là một internal service.

---

# 3. PHÂN BIỆT VETERINARIAN VÀ CAREGIVER

Không gộp hai role này.

## VETERINARIAN

Có quyền:

* xem hồ sơ y tế của pet được phép truy cập
* tạo medical record
* ghi triệu chứng
* ghi chẩn đoán
* ghi treatment plan
* tạo prescription
* cập nhật vaccination
* tạo follow-up recommendation
* xem health timeline
* xem AI medical summary hỗ trợ
* xem document y tế
* ghi note chuyên môn

## CAREGIVER

Có quyền:

* grooming
* bath
* daycare
* feeding
* walking
* basic observation
* care session
* upload care photos
* record weight
* record mood
* record behavior
* write care notes

Caregiver không được tạo medical diagnosis.

Caregiver không được tạo prescription.

---

# 4. TECHNOLOGY STACK

## Frontend

Next.js

TypeScript

App Router

Tailwind CSS

shadcn/ui

TanStack Query

React Hook Form

Zod

Recharts

Lucide Icons

Use Server Components where suitable.

Use Client Components only when interactive behavior requires them.

---

# 5. BACKEND

Python

FastAPI

SQLAlchemy 2.x

Pydantic

Alembic

PostgreSQL

Redis

Celery or equivalent worker

WebSocket

JWT authentication

Argon2 password hashing

Pytest

---

# 6. DATABASE

Use:

PostgreSQL

PostgreSQL is the SOURCE OF TRUTH.

Do not use MongoDB as primary storage.

Use Redis only for:

* realtime
* queue
* cache
* temporary state
* rate limiting
* task coordination

---

# 7. INFRASTRUCTURE

Use Docker Compose.

Development services:

postgres

redis

backend

worker

minio

Optional monitoring if simple.

Frontend can run locally using npm/pnpm.

If practical, also provide Dockerfile for frontend.

---

# 8. PROJECT STRUCTURE

Use a monorepo:

petcare-ai/

backend/

web/

infra/

docs/

docker-compose.yml

.env.example

README.md

PROJECT_STATUS.md

---

# 9. AUTONOMOUS DEVELOPMENT RULE

Do not stop after each phase asking:

"Should I continue?"

"Do you want me to proceed?"

Continue automatically.

After every significant phase:

* run tests
* fix failures
* update PROJECT_STATUS.md
* continue

If context is lost later, PROJECT_STATUS.md must allow continuation.

---

# 10. PROJECT STATUS FILE

Create:

PROJECT_STATUS.md

Include:

Current Phase

Completed

In Progress

Pending

Database Migrations

Implemented APIs

Implemented Pages

Known Issues

Test Results

Next Exact Task

Architecture Decisions

---

# 11. AUTHENTICATION

Implement:

Register

Login

Logout

Refresh token

Forgot password architecture

Password reset architecture

Account status

Role-based authorization

Object-level authorization

Never store plaintext passwords.

Never trust role from frontend.

---

# 12. MAIN WEB ROUTES

Public:

/

/login

/register

/forgot-password

/public/pet/[token]

Authenticated:

/customer/*

/receptionist/*

/veterinarian/*

/caregiver/*

/admin/*

---

# 13. GLOBAL UX/UI

Create a professional visual system.

Visual identity:

clean

modern

friendly

trustworthy

pet-care oriented

medical-grade clarity where appropriate

Use:

rounded cards

subtle shadows

soft neutral backgrounds

clear typography

large readable status badges

consistent spacing

responsive layouts

Avoid:

excessive gradients

childish design

overly colorful dashboards

generic bootstrap look

Every role should feel part of the same product.

---

# 14. DESIGN SYSTEM

Create reusable:

Button

Input

Textarea

Select

Combobox

Dialog

Drawer

Sheet

Card

Badge

Avatar

Tabs

Table

Pagination

EmptyState

ErrorState

LoadingSkeleton

StatCard

StatusBadge

Timeline

NotificationBell

PetAvatar

RoleGuard

PermissionGuard

---

# 15. CUSTOMER UX

Customer UI should be friendlier than staff UI.

Sidebar or top navigation:

Dashboard

My Pets

Appointments

Digital Passport

AI Assistant

Notifications

Profile

On mobile-browser responsive mode:

use bottom navigation if useful.

---

# 16. CUSTOMER DASHBOARD

Show:

Welcome header

Pet selector

Upcoming appointment

Today's reminders

Recent care report

Vaccination due warning

Medication reminder

Recent Pet Timeline

AI Health Insight

Quick Actions:

Add Pet

Book Appointment

Upload Document

Open Passport

Ask AI

---

# 17. PET PROFILE

Page:

/customer/pets/[id]

Header:

Pet photo

Name

Breed

Age

Sex

Weight

Pet ID

Microchip

Emergency QR shortcut

Tabs:

Overview

Health

Vaccinations

Medication

Appointments

Care

Timeline

Documents

AI Insights

Emergency

---

# 18. DIGITAL PET PASSPORT

This is a flagship feature.

Passport must aggregate:

Identity

Ownership

Health

Vaccination

Medication

Medical Records

Weight History

Care History

Documents

Emergency Information

AI Summary

Use clean printable passport-style page.

Support:

View

Print-friendly layout

QR access configuration

Do not duplicate all data into one giant table.

---

# 19. PET TIMELINE

Display unified chronological history.

Example:

15 Sep
Grooming completed

12 Sep
Weight 22.4 kg

10 Sep
Veterinarian visit

08 Sep
Medication started

01 Sep
Rabies vaccine

Use icons based on event type.

Support filters:

All

Medical

Care

Vaccination

Medication

Appointment

Document

---

# 20. RECEPTIONIST UX

Desktop-first.

Navigation:

Dashboard

Appointments

Customers

Pets

Veterinarians

Caregivers

Services

Payments

Notifications

Receptionist dashboard:

Today's appointments

Waiting check-ins

Unassigned appointments

Available staff

Revenue today

Upcoming slots

Operational alerts

---

# 21. APPOINTMENT BOARD

Provide:

Calendar view

List view

Day view

Filters:

date

service

status

veterinarian

caregiver

customer

Appointment states:

PENDING

CONFIRMED

CHECKED_IN

IN_PROGRESS

COMPLETED

CANCELLED

NO_SHOW

Appointment card shows:

time

pet

customer

service

assigned staff

status

payment status

---

# 22. CHECK-IN FLOW

Receptionist clicks:

Check In

Then:

verify pet

verify owner

verify service

verify health warning

confirm assigned staff

mark CHECKED_IN

Realtime event must update relevant clients.

---

# 23. VETERINARIAN UX

Navigation:

Dashboard

Today's Patients

Schedule

Medical Records

Prescriptions

Vaccinations

Documents

Notifications

Veterinarian dashboard:

Today's consultations

Follow-ups

Urgent notes

Upcoming patients

Recent records

---

# 24. VETERINARIAN PATIENT PAGE

Show:

Pet profile

Owner

Allergies

Conditions

Medication

Recent weight

Vaccination

Recent symptoms

Timeline

Documents

AI Medical Summary

Actions:

Add Medical Record

Add Diagnosis

Add Treatment

Create Prescription

Create Follow-up

Update Vaccination

---

# 25. CAREGIVER UX

Navigation:

Today

My Schedule

Assigned Pets

Care Sessions

Reports

Notifications

Today cards include:

time

pet

service

warning

owner note

AI Care Brief

Start button

---

# 26. CARE SESSION PAGE

Show:

Pet header

Service

Owner instructions

Allergies

Care warnings

AI Care Brief

Care timeline

Actions:

Start session

Update stage

Add note

Add photo

Record weight

Record mood

Record behavior

Record skin condition

Complete session

Care stages example:

WAITING

STARTED

BATHING

DRYING

GROOMING

NAIL_TRIMMING

FINAL_CHECK

COMPLETED

Adapt stages by service.

---

# 27. ADMIN UX

Navigation:

Dashboard

Users

Staff

Pets

Appointments

Services

Payments

Reports

Analytics

AI Analytics

Audit Logs

System Settings

Admin dashboard includes:

Total customers

Total pets

Appointments today

Completed today

Veterinarians active

Caregivers active

Revenue

Most popular service

Retention

Appointment trends

Staff workload

Recent audit events

---

# 28. DATABASE TABLES

Create normalized tables for:

users

roles

user_roles

pets

pet_memberships

pet_emergency_contacts

pet_allergies

pet_conditions

weight_records

vaccinations

medications

prescriptions

prescription_items

medical_records

medical_record_diagnoses

pet_documents

services

appointments

appointment_services

veterinarian_profiles

caregiver_profiles

staff_skills

staff_schedules

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

outbox_events

Add additional normalized tables if necessary.

---

# 29. DATABASE STANDARDS

Use:

UUID

Foreign Keys

Unique constraints

Indexes

created_at

updated_at

Timezone-aware DateTime

Soft delete where justified

Avoid giant JSON structures.

Use JSONB only for flexible metadata where justified.

---

# 30. DIGITAL PET OWNERSHIP

Do not design:

pets.user_id

as the only ownership model.

Use:

pet_memberships

Membership roles:

PRIMARY_OWNER

CO_OWNER

FAMILY_CAREGIVER

VIEWER

Implement object-level permission.

---

# 31. OWNERSHIP TRANSFER

Flow:

Owner A initiates

→ invitation

→ Owner B accepts

→ ownership updated transactionally

→ history preserved

→ audit log

---

# 32. SERVICES

Support:

Veterinary Consultation

Vaccination

Grooming

Bath

Nail Trim

Spa

Daycare

Boarding optional

Other

Fields:

name

category

description

price

duration

active

required_staff_type

---

# 33. STAFF SCHEDULING

For:

Veterinarian

Caregiver

Store:

working hours

days

time-off

skills

service compatibility

appointment assignments

Prevent appointment overlap.

---

# 34. SMART STAFF MATCHING

For appointment assignment:

availability mandatory

role compatibility

skill match

service experience

current workload

rating

previous pet interaction

Return ranked candidates.

Use deterministic algorithm first.

Do not use AI for critical assignment logic.

---

# 35. REALTIME

Implement realtime properly.

Use:

REST for commands

WebSocket for live events.

Examples:

appointment.created

appointment.confirmed

appointment.checked_in

staff.assigned

care_session.started

care_session.updated

care_session.completed

care_report.created

notification.created

document.processed

lost_pet.reported

Frontend must update without browser refresh.

---

# 36. REALTIME EXAMPLE

Customer creates appointment.

Backend saves PostgreSQL.

Create domain event.

Receptionist page receives update.

Receptionist confirms.

Customer receives update.

Receptionist assigns caregiver/veterinarian.

Assigned staff receives update.

Customer sees assigned staff.

Caregiver updates care status.

Customer sees realtime status.

Admin sees summary.

All use same data.

No separate mock datasets.

---

# 37. TRANSACTIONAL OUTBOX

Implement outbox pattern.

During business transaction:

update data

*

insert outbox_event

COMMIT.

Worker publishes event after commit.

Fields:

id

event_type

aggregate_type

aggregate_id

payload

status

retry_count

created_at

processed_at

---

# 38. NOTIFICATIONS

In-app notifications required.

Events:

Appointment created

Appointment confirmed

Appointment cancelled

Appointment reminder

Staff assigned

Care started

Care update

Care completed

Care report available

Veterinary follow-up

Vaccination due

Medication due

Document processed

Lost pet scan/report

Ownership invitation

AI insight generated

Support:

read/unread

notification center

badge count

---

# 39. MEDICAL RECORDS

Veterinarian can create structured records.

Fields:

chief complaint

symptoms

physical exam

diagnosis

assessment

treatment plan

follow-up

notes

Attachments

Do not let AI automatically create trusted diagnosis.

---

# 40. PRESCRIPTION

Veterinarian can create prescription:

medication

dose

unit

frequency

duration

instructions

start date

end date

Prescription must appear in Digital Passport.

Customer can view but not edit veterinarian prescription.

---

# 41. VACCINATION

Fields:

vaccine

dose

date

next due date

veterinarian

clinic

batch/lot optional

document

status

Automatic reminder.

---

# 42. WEIGHT TRACKING

Store history.

Customer and authorized staff can view.

Chart:

date vs weight

AI may summarize trend.

---

# 43. DOCUMENT MANAGEMENT

Upload:

PDF

JPG

PNG

Support:

Vaccination certificate

Prescription

Medical record

Lab result

Other

Validate:

MIME

extension

size

authorization

Store safely.

---

# 44. AI DOCUMENT SCANNER

Flow:

Upload

→ Worker

→ AI provider

→ classify

→ extract structured data

→ validate

→ PENDING_REVIEW

→ user review

→ confirm

→ trusted domain record created

Never directly trust AI extraction.

---

# 45. AI PROVIDER

Create abstraction:

AIProvider

Methods:

chat()

extract_document()

generate_care_brief()

generate_care_report()

generate_pet_summary()

generate_health_insight()

Create:

DevelopmentAIProvider

ExternalAIProvider

If API key absent:

project must still run.

---

# 46. SECRET MANAGEMENT

Never hardcode secret.

Read:

AI_API_KEY

JWT_SECRET

DATABASE_URL

REDIS_URL

STORAGE credentials

from environment variables.

Create:

.env.example

Never copy real secret into README.

Never print secret.

Never commit .env.

---

# 47. AI PET ASSISTANT

Customer chooses pet.

Backend builds authorized context:

profile

allergy

conditions

medication

vaccination

recent weight

medical history summary

recent care reports

recent appointments

AI answers using only available context.

Include disclaimer for health-related content.

AI should encourage veterinarian evaluation when appropriate.

---

# 48. AI CARE BRIEF

Before caregiver starts:

Generate concise summary:

important allergy

behavior issue

previous care issue

owner preference

recent notes

Do not invent information.

---

# 49. AI MEDICAL SUMMARY

Veterinarian can use AI to summarize existing records.

AI can:

summarize timeline

summarize medications

summarize previous diagnoses

highlight recent changes

AI cannot independently create a final diagnosis.

---

# 50. AI CARE REPORT

Caregiver enters structured observations.

AI generates user-friendly report.

Caregiver reviews.

Only after caregiver approves:

publish

notify owner

add timeline

update Passport.

---

# 51. AI HEALTH INSIGHT

Analyze trends:

weight

appointments

vaccinations

medication adherence if available

repeated observations

skin issues

appetite observations

behavior observations

Output:

Informational

Attention Suggested

Veterinarian Follow-up Suggested

Do not diagnose.

---

# 52. EMERGENCY QR

Every pet can have QR.

Use secure random public token.

Do not expose internal UUID if avoidable.

Public page may show:

photo

pet name

species

emergency contact

critical allergy

critical warning

owner-selected note

Lost Mode state

Do not show:

full medical history

owner home address

private document

payments

account information

---

# 53. LOST PET MODE

Customer can activate.

QR page changes to:

LOST PET

Finder can:

submit approximate location

message

photo optional

Owner receives notification.

Add rate limiting.

---

# 54. AI + QR PRIVACY

AI endpoints must never expose private passport data to public QR users.

Public route has dedicated response schema.

---

# 55. APPOINTMENT FLOW

Customer:

Choose Pet

→ Choose Service

→ Choose Date

→ Choose Time

→ Notes

→ Create Booking

Receptionist:

Review

→ Confirm

→ Assign staff

→ Check-in

Staff:

Start service

→ Update

→ Complete

Customer:

Realtime tracking

→ Receive report

Admin:

Analytics updated.

---

# 56. API PREFIX

/api/v1

Modules:

auth

users

pets

passports

medical-records

prescriptions

vaccinations

medications

documents

appointments

services

staff

veterinarians

caregivers

care-sessions

notifications

reminders

qr

lost-pets

payments

ai

admin

---

# 57. EXAMPLE API

POST /api/v1/auth/register

POST /api/v1/auth/login

POST /api/v1/auth/refresh

POST /api/v1/auth/logout

GET /api/v1/pets

POST /api/v1/pets

GET /api/v1/pets/{id}

PATCH /api/v1/pets/{id}

GET /api/v1/pets/{id}/passport

GET /api/v1/pets/{id}/timeline

POST /api/v1/pets/{id}/vaccinations

POST /api/v1/pets/{id}/documents

POST /api/v1/appointments

GET /api/v1/appointments

POST /api/v1/appointments/{id}/confirm

POST /api/v1/appointments/{id}/assign-staff

POST /api/v1/appointments/{id}/check-in

POST /api/v1/care-sessions/{id}/start

POST /api/v1/care-sessions/{id}/events

POST /api/v1/care-sessions/{id}/complete

POST /api/v1/medical-records

POST /api/v1/prescriptions

GET /api/v1/notifications

POST /api/v1/notifications/{id}/read

POST /api/v1/ai/chat

GET /api/v1/public/pets/{token}

POST /api/v1/public/pets/{token}/found-report

---

# 58. API ERROR FORMAT

Use consistent structure:

{
"error": {
"code": "PET_NOT_FOUND",
"message": "Pet not found",
"details": null
}
}

Use correct HTTP status codes.

---

# 59. SECURITY

Implement:

RBAC

Object-level authorization

Pet membership check

Veterinarian access check

Caregiver assignment check

Receptionist permission

IDOR prevention

Rate limiting

CORS

File validation

Input validation

Safe logging

Password hashing

Token expiry

Refresh token protection

Public QR isolation

---

# 60. AUDIT LOG

Audit:

Login security events where appropriate

Role changes

Pet update

Medical record creation

Prescription creation

Vaccination update

Appointment changes

Staff assignment

Document confirmation

Ownership transfer

Lost Mode

Admin setting update

Fields:

actor

action

entity

entity_id

metadata

timestamp

---

# 61. PAYMENT

First version does not require Stripe.

Create internal payment system.

Fields:

appointment

amount

method

status

paid_at

recorded_by

Statuses:

PENDING

PAID

FAILED

REFUNDED

CANCELLED

---

# 62. DASHBOARD ANALYTICS

Admin:

appointments

revenue

customer growth

pet growth

popular service

completion rate

cancellation rate

staff workload

Receptionist:

today schedule

pending bookings

check-ins

staff availability

Veterinarian:

patients

follow-ups

vaccination due

Caregiver:

today sessions

completed

pending

Customer:

pets

appointment

reminders

care updates

---

# 63. RESPONSIVE DESIGN

Admin/Receptionist/Veterinarian/Caregiver:

desktop priority.

Customer:

desktop + tablet + mobile browser.

At widths below mobile breakpoint:

navigation should remain usable.

No horizontal overflow on normal screens.

---

# 64. FRONTEND STATE

Use:

TanStack Query for server state.

Do not store duplicate backend data unnecessarily in Zustand.

Zustand only for suitable local/shared UI state.

React Query cache must update from realtime events.

---

# 65. REALTIME CLIENT

Create reusable realtime client.

Support:

auth

reconnect

heartbeat if needed

event parsing

permission-aware subscription

query cache invalidation

Do not reload whole page.

---

# 66. FORMS

Use:

React Hook Form

Zod

Show field errors.

Show backend errors.

Disable double submit.

Use loading state.

---

# 67. TABLE UX

Staff/Admin tables need:

search

filter

sort

pagination

empty state

loading skeleton

row actions

responsive behavior

---

# 68. FILE UPLOAD UX

Drag-and-drop.

Preview.

Progress state.

Validation errors.

Upload status.

Document processing status:

UPLOADED

PROCESSING

PENDING_REVIEW

CONFIRMED

FAILED

---

# 69. SEED DATA

Create realistic development seed.

Accounts:

[admin@petcare.local](mailto:admin@petcare.local)

[reception@petcare.local](mailto:reception@petcare.local)

[doctor@petcare.local](mailto:doctor@petcare.local)

[caregiver@petcare.local](mailto:caregiver@petcare.local)

[customer@petcare.local](mailto:customer@petcare.local)

Development password can be:

PetCare123!

Clearly label DEVELOPMENT ONLY.

Seed:

users

pets

medical records

vaccines

appointments

services

staff schedules

care sessions

notifications

payments

timeline data

---

# 70. DOCKER COMPOSE

Create:

postgres

redis

backend

worker

minio

Use:

healthchecks

persistent volume

environment variables

network

Do not assume Postgres ready just because container started.

---

# 71. ENV EXAMPLE

Include variables like:

APP_ENV=

DATABASE_URL=

REDIS_URL=

JWT_SECRET=

ACCESS_TOKEN_EXPIRE_MINUTES=

REFRESH_TOKEN_EXPIRE_DAYS=

AI_PROVIDER=

AI_API_KEY=

S3_ENDPOINT=

S3_ACCESS_KEY=

S3_SECRET_KEY=

S3_BUCKET=

FRONTEND_URL=

---

# 72. HEALTH CHECK

GET /health

Check:

backend

database

redis

storage if configured

Do not expose secret.

---

# 73. BACKEND FOLDER STRUCTURE

backend/app/

main.py

core/

models/

schemas/

repositories/

services/

api/

auth/

events/

ai/

workers/

storage/

tests/

---

# 74. FRONTEND STRUCTURE

web/src/

app/

components/

features/

auth/

pets/

passport/

appointments/

medical/

care/

staff/

notifications/

ai/

admin/

lib/

hooks/

types/

styles/

---

# 75. DEVELOPMENT COMMANDS

Provide simple commands.

Prefer Makefile or scripts:

make dev

make down

make logs

make migrate

make seed

make test

make lint

make reset-db

If Make unavailable on Windows, also document direct commands.

---

# 76. TESTING

Backend tests must cover:

register

login

refresh

RBAC

customer cannot access other customer's pet

caregiver cannot access unassigned pet

veterinarian permissions

receptionist permissions

admin permissions

pet creation

membership

appointment

staff assignment

schedule conflict

check-in

care session

medical record

prescription

vaccination

passport

timeline

document confirmation

QR privacy

Lost Pet

notifications

AI fallback

ownership transfer

---

# 77. FRONTEND QUALITY

Run:

lint

typecheck

build

Fix all critical issues.

No unresolved imports.

No fake API calls in final implementation.

No permanent mock arrays in production pages.

---

# 78. END-TO-END CRITICAL DEMO

The project is not complete until this works:

Customer login

→ Create Milo

→ Open Passport

→ Upload avatar

→ Add vaccine

→ Book grooming

→ Receptionist receives it

→ Receptionist confirms

→ Assign caregiver

→ Customer sees assignment realtime

→ Check in Milo

→ Caregiver sees appointment

→ Caregiver sees Care Brief

→ Caregiver starts care

→ Updates bathing

→ Customer sees realtime

→ Upload care photo

→ Complete session

→ Care Report created

→ Customer sees report

→ Timeline updates

→ Digital Passport updates

→ Notification created

→ Admin dashboard reflects completion

All against the same PostgreSQL data.

---

# 79. VETERINARY CRITICAL DEMO

Customer books veterinary consultation.

Receptionist confirms.

Assign veterinarian.

Veterinarian opens pet.

See:

history

allergy

medication

vaccination

timeline

Veterinarian creates medical record.

Creates prescription.

Customer sees:

new medical record

prescription

updated Passport

notification

timeline.

---

# 80. DOCUMENT CRITICAL DEMO

Customer uploads vaccine certificate.

Worker processes.

AI provider extracts structured information.

Status becomes PENDING_REVIEW.

Customer reviews.

Customer confirms.

Vaccination record is created.

Passport updates.

Timeline updates.

Reminder generated.

---

# 81. QR DEMO

Customer generates Emergency QR.

Open public page without login.

Verify private information is hidden.

Activate Lost Pet Mode.

Finder submits location/message.

Customer gets notification.

---

# 82. UI COMPLETENESS

Every important page must have:

loading state

success state

empty state

error state

permission denied state

Do not leave broken blank screens.

---

# 83. ERROR RECOVERY

If command fails:

read error

find cause

fix

rerun relevant check

continue.

Do not rerun same command endlessly.

---

# 84. NO FAKE SUCCESS

Never say feature works unless code exists.

Never claim tests pass without running tests.

Never claim Docker works without validating.

Never claim realtime exists if UI only changes locally.

---

# 85. NO PLACEHOLDER POLICY

Do not leave core functionality as:

TODO

Coming Soon

Placeholder

Mock Only

Implement Later

Optional advanced features may be documented as V2.

---

# 86. BUILD PRIORITY

If tradeoffs are needed:

1. Database correctness
2. Authentication
3. Authorization
4. Core business workflow
5. Realtime
6. Medical/Care records
7. Passport
8. Notifications
9. Frontend completeness
10. AI
11. Analytics
12. Visual polish

---

# 87. PHASES

Execute automatically.

## PHASE 0

Architecture

ERD

role matrix

API map

UX route map

Docker plan

PROJECT_STATUS

## PHASE 1

Repository

Docker

Backend bootstrap

Frontend bootstrap

Database

Redis

Health

## PHASE 2

Auth

User

Roles

RBAC

Layouts

Role routing

## PHASE 3

Pets

Ownership

Passport

Timeline

Vaccination

Medication

Weight

## PHASE 4

Veterinarian

Medical records

Prescription

Documents

## PHASE 5

Services

Staff

Schedules

Appointments

Matching

## PHASE 6

Care sessions

Care events

Realtime

Outbox

Notifications

## PHASE 7

QR

Lost Pet

Sharing

Ownership Transfer

## PHASE 8

AI Provider

Chat

Care Brief

Care Report

Medical Summary

Health Insight

Document extraction

## PHASE 9

Payment

Analytics

Audit

Settings

## PHASE 10

UX polish

Responsive

Accessibility

Error/Empty states

## PHASE 11

Tests

Build

Migrations

Clean DB test

Docker verification

Security checks

## PHASE 12

README

Setup

Demo accounts

Known limitations

Final validation

Do not stop between phases for approval.

---

# 88. FINAL ACCEPTANCE

Do not call project complete until:

Backend starts.

Frontend starts.

Database works.

Redis works.

Migration works.

Seed works.

All roles login.

Role redirects work.

Permissions work.

Customer flow works.

Receptionist flow works.

Veterinarian flow works.

Caregiver flow works.

Admin works.

Appointment works.

Medical record works.

Prescription works.

Passport works.

Timeline works.

Realtime works.

Notifications work.

QR works.

Lost Pet works.

AI fallback works.

Document review works.

Frontend builds.

Critical tests pass.

README is accurate.

---

# 89. FINAL REPORT

After implementation provide:

Completed Features

Architecture

Folder Structure

Database summary

Run commands

Docker commands

Migration command

Seed command

Demo accounts

AI configuration

Tests actually run

Test results

Known limitations

Do not provide just a plan.

---

# 90. START NOW

Inspect current repository.

If empty:

create project.

If code already exists:

audit before changing it.

Create PROJECT_STATUS.md.

Build Phase 0.

Then continue automatically into all implementation phases.

Do not stop after architecture.

Do not ask for permission to continue.

Implement the system.
