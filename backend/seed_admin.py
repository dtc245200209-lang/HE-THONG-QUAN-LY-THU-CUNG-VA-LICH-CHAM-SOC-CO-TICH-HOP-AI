import asyncio
from app.core.database import SessionLocal
from app.models.user import User, Role
from app.core.security import get_password_hash

def seed_admin():
    db = SessionLocal()
    try:
        # Create standard roles if they don't exist
        standard_roles = ["ADMIN", "RECEPTIONIST", "VETERINARIAN", "CAREGIVER", "CUSTOMER"]
        role_objects = {}
        for role_name in standard_roles:
            role = db.query(Role).filter(Role.name == role_name).first()
            if not role:
                role = Role(name=role_name, description=f"{role_name} role")
                db.add(role)
                db.commit()
                db.refresh(role)
            role_objects[role_name] = role

        # Check if admin already exists
        admin_email = "admin@petcare.com"
        admin = db.query(User).filter(User.email == admin_email).first()
        
        if not admin:
            admin = User(
                email=admin_email,
                hashed_password=get_password_hash("admin123"),
                full_name="System Admin",
                is_active=True
            )
            admin.roles.append(role_objects["ADMIN"])
            db.add(admin)
            db.commit()
            print("Admin account created successfully!")
            print(f"Email: {admin_email}")
            print("Password: admin123")
        else:
            print("Admin account already exists.")
            print(f"Email: {admin_email}")
            print("Password: admin123")
            
    finally:
        db.close()

if __name__ == "__main__":
    seed_admin()
