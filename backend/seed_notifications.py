import os
import sys
import uuid
from datetime import datetime, timezone, timedelta

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '.')))

from app.core.database import SessionLocal
from app.models.user import User, Role
from app.models.notification import Notification, NotificationType

def seed_notifications():
    db = SessionLocal()
    try:
        users = db.query(User).all()
        print(f"Found {len(users)} users.")

        now = datetime.now(timezone.utc)

        notifications_data = {
            "CUSTOMER": [
                {
                    "type": NotificationType.APPOINTMENT,
                    "title": "Lịch hẹn Spa & Grooming cho Milo đã được xác nhận! 🐾",
                    "message": "Phòng khám PetCare đã xác nhận lịch hẹn chăm sóc bộ lông cho bé Milo lúc 09:30 ngày mai. Vui lòng đưa bé đến đúng giờ nhé!",
                    "is_read": False,
                    "action_url": "/customer/appointments",
                    "delta_hours": 1
                },
                {
                    "type": NotificationType.MEDICAL,
                    "title": "Nhắc lịch tiêm Vaccine dại (Rabies) định kỳ 💉",
                    "message": "Bé Milo sắp đến hạn tiêm nhắc lại mũi Vaccine phòng dại (còn 5 ngày). Hãy đặt lịch trước để bé luôn được bảo vệ tối ưu.",
                    "is_read": False,
                    "action_url": "/customer/passport",
                    "delta_hours": 3
                },
                {
                    "type": NotificationType.MEDICAL,
                    "title": "Bác sĩ đã kê đơn thuốc phục hồi đường ruột cho bé Luna",
                    "message": "Đơn thuốc men vi sinh Bioline và hướng dẫn chăm sóc sau khám của Bác sĩ đã được cập nhật vào Digital Passport.",
                    "is_read": False,
                    "action_url": "/customer/passport",
                    "delta_hours": 8
                },
                {
                    "type": NotificationType.PAYMENT,
                    "title": "Đơn hàng Pet Shop #PC-9842 đã hoàn tất thanh toán ✅",
                    "message": "Gói Hạt Royal Canin Golden Retriever Puppy (12kg) và Pate cá hồi đang được đóng gói giao hỏa tốc đến bạn.",
                    "is_read": True,
                    "action_url": "/shop",
                    "delta_hours": 24
                },
                {
                    "type": NotificationType.SYSTEM,
                    "title": "Chào mừng bạn đến với Hệ sinh thái PetCare AI!",
                    "message": "Bạn đã kích hoạt thành công hồ sơ y bạ số (Digital Passport) và Mã QR khẩn cấp gắn vòng cổ cho thú cưng.",
                    "is_read": True,
                    "action_url": "/customer/passport",
                    "delta_hours": 48
                }
            ],
            "RECEPTIONIST": [
                {
                    "type": NotificationType.APPOINTMENT,
                    "title": "Khách hàng mới đặt lịch hẹn online: Bé Corgi Mochi",
                    "message": "Khách hàng Trần Hải Đăng vừa đặt lịch Khám tổng quát & Tiêm phòng lúc 14:00 hôm nay. Vui lòng xác nhận ca khám.",
                    "is_read": False,
                    "action_url": "/receptionist/appointments",
                    "delta_hours": 0.5
                },
                {
                    "type": NotificationType.APPOINTMENT,
                    "title": "Khách hàng check-in tại quầy: Bé Milo",
                    "message": "Chủ nuôi Lý Thiên Hương đã đưa bé Milo đến phòng khám lúc 09:15. Bác sĩ thú y đã sẵn sàng tiếp nhận.",
                    "is_read": False,
                    "action_url": "/receptionist/customers",
                    "delta_hours": 2
                },
                {
                    "type": NotificationType.PAYMENT,
                    "title": "Hóa đơn dịch vụ #INV-2045 cần thanh toán",
                    "message": "Ca khám và xét nghiệm máu cho bé Luna đã hoàn tất. Tổng số tiền: 450.000 VNĐ. Khách chọn chuyển khoản QR VietQR.",
                    "is_read": False,
                    "action_url": "/receptionist/payments",
                    "delta_hours": 4
                },
                {
                    "type": NotificationType.SYSTEM,
                    "title": "Bàn giao ca trực sáng: Đã tiếp nhận 12 thú cưng",
                    "message": "Tất cả các ca khám sáng đã được phân bổ cho BS. Bác và đội ngũ Điều dưỡng chăm sóc.",
                    "is_read": True,
                    "action_url": "/receptionist",
                    "delta_hours": 12
                }
            ],
            "VETERINARIAN": [
                {
                    "type": NotificationType.MEDICAL,
                    "title": "Ca khám sắp tới: Milo (Golden Retriever) lúc 10:00 🩺",
                    "message": "Lý do khám: Tái khám viêm da dị ứng và kiểm tra thể trọng định kỳ. Thú cưng có tiền sử nhạy cảm với hải sản.",
                    "is_read": False,
                    "action_url": "/veterinarian",
                    "delta_hours": 1
                },
                {
                    "type": NotificationType.MEDICAL,
                    "title": "Cảnh báo AI Vet Assistant: Tương tác thuốc Penicillin ⚠️",
                    "message": "AI phát hiện cảnh báo tương tác thuốc trên hồ sơ bệnh án số #MR-881. Khuyến nghị Bác sĩ cân nhắc đổi sang Cephalexin 250mg.",
                    "is_read": False,
                    "action_url": "/veterinarian/prescriptions",
                    "delta_hours": 3
                },
                {
                    "type": NotificationType.MEDICAL,
                    "title": "Kết quả xét nghiệm máu sinh hóa mới: Bé Mèo Luna",
                    "message": "Chỉ số ALT/AST gan và Creatinine bình thường. Bạch cầu hơi tăng nhẹ, phù hợp chẩn đoán viêm ruột cấp tính.",
                    "is_read": False,
                    "action_url": "/veterinarian/patients",
                    "delta_hours": 5
                },
                {
                    "type": NotificationType.APPOINTMENT,
                    "title": "Đã cập nhật lịch tái khám sau 7 ngày",
                    "message": "Hệ thống đã tự động gửi lịch hẹn tái khám và hướng dẫn theo dõi phản ứng thuốc về app của chủ nuôi.",
                    "is_read": True,
                    "action_url": "/veterinarian/schedule",
                    "delta_hours": 20
                }
            ],
            "CAREGIVER": [
                {
                    "type": NotificationType.CARE_SESSION,
                    "title": "Phân công ca tắm & Grooming: Bé Milo (Golden Retriever) 🛁",
                    "message": "Thời gian: 10:30 hôm nay. Yêu cầu: Sử dụng dầu gội dịu nhẹ da mẫn cảm và chải lông tơ kỹ trước khi sấy.",
                    "is_read": False,
                    "action_url": "/caregiver/sessions",
                    "delta_hours": 1
                },
                {
                    "type": NotificationType.CARE_SESSION,
                    "title": "Nhắc nhở ca lưu chuồng (Boarding): Bé Luna chuồng B02",
                    "message": "Bé đã ăn hết khẩu phần hạt lúc 08:00. Vui lòng kiểm tra khay nước sạch và dọn vệ sinh khay cát lúc 11:30.",
                    "is_read": False,
                    "action_url": "/caregiver",
                    "delta_hours": 2
                },
                {
                    "type": NotificationType.CARE_SESSION,
                    "title": "Chủ nuôi gửi yêu cầu xem ảnh/video cập nhật",
                    "message": "Khách hàng muốn xem bé Milo đang vui chơi tại khu vận động. Vui lòng chụp 1 tấm ảnh và gửi báo cáo ca trực.",
                    "is_read": False,
                    "action_url": "/caregiver/reports",
                    "delta_hours": 4
                },
                {
                    "type": NotificationType.SYSTEM,
                    "title": "Đã hoàn thành 8 phiên chăm sóc hôm nay 🎉",
                    "message": "Tất cả các bé đều có thể trạng tốt, vui vẻ và nhận được đánh giá 5 sao từ chủ nuôi.",
                    "is_read": True,
                    "action_url": "/caregiver/sessions",
                    "delta_hours": 16
                }
            ],
            "ADMIN": [
                {
                    "type": NotificationType.SYSTEM,
                    "title": "Báo cáo doanh thu & Hoạt động 24h: Đạt 15.800.000 VNĐ 📈",
                    "message": "Hôm nay toàn hệ thống phục vụ 28 lượt khám và bán 14 đơn hàng Pet Shop. Doanh thu tăng 18.5% so với ngày trước.",
                    "is_read": False,
                    "action_url": "/admin/reports",
                    "delta_hours": 1
                },
                {
                    "type": NotificationType.SYSTEM,
                    "title": "Cảnh báo tồn kho Pet Shop: 2 sản phẩm sắp hết hàng ⚠️",
                    "message": "Hạt Royal Canin Maxi Puppy (tồn kho: 2 bao) và Sữa tắm Bio Derma (tồn kho: 3 chai). Vui lòng nhập thêm hàng.",
                    "is_read": False,
                    "action_url": "/admin/products",
                    "delta_hours": 3
                },
                {
                    "type": NotificationType.SYSTEM,
                    "title": "Sao lưu cơ sở dữ liệu PostgreSQL tự động thành công",
                    "message": "Bản snapshot sao lưu DB dung lượng 42MB đã được lưu trữ an toàn lúc 03:00 sáng nay.",
                    "is_read": True,
                    "action_url": "/admin/audit",
                    "delta_hours": 8
                },
                {
                    "type": NotificationType.SYSTEM,
                    "title": "Đăng ký thành viên mới: 5 chủ nuôi mới tham gia",
                    "message": "5 tài khoản khách hàng mới đã xác thực số điện thoại và kích hoạt sổ Digital Passport cho thú cưng.",
                    "is_read": True,
                    "action_url": "/admin/users",
                    "delta_hours": 24
                }
            ]
        }

        # Clear old notifications to ensure fresh realistic data
        db.query(Notification).delete()
        db.commit()

        total_seeded = 0
        for user in users:
            # Determine role
            user_roles = [r.name for r in user.roles]
            role = "CUSTOMER"
            if "ADMIN" in user_roles:
                role = "ADMIN"
            elif "VETERINARIAN" in user_roles:
                role = "VETERINARIAN"
            elif "CAREGIVER" in user_roles:
                role = "CAREGIVER"
            elif "RECEPTIONIST" in user_roles:
                role = "RECEPTIONIST"
            elif "CUSTOMER" in user_roles:
                role = "CUSTOMER"

            items = notifications_data.get(role, notifications_data["CUSTOMER"])
            for item in items:
                created_at = now - timedelta(hours=item["delta_hours"])
                notif = Notification(
                    id=uuid.uuid4(),
                    user_id=user.id,
                    type=item["type"],
                    title=item["title"],
                    message=item["message"],
                    is_read=item["is_read"],
                    action_url=item["action_url"],
                    created_at=created_at
                )
                db.add(notif)
                total_seeded += 1

        db.commit()
        print(f"Successfully seeded {total_seeded} notifications across {len(users)} users and all actor roles!")

    finally:
        db.close()

if __name__ == "__main__":
    seed_notifications()
