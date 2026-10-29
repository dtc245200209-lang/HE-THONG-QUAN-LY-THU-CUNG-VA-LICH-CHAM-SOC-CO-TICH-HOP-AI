import os
import sys
# Add backend directory to path if running directly
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.user import User, Role
from app.models.pet import Pet, PetSpecies, PetSex
from app.models.appointment import Service, ServiceCategory
from app.core.security import get_password_hash
import datetime

def init_db(db: Session) -> None:
    # 1. Create Roles
    roles = {
        "ADMIN": "System Administrator",
        "RECEPTIONIST": "Front Desk Receptionist",
        "VETERINARIAN": "Veterinary Doctor",
        "CAREGIVER": "Pet Caregiver",
        "CUSTOMER": "Pet Owner / Customer"
    }
    
    role_objects = {}
    for role_name, desc in roles.items():
        role = db.query(Role).filter(Role.name == role_name).first()
        if not role:
            role = Role(name=role_name, description=desc)
            db.add(role)
            db.commit()
            db.refresh(role)
        role_objects[role_name] = role
        
    # 2. Create Users
    users_data = [
        ("admin@petcare.com", "admin123", "System Admin", "ADMIN"),
        ("receptionist@petcare.com", "petcare123", "Anna Receptionist", "RECEPTIONIST"),
        ("vet@petcare.com", "petcare123", "Dr. Bob Veterinarian", "VETERINARIAN"),
        ("caregiver@petcare.com", "petcare123", "Charlie Caregiver", "CAREGIVER"),
        ("customer@petcare.com", "customer123", "David Customer", "CUSTOMER"),
    ]
    
    user_objects = {}
    for email, pwd, name, role_name in users_data:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            user = User(
                email=email,
                hashed_password=get_password_hash(pwd),
                full_name=name,
                is_active=True
            )
            user.roles.append(role_objects[role_name])
            db.add(user)
            db.commit()
            db.refresh(user)
        user_objects[role_name] = user
        
    # 3. Create Services
    services_data = [
        ("Khám tổng quát", "Khám sức khỏe định kỳ cho thú cưng", ServiceCategory.VETERINARY, 200000.0, 30),
        ("Tiêm phòng Vaccine", "Tiêm phòng 7 bệnh cơ bản", ServiceCategory.VETERINARY, 350000.0, 15),
        ("Tắm và Cắt tỉa (Grooming)", "Dịch vụ spa toàn diện", ServiceCategory.GROOMING, 400000.0, 90),
        ("Lưu chuồng (Boarding)", "Trông giữ thú cưng qua đêm", ServiceCategory.BOARDING, 150000.0, 1440),
        ("Huấn luyện cơ bản", "Dạy các lệnh cơ bản", ServiceCategory.TRAINING, 500000.0, 60),
    ]
    
    for name, desc, cat, price, duration in services_data:
        svc = db.query(Service).filter(Service.name == name).first()
        if not svc:
            svc = Service(
                name=name,
                description=desc,
                category=cat,
                base_price=price,
                estimated_duration_minutes=duration,
                is_active=True
            )
            db.add(svc)
            
    # 4. Create Pets for Customer
    from app.models.pet import PetMembership, MembershipRole
    customer = user_objects.get("CUSTOMER")
    if customer:
        pet1_membership = db.query(PetMembership).filter(PetMembership.user_id == customer.id).first()
        if not pet1_membership:
            pet1 = Pet(
                name="Milo",
                species=PetSpecies.DOG,
                breed="Golden Retriever",
                date_of_birth=datetime.date(2021, 5, 12),
                sex=PetSex.MALE,
                neutered=True,
                color="Vàng kim",
                distinguishing_marks="Đốm trắng ở ngực"
            )
            db.add(pet1)
            db.flush()
            
            pm1 = PetMembership(user_id=customer.id, pet_id=pet1.id, role=MembershipRole.PRIMARY_OWNER)
            db.add(pm1)
            
            pet2 = Pet(
                name="Luna",
                species=PetSpecies.CAT,
                breed="British Shorthair",
                date_of_birth=datetime.date(2022, 10, 5),
                sex=PetSex.FEMALE,
                neutered=True,
                color="Xám",
                distinguishing_marks="Mắt xanh"
            )
            db.add(pet2)
            db.flush()
            
            pm2 = PetMembership(user_id=customer.id, pet_id=pet2.id, role=MembershipRole.PRIMARY_OWNER)
            db.add(pm2)
            
    db.commit()
    print("Database seeding completed successfully!")

if __name__ == "__main__":
    db = SessionLocal()
    try:
        init_db(db)
    finally:
        db.close()
