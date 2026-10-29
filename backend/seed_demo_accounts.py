import uuid
from app.core.database import SessionLocal
from app.models.user import User, Role
from app.core.security import get_password_hash

def seed_demo_accounts():
    db = SessionLocal()
    try:
        # Standard roles
        roles = {r.name: r for r in db.query(Role).all()}

        demo_users = [
            ("admin@petcare.local", "admin123", "Quản Trị Viên (Admin)", "ADMIN"),
            ("reception@petcare.local", "reception123", "Lễ Tân Tiếp Nhận", "RECEPTIONIST"),
            ("doctor@petcare.local", "doctor123", "Bác Sĩ Thú Y Lâm Sàng", "VETERINARIAN"),
            ("caregiver@petcare.local", "caregiver123", "Điều Dưỡng Chăm Sóc", "CAREGIVER"),
            ("customer@petcare.local", "customer123", "Chủ Thú Cưng Mẫu", "CUSTOMER"),
            # Also ensure .com aliases work
            ("admin@petcare.com", "admin123", "System Admin", "ADMIN"),
            ("receptionist@petcare.com", "reception123", "Phạm Lễ Tân", "RECEPTIONIST"),
            ("doctor@petcare.com", "doctor123", "BS. Trần Văn Bác", "VETERINARIAN"),
            ("caregiver@petcare.com", "caregiver123", "Lê Thị Chăm Sóc", "CAREGIVER"),
            ("customer@petcare.com", "customer123", "Nguyễn Khách Hàng", "CUSTOMER"),
        ]

        for email, password, full_name, role_name in demo_users:
            role = roles.get(role_name)
            if not role:
                role = Role(id=uuid.uuid4(), name=role_name, description=f"{role_name} role")
                db.add(role)
                db.commit()
                db.refresh(role)
                roles[role_name] = role

            user = db.query(User).filter(User.email == email).first()
            if not user:
                user = User(
                    id=uuid.uuid4(),
                    email=email,
                    hashed_password=get_password_hash(password),
                    full_name=full_name,
                    is_active=True
                )
                user.roles.append(role)
                db.add(user)
                print(f"Created user: {email} with role {role_name}")
            else:
                user.hashed_password = get_password_hash(password)
                user.is_active = True
                user.full_name = full_name
                if role not in user.roles:
                    user.roles.append(role)
                print(f"Updated user: {email} with password {password} and role {role_name}")

        db.commit()
        print("All demo accounts successfully seeded and synced!")
    finally:
        db.close()

if __name__ == "__main__":
    seed_demo_accounts()
