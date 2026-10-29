import os
import sys
import uuid
import datetime
from datetime import datetime, timezone, timedelta, date

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '.')))

from app.core.database import SessionLocal
from app.models.user import User
from app.models.pet import (
    Pet, Allergy, Condition, Weight, Vaccination, Medication, MedicalRecord,
    PetDocument, LostPetReport, TimelineEvent, EventType
)
from app.models.appointment import Appointment, Service, AppointmentService, AppointmentStatus
from app.models.payment import Payment, PaymentStatus, PaymentMethod
from app.models.care_session import CareSession, CareSessionStatus, CareEvent, CareEventType, CareReport
from app.models.prescription import Prescription, PrescriptionItem
from app.models.ai_conversation import AiConversation, AiMessage
from app.models.audit_log import AuditLog

def seed_all():
    db = SessionLocal()
    now = datetime.now(timezone.utc)
    today = date.today()

    try:
        # Find users
        customer = db.query(User).filter(User.email.in_(["customer01@petcare.local", "customer@petcare.com", "customer@petcare.local"])).first()
        doctor = db.query(User).filter(User.email.in_(["doctor@petcare.local", "doctor@petcare.com"])).first()
        caregiver = db.query(User).filter(User.email.in_(["caregiver@petcare.local", "caregiver@petcare.com"])).first()
        receptionist = db.query(User).filter(User.email.in_(["reception@petcare.local", "receptionist@petcare.com"])).first()
        admin = db.query(User).filter(User.email.in_(["admin@petcare.local", "admin@petcare.com"])).first()

        # Find pets
        milo = db.query(Pet).filter(Pet.name == "Milo").first()
        luna = db.query(Pet).filter(Pet.name == "Luna").first()

        if not customer or not milo:
            print("Missing customer or pet, aborting.")
            return

        print("Seeding full data for all tables...")

        # 1. AI Conversations & Messages
        if db.query(AiConversation).count() == 0:
            conv1 = AiConversation(
                id=uuid.uuid4(),
                user_id=customer.id,
                pet_id=milo.id,
                title="Tư vấn dinh dưỡng cho chó Golden Retriever con",
                created_at=now - timedelta(days=2),
                updated_at=now - timedelta(days=2)
            )
            db.add(conv1)
            db.flush()

            db.add(AiMessage(
                id=uuid.uuid4(),
                conversation_id=conv1.id,
                role="user",
                content="Bé Milo nhà mình 5 tháng tuổi, gần đây hơi biếng ăn hạt khô thì nên khắc phục thế nào?",
                created_at=now - timedelta(days=2, hours=-1)
            ))
            db.add(AiMessage(
                id=uuid.uuid4(),
                conversation_id=conv1.id,
                role="assistant",
                content="Chào bạn! Với Golden Retriever 5 tháng tuổi, bạn có thể ngâm ấm hạt với nước dùng gà/bò không gia vị, hoặc trộn thêm một ít Pate chuyên dụng Royal Canin Puppy để kích thích khứu giác của bé nhé.",
                created_at=now - timedelta(days=2, hours=-2)
            ))

            conv2 = AiConversation(
                id=uuid.uuid4(),
                user_id=customer.id,
                pet_id=luna.id if luna else None,
                title="Hỏi về hiện tượng mèo nôn búi lông (Hairball)",
                created_at=now - timedelta(days=1),
                updated_at=now - timedelta(days=1)
            )
            db.add(conv2)
            db.flush()

            db.add(AiMessage(
                id=uuid.uuid4(),
                conversation_id=conv2.id,
                role="user",
                content="Mèo Luna hay liếm lông và sáng nay nôn ra một cục lông nhỏ, có nguy hiểm không bác sĩ AI?",
                created_at=now - timedelta(days=1, hours=-1)
            ))
            db.add(AiMessage(
                id=uuid.uuid4(),
                conversation_id=conv2.id,
                role="assistant",
                content="Đây là phản xạ tự nhiên của loài mèo khi làm sạch cơ thể. Tuy nhiên bạn nên cho bé dùng thêm Gel tiêu lông (như GimCat) hoặc cỏ mèo 2 lần/tuần để tránh tắc ruột nhé!",
                created_at=now - timedelta(days=1, hours=-2)
            ))
            print("Seeded AI conversations and messages.")

        # 2. Appointments & Appointment Services
        appt1 = db.query(Appointment).first()
        if not appt1:
            appt1 = Appointment(
                id=uuid.uuid4(),
                pet_id=milo.id,
                customer_id=customer.id,
                status=AppointmentStatus.CONFIRMED,
                start_time=now + timedelta(days=1, hours=2),
                end_time=now + timedelta(days=1, hours=3),
                notes="Khám tổng quát và tắm spa định kỳ"
            )
            db.add(appt1)
            db.flush()

        appt2 = db.query(Appointment).filter(Appointment.id != appt1.id).first()
        if not appt2:
            appt2 = Appointment(
                id=uuid.uuid4(),
                pet_id=luna.id if luna else milo.id,
                customer_id=customer.id,
                status=AppointmentStatus.COMPLETED,
                start_time=now - timedelta(days=3),
                end_time=now - timedelta(days=3, hours=-1),
                notes="Tiêm vaccine nhắc lại"
            )
            db.add(appt2)
            db.flush()

        # 3. Payments
        if db.query(Payment).count() == 0:
            db.add(Payment(
                id=uuid.uuid4(),
                appointment_id=appt1.id,
                amount=400000.0,
                status=PaymentStatus.COMPLETED,
                payment_method=PaymentMethod.BANK_TRANSFER,
                transaction_id="TXN-VIETQR-88231",
                notes="Thanh toán chuyển khoản VietQR dịch vụ khám & spa",
                created_at=now - timedelta(days=1)
            ))
            db.add(Payment(
                id=uuid.uuid4(),
                appointment_id=appt2.id,
                amount=350000.0,
                status=PaymentStatus.COMPLETED,
                payment_method=PaymentMethod.CASH,
                transaction_id="TXN-CASH-1092",
                notes="Thanh toán tiền mặt tại quầy lễ tân",
                created_at=now - timedelta(days=3)
            ))
            print("Seeded payments.")

        # 4. Care Sessions, Events, Reports
        if db.query(CareSession).count() == 0:
            session = CareSession(
                id=uuid.uuid4(),
                appointment_id=appt1.id,
                caregiver_id=caregiver.id if caregiver else customer.id,
                status=CareSessionStatus.COMPLETED,
                started_at=now - timedelta(hours=4),
                ended_at=now - timedelta(hours=2),
                created_at=now - timedelta(hours=5)
            )
            db.add(session)
            db.flush()

            db.add(CareEvent(
                id=uuid.uuid4(),
                session_id=session.id,
                event_type=CareEventType.TEXT,
                content="Bắt đầu phiên chăm sóc: Chải lông tơ, kiểm tra móng và vệ sinh tai.",
                timestamp=now - timedelta(hours=4)
            ))
            db.add(CareEvent(
                id=uuid.uuid4(),
                session_id=session.id,
                event_type=CareEventType.PHOTO,
                content="Tắm sấy bằng dầu gội dịu nhẹ thảo dược cho da nhạy cảm.",
                media_url="https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=600",
                timestamp=now - timedelta(hours=3)
            ))
            db.add(CareEvent(
                id=uuid.uuid4(),
                session_id=session.id,
                event_type=CareEventType.TEXT,
                content="Bé rất hợp tác, sấy khô hoàn toàn và thưởng bánh thưởng gan.",
                timestamp=now - timedelta(hours=2)
            ))

            db.add(CareReport(
                id=uuid.uuid4(),
                session_id=session.id,
                summary="Bé Milo đã hoàn thành liệu trình Spa 5 sao. Bộ lông vàng mượt, da sạch không còn vảy gàu.",
                health_metrics_json={"weight_kg": 28.5, "temperament": "Vui vẻ, ngoan", "skin_condition": "Khỏe mạnh"},
                recommendations="Chải lông hàng ngày và tắm lại sau 2-3 tuần.",
                created_at=now - timedelta(hours=2)
            ))
            print("Seeded care sessions, events, reports.")

        # 5. Medical Records, Prescriptions, Prescription Items
        med_rec = db.query(MedicalRecord).first()
        if not med_rec:
            med_rec = MedicalRecord(
                id=uuid.uuid4(),
                pet_id=milo.id,
                visit_date=today - timedelta(days=7),
                clinic="Bệnh viện Thú Y PetCare AI Clinic",
                veterinarian=doctor.full_name if doctor else "BS. Trần Văn Bác",
                diagnosis="Viêm da dị ứng cơ địa nhẹ do thời tiết nồm ẩm",
                treatment="Kê kháng sinh Cefalexin và dầu tắm kháng khuẩn",
                created_at=now - timedelta(days=7)
            )
            db.add(med_rec)
            db.flush()

        if db.query(Prescription).count() == 0:
            presc = Prescription(
                id=uuid.uuid4(),
                pet_id=milo.id,
                veterinarian_id=doctor.id if doctor else customer.id,
                medical_record_id=med_rec.id,
                notes="Uống sau bữa ăn no 15 phút. Theo dõi phản ứng nếu có nôn ói.",
                created_at=now - timedelta(days=7)
            )
            db.add(presc)
            db.flush()

            db.add(PrescriptionItem(
                id=uuid.uuid4(),
                prescription_id=presc.id,
                medication_name="Cefalexin 250mg",
                dosage="1 viên / lần",
                frequency="2 lần / ngày (sáng - tối)",
                duration_days=7,
                instructions="Uống sau khi ăn"
            ))
            db.add(PrescriptionItem(
                id=uuid.uuid4(),
                prescription_id=presc.id,
                medication_name="Men vi sinh Bioline A+",
                dosage="1 gói / ngày",
                frequency="1 lần / ngày",
                duration_days=10,
                instructions="Trộn chung vào thức ăn hạt"
            ))
            print("Seeded prescriptions and prescription items.")

        # 6. Medications table
        if db.query(Medication).count() == 0:
            db.add(Medication(
                id=uuid.uuid4(),
                pet_id=milo.id,
                name="Cefalexin 250mg",
                dosage="250mg",
                frequency="2 lần/ngày",
                start_date=today - timedelta(days=7),
                end_date=today,
                notes="Đang dùng theo đơn điều trị viêm da"
            ))
            db.add(Medication(
                id=uuid.uuid4(),
                pet_id=milo.id,
                name="NexGard Spectra (Ve rận & Giun tim)",
                dosage="1 viên nhai",
                frequency="1 lần / tháng",
                start_date=today - timedelta(days=15),
                end_date=today + timedelta(days=15),
                notes="Bảo vệ toàn diện định kỳ hàng tháng"
            ))
            print("Seeded medications.")

        # 7. Pet Allergies & Conditions
        if db.query(Allergy).count() == 0:
            db.add(Allergy(
                id=uuid.uuid4(),
                pet_id=milo.id,
                name="Dị ứng tôm cua / hải sản",
                severity="MODERATE",
                notes="Ăn vào có biểu hiện gãi nhiều vùng cổ và quanh miệng"
            ))
            if luna:
                db.add(Allergy(
                    id=uuid.uuid4(),
                    pet_id=luna.id,
                    name="Dị ứng khói thuốc lá",
                    severity="MILD",
                    notes="Hắt hơi khi tiếp xúc mùi khói thuốc"
                ))
            print("Seeded allergies.")

        if db.query(Condition).count() == 0:
            db.add(Condition(
                id=uuid.uuid4(),
                pet_id=milo.id,
                name="Viêm da dị ứng theo mùa",
                diagnosed_date=today - timedelta(days=60),
                is_chronic=True,
                notes="Cần giữ lông khô ráo và dùng sữa tắm thảo dược"
            ))
            print("Seeded conditions.")

        # 8. Weight Records
        if db.query(Weight).count() == 0:
            db.add(Weight(
                id=uuid.uuid4(),
                pet_id=milo.id,
                weight_kg=26.5,
                recorded_at=now - timedelta(days=60),
                notes="Khám sức khỏe 4 tháng tuổi"
            ))
            db.add(Weight(
                id=uuid.uuid4(),
                pet_id=milo.id,
                weight_kg=28.2,
                recorded_at=now - timedelta(days=30),
                notes="Cân định kỳ trước khi tiêm phòng"
            ))
            db.add(Weight(
                id=uuid.uuid4(),
                pet_id=milo.id,
                weight_kg=29.8,
                recorded_at=now - timedelta(days=2),
                notes="Thể trọng chuẩn, cơ bắp phát triển tốt"
            ))
            print("Seeded weights.")

        # 9. Pet Timeline
        if db.query(TimelineEvent).count() == 0:
            db.add(TimelineEvent(
                id=uuid.uuid4(),
                pet_id=milo.id,
                event_type=EventType.GENERAL,
                event_date=now - timedelta(days=365),
                title="Chào đời tại trại giống PetCare",
                description="Bé Milo sinh ra khỏe mạnh, lông vàng kim rực rỡ."
            ))
            db.add(TimelineEvent(
                id=uuid.uuid4(),
                pet_id=milo.id,
                event_type=EventType.VACCINATION,
                event_date=now - timedelta(days=200),
                title="Hoàn thành mũi tiêm vắc-xin 7 bệnh",
                description="Tiêm tại phòng khám PetCare AI Clinic, phản ứng tốt không sốt."
            ))
            db.add(TimelineEvent(
                id=uuid.uuid4(),
                pet_id=milo.id,
                event_type=EventType.GROOMING,
                event_date=now - timedelta(days=14),
                title="Cắt tỉa tạo kiểu lông mùa hè",
                description="Cắt tỉa gọn gàng vùng bụng, kẽ chân và vệ sinh tai."
            ))
            print("Seeded timeline.")

        # 10. Pet Documents
        if db.query(PetDocument).count() == 0:
            db.add(PetDocument(
                id=uuid.uuid4(),
                pet_id=milo.id,
                title="Phiếu kết quả xét nghiệm máu tổng quát",
                document_type="LAB_RESULT",
                file_url="uploads/phieu_xet_nghiem_mau_milo.png",
                upload_date=now - timedelta(days=7),
                ai_summary="Các chỉ số sinh hóa máu hồng cầu, bạch cầu, men gan thận hoàn toàn bình thường.",
                status="CONFIRMED",
                extracted_data={"RBC": "6.8 M/uL", "WBC": "11.2 K/uL", "ALT": "32 U/L", "Creatinine": "0.9 mg/dL"}
            ))
            print("Seeded pet documents.")

        # 11. Lost Pet Reports
        if db.query(LostPetReport).count() == 0:
            db.add(LostPetReport(
                id=uuid.uuid4(),
                pet_id=milo.id,
                reported_by=None,
                contact_phone="0912 345 678",
                contact_email="nguoidan.totbung@gmail.com",
                last_seen_location="Công viên Cầu Giấy, gần đài phun nước",
                last_seen_time=now - timedelta(days=5),
                message="Tôi thấy bé đang đi dạo và quét thử mã QR trên vòng cổ. Bé đang được bác bảo vệ công viên trông giúp nhé!",
                is_resolved=True,
                created_at=now - timedelta(days=5)
            ))
            print("Seeded lost pet reports.")

        # 12. Audit Logs
        if db.query(AuditLog).count() == 0:
            db.add(AuditLog(
                id=uuid.uuid4(),
                user_id=customer.id,
                action="LOGIN_SUCCESS",
                resource_type="AUTH",
                resource_id=str(customer.id),
                details={"ip": "127.0.0.1", "device": "Windows / Chrome"},
                ip_address="127.0.0.1",
                created_at=now - timedelta(hours=1)
            ))
            db.add(AuditLog(
                id=uuid.uuid4(),
                user_id=doctor.id if doctor else customer.id,
                action="UPDATE_MEDICAL_RECORD",
                resource_type="MEDICAL_RECORD",
                resource_id=str(milo.id),
                details={"note": "Cập nhật kết quả xét nghiệm máu"},
                ip_address="127.0.0.1",
                created_at=now - timedelta(days=7)
            ))
            db.add(AuditLog(
                id=uuid.uuid4(),
                user_id=admin.id if admin else customer.id,
                action="BACKUP_DATABASE",
                resource_type="SYSTEM",
                resource_id="backup_snapshot_auto",
                details={"status": "SUCCESS", "size_mb": 42.5},
                ip_address="127.0.0.1",
                created_at=now - timedelta(hours=8)
            ))
            print("Seeded audit logs.")

        db.commit()
        print("All tables successfully seeded with rich realistic data!")

    finally:
        db.close()

if __name__ == "__main__":
    seed_all()
