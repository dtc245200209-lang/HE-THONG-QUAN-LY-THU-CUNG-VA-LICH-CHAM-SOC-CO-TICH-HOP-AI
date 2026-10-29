import os
from celery import Celery
from app.core.config import settings

# Create celery application
celery_worker = Celery(
    "petcare_worker",
    broker=f"redis://{settings.REDIS_HOST}:{settings.REDIS_PORT}/0",
    backend=f"redis://{settings.REDIS_HOST}:{settings.REDIS_PORT}/0"
)

celery_worker.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Ho_Chi_Minh",
    enable_utc=True,
)

def run_smart_reminders_sync():
    """
    Core business logic for generating automated smart reminders
    for vaccinations, medications, and appointments.
    """
    from app.core.database import SessionLocal
    from app.models.pet import Pet, Vaccination, Medication, PetMembership, MembershipRole
    from app.models.appointment import Appointment, AppointmentStatus
    from app.models.notification import Notification, NotificationType
    from datetime import date, timedelta, datetime, timezone
    
    db = SessionLocal()
    created_count = 0
    today = date.today()
    in_7_days = today + timedelta(days=7)
    
    try:
        # 1. Upcoming vaccinations (next_due_date within 7 days)
        upcoming_vaccines = db.query(Vaccination).filter(
            Vaccination.next_due_date.isnot(None),
            Vaccination.next_due_date >= today,
            Vaccination.next_due_date <= in_7_days
        ).all()
        for vac in upcoming_vaccines:
            pet = vac.pet
            if not pet:
                continue
            owner_m = db.query(PetMembership).filter(
                PetMembership.pet_id == pet.id,
                PetMembership.role.in_([MembershipRole.PRIMARY_OWNER, MembershipRole.CO_OWNER])
            ).all()
            for m in owner_m:
                existing = db.query(Notification).filter(
                    Notification.user_id == m.user_id,
                    Notification.title.like(f"%Nhắc lịch tiêm chủng cho {pet.name}%"),
                    Notification.created_at >= datetime.now(timezone.utc) - timedelta(days=3)
                ).first()
                if not existing:
                    notif = Notification(
                        user_id=m.user_id,
                        type=NotificationType.MEDICAL,
                        title=f"Nhắc lịch tiêm chủng cho {pet.name} 💉",
                        message=f"Bé {pet.name} sắp đến hạn tiêm nhắc lại vắc-xin '{vac.name}' vào ngày {vac.next_due_date.strftime('%d/%m/%Y')}. Vui lòng đặt lịch sớm!",
                        action_url=f"/customer/pets/{pet.id}/passport",
                        metadata_json={"pet_id": str(pet.id), "vaccine_id": str(vac.id)}
                    )
                    db.add(notif)
                    created_count += 1
        
        # 2. Active medications daily reminder
        active_meds = db.query(Medication).filter(
            Medication.start_date <= today,
            (Medication.end_date.is_(None) | (Medication.end_date >= today))
        ).all()
        for med in active_meds:
            pet = med.pet
            if not pet:
                continue
            owner_m = db.query(PetMembership).filter(
                PetMembership.pet_id == pet.id,
                PetMembership.role.in_([MembershipRole.PRIMARY_OWNER, MembershipRole.CO_OWNER])
            ).all()
            for m in owner_m:
                existing = db.query(Notification).filter(
                    Notification.user_id == m.user_id,
                    Notification.title.like(f"%Nhắc uống thuốc: {pet.name}%"),
                    Notification.created_at >= datetime.now(timezone.utc) - timedelta(hours=18)
                ).first()
                if not existing:
                    notif = Notification(
                        user_id=m.user_id,
                        type=NotificationType.MEDICAL,
                        title=f"Nhắc uống thuốc: {pet.name} 💊",
                        message=f"Đừng quên cho {pet.name} uống thuốc '{med.name}' (Liều lượng: {med.dosage or 'theo chỉ định'}, tần suất: {med.frequency or 'hàng ngày'}).",
                        action_url=f"/customer/pets/{pet.id}/passport",
                        metadata_json={"pet_id": str(pet.id), "medication_id": str(med.id)}
                    )
                    db.add(notif)
                    created_count += 1

        # 3. Upcoming appointment within 24h
        tomorrow = datetime.now(timezone.utc) + timedelta(hours=24)
        upcoming_appts = db.query(Appointment).filter(
            Appointment.status.in_([AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED]),
            Appointment.scheduled_time >= datetime.now(timezone.utc),
            Appointment.scheduled_time <= tomorrow
        ).all()
        for appt in upcoming_appts:
            existing = db.query(Notification).filter(
                Notification.user_id == appt.customer_id,
                Notification.title.like("%Lịch hẹn chăm sóc sắp diễn ra%"),
                Notification.created_at >= datetime.now(timezone.utc) - timedelta(hours=12)
            ).first()
            if not existing:
                pet_name = appt.pet.name if appt.pet else 'thú cưng'
                notif = Notification(
                    user_id=appt.customer_id,
                    type=NotificationType.APPOINTMENT,
                    title="Lịch hẹn chăm sóc sắp diễn ra 🐾",
                    message=f"Bạn có lịch hẹn chăm sóc cho {pet_name} vào lúc {appt.scheduled_time.strftime('%H:%M %d/%m/%Y')}. Vui lòng đến đúng giờ!",
                    action_url=f"/customer/appointments/{appt.id}",
                    metadata_json={"appointment_id": str(appt.id)}
                )
                db.add(notif)
                created_count += 1

        db.commit()
    finally:
        db.close()

    return {"status": "success", "reminders_created": created_count}

@celery_worker.task(name="generate_smart_reminders")
def generate_smart_reminders():
    return run_smart_reminders_sync()

@celery_worker.task(name="test_task")
def test_task():
    return "Celery worker is running successfully!"
