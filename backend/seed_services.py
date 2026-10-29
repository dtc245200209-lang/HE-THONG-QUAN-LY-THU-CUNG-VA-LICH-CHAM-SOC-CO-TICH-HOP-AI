import asyncio
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.appointment import Service, ServiceCategory

def seed_services():
    db = SessionLocal()
    try:
        # Check if services already exist
        if db.query(Service).count() == 0:
            services = [
                Service(
                    name="Khám sức khỏe tổng quát",
                    description="Kiểm tra tổng quát sức khỏe cho thú cưng",
                    category=ServiceCategory.VETERINARY,
                    base_price=200000,
                    estimated_duration_minutes=30
                ),
                Service(
                    name="Tiêm phòng vaccine",
                    description="Tiêm phòng các loại vaccine cần thiết",
                    category=ServiceCategory.VETERINARY,
                    base_price=150000,
                    estimated_duration_minutes=15
                ),
                Service(
                    name="Tắm sấy cơ bản",
                    description="Tắm, sấy khô và vệ sinh tai",
                    category=ServiceCategory.GROOMING,
                    base_price=100000,
                    estimated_duration_minutes=45
                ),
                Service(
                    name="Lưu chuồng ban ngày",
                    description="Chăm sóc thú cưng trong ngày",
                    category=ServiceCategory.BOARDING,
                    base_price=150000,
                    estimated_duration_minutes=480
                )
            ]
            db.add_all(services)
            db.commit()
            print("Đã thêm các dịch vụ mẫu thành công.")
        else:
            print("Các dịch vụ đã tồn tại trong database.")
    except Exception as e:
        print(f"Lỗi khi thêm dịch vụ: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_services()
