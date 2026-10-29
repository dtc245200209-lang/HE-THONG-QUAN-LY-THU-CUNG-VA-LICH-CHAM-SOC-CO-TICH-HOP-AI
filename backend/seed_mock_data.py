import asyncio
from datetime import datetime, timedelta, timezone, date, time
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.user import User, Role
from app.models.appointment import (
    Service, ServiceCategory, CaregiverProfile, CaregiverSkill, 
    CaregiverSchedule, DayOfWeek, Appointment, AppointmentStatus, AppointmentService
)
from app.models.pet import (
    Pet, PetSpecies, PetSex, MembershipRole, PetMembership, 
    Allergy, Condition, Vaccination, MedicalRecord
)
from app.core.security import get_password_hash

def get_or_create_role(db: Session, role_name: str):
    role = db.query(Role).filter(Role.name == role_name).first()
    if not role:
        role = Role(name=role_name, description=f"{role_name} role")
        db.add(role)
        db.commit()
        db.refresh(role)
    return role

def get_or_create_service(db: Session, name: str, category: ServiceCategory, price: float, duration: int):
    service = db.query(Service).filter(Service.name == name).first()
    if not service:
        service = Service(
            name=name,
            description=f"Dịch vụ {name}",
            category=category,
            base_price=price,
            estimated_duration_minutes=duration
        )
        db.add(service)
        db.commit()
        db.refresh(service)
    return service

def seed_mock_data():
    db = SessionLocal()
    try:
        print("Bắt đầu tạo dữ liệu mẫu...")
        
        # 1. ROLES
        role_customer = get_or_create_role(db, "CUSTOMER")
        role_vet = get_or_create_role(db, "VETERINARIAN")
        role_caregiver = get_or_create_role(db, "CAREGIVER")
        role_receptionist = get_or_create_role(db, "RECEPTIONIST")

        # 2. USERS
        def create_user(email, fullname, role):
            user = db.query(User).filter(User.email == email).first()
            if not user:
                user = User(
                    email=email,
                    hashed_password=get_password_hash("password123"),
                    full_name=fullname,
                    is_active=True
                )
                user.roles.append(role)
                db.add(user)
                db.commit()
                db.refresh(user)
            return user

        customer = create_user("customer@petcare.com", "Nguyễn Khách Hàng", role_customer)
        vet = create_user("doctor@petcare.com", "BS. Trần Văn Bác", role_vet)
        caregiver = create_user("caregiver@petcare.com", "Lê Thị Chăm Sóc", role_caregiver)
        receptionist = create_user("receptionist@petcare.com", "Phạm Lễ Tân", role_receptionist)
        print("Đã tạo người dùng mẫu.")

        # 3. CAREGIVER PROFILES & SCHEDULES
        def create_profile(user, is_vet=False):
            profile = db.query(CaregiverProfile).filter(CaregiverProfile.user_id == user.id).first()
            if not profile:
                profile = CaregiverProfile(
                    user_id=user.id,
                    bio=f"Chuyên gia {'khám bệnh' if is_vet else 'chăm sóc'} thú cưng với nhiều năm kinh nghiệm.",
                    rating=4.8,
                    total_reviews=24
                )
                db.add(profile)
                db.commit()
                db.refresh(profile)
                
                # Skills
                skill_cat = ServiceCategory.VETERINARY if is_vet else ServiceCategory.GROOMING
                skill = CaregiverSkill(profile_id=profile.id, service_category=skill_cat, experience_years=5)
                db.add(skill)
                
                # Schedules (Mon - Fri, 8:00 to 17:00)
                for day in [DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY, DayOfWeek.FRIDAY]:
                    schedule = CaregiverSchedule(
                        profile_id=profile.id,
                        day_of_week=day,
                        start_time=time(8, 0),
                        end_time=time(17, 0)
                    )
                    db.add(schedule)
                db.commit()
            return profile

        vet_profile = create_profile(vet, is_vet=True)
        caregiver_profile = create_profile(caregiver, is_vet=False)
        print("Đã tạo hồ sơ nhân viên và lịch làm việc.")

        # 4. PETS
        def create_pet(owner, name, species, breed):
            pet = db.query(Pet).filter(Pet.name == name, Pet.memberships.any(user_id=owner.id)).first()
            if not pet:
                pet = Pet(
                    name=name,
                    species=species,
                    breed=breed,
                    date_of_birth=date(2021, 5, 10),
                    sex=PetSex.MALE,
                    color="Vàng",
                    neutered=True
                )
                db.add(pet)
                db.commit()
                db.refresh(pet)
                
                # Membership
                membership = PetMembership(user_id=owner.id, pet_id=pet.id, role=MembershipRole.PRIMARY_OWNER)
                db.add(membership)
                db.commit()
            return pet

        dog = create_pet(customer, "Milo", PetSpecies.DOG, "Golden Retriever")
        cat = create_pet(customer, "Luna", PetSpecies.CAT, "British Shorthair")
        print("Đã tạo thú cưng mẫu.")

        # 5. SERVICES
        service_vet = get_or_create_service(db, "Khám tổng quát", ServiceCategory.VETERINARY, 200000, 30)
        service_grooming = get_or_create_service(db, "Tắm sấy cơ bản", ServiceCategory.GROOMING, 150000, 60)

        # 6. APPOINTMENTS
        def create_appointment(customer, pet, caregiver, service, date_time, status):
            appt = db.query(Appointment).filter(Appointment.customer_id == customer.id, Appointment.scheduled_time == date_time).first()
            if not appt:
                appt = Appointment(
                    customer_id=customer.id,
                    pet_id=pet.id,
                    caregiver_id=caregiver.id,
                    scheduled_time=date_time,
                    status=status,
                    total_price=service.base_price,
                    notes="Khách đặt qua hệ thống"
                )
                db.add(appt)
                db.commit()
                db.refresh(appt)
                
                # Appointment Service
                appt_svc = AppointmentService(
                    appointment_id=appt.id,
                    service_id=service.id,
                    price_at_booking=service.base_price
                )
                db.add(appt_svc)
                db.commit()

        now = datetime.now(timezone.utc)
        
        # Lịch hẹn hoàn thành trong quá khứ
        create_appointment(customer, dog, vet, service_vet, now - timedelta(days=5), AppointmentStatus.COMPLETED)
        
        # Lịch hẹn sắp tới
        create_appointment(customer, cat, caregiver, service_grooming, now + timedelta(days=2), AppointmentStatus.CONFIRMED)
        
        # Lịch hẹn chờ xác nhận
        create_appointment(customer, dog, vet, service_vet, now + timedelta(days=3), AppointmentStatus.PENDING)
        print("Đã tạo lịch hẹn mẫu.")

        # 7. MEDICAL RECORDS
        record = db.query(MedicalRecord).filter(MedicalRecord.pet_id == dog.id).first()
        if not record:
            record = MedicalRecord(
                pet_id=dog.id,
                visit_date=date.today() - timedelta(days=5),
                clinic="PetCare Center",
                veterinarian=vet.full_name,
                diagnosis="Sức khỏe bình thường, không có dấu hiệu bệnh lý.",
                treatment="Theo dõi chế độ ăn uống, tẩy giun định kỳ."
            )
            db.add(record)
            
            vaccine = Vaccination(
                pet_id=dog.id,
                name="Rabies (Dại)",
                vaccination_date=date.today() - timedelta(days=5),
                next_due_date=date.today() + timedelta(days=360),
                clinic="PetCare Center"
            )
            db.add(vaccine)
            db.commit()
            print("Đã tạo hồ sơ bệnh án và tiêm phòng mẫu.")

        print("=== TẠO DỮ LIỆU MẪU THÀNH CÔNG ===")
        print("Tài khoản test:")
        print("Khách hàng: customer@petcare.com / password123")
        print("Bác sĩ: doctor@petcare.com / password123")
        print("Tắm tỉa: caregiver@petcare.com / password123")
        print("Lễ tân: receptionist@petcare.com / password123")

    except Exception as e:
        print(f"Lỗi khi tạo dữ liệu: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_mock_data()
