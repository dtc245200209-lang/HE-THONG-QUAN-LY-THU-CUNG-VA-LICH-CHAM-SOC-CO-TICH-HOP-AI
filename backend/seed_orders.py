from datetime import datetime, timezone, timedelta
from app.core.database import SessionLocal
from app.models.user import User
from app.models.product import Product
from app.models.order import Order, OrderItem, OrderStatus


def seed_demo_orders():
    db = SessionLocal()
    try:
        customer = db.query(User).filter(User.email == "customer01@petcare.local").first()
        if not customer:
            print("Customer01 not found!")
            return

        if db.query(Order).count() > 0:
            print("Orders already seeded!")
            return

        p1 = db.query(Product).filter(Product.category == "FOOD").first()
        p2 = db.query(Product).filter(Product.category == "TOY").first()
        p3 = db.query(Product).filter(Product.category == "PATE").first()

        now = datetime.now(timezone.utc)

        # 1. ĐƠN HÀNG 1: PENDING (Chờ shop xác nhận -> Khách CÓ THỂ HỦY)
        timeline_1 = [
            {
                "step": "ORDER_PLACED",
                "status": OrderStatus.PENDING,
                "title": "Đặt hàng thành công",
                "description": "Đơn hàng đã được tạo lúc 10:15 và chuyển đến PetCare Store.",
                "time": (now - timedelta(hours=1)).isoformat(),
                "completed": True
            },
            {
                "step": "CONFIRMATION",
                "status": OrderStatus.CONFIRMED,
                "title": "Chờ shop xác nhận",
                "description": "Nhân viên PetCare đang kiểm tra đơn và chuẩn bị đóng gói.",
                "time": None,
                "completed": False
            },
            {
                "step": "SHIPPING",
                "status": OrderStatus.SHIPPING,
                "title": "Đang giao hàng",
                "description": "Chưa bàn giao.",
                "time": None,
                "completed": False
            },
            {
                "step": "DELIVERY",
                "status": OrderStatus.DELIVERED,
                "title": "Giao hàng thành công",
                "description": "Chưa giao.",
                "time": None,
                "completed": False
            }
        ]

        order_1 = Order(
            order_code="ORD-20261016-1001",
            user_id=customer.id,
            customer_name=customer.full_name or "Lý Thiên Hương",
            customer_phone="0912345678",
            customer_address="Số 45 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM",
            notes="Giao trước 18h giúp mình, bé Đen thích hạt này lắm",
            total_amount=p1.price if p1 else 395000,
            shipping_fee=0.0,
            final_amount=p1.price if p1 else 395000,
            payment_method="COD",
            payment_status="PENDING",
            status=OrderStatus.PENDING,
            tracking_timeline=timeline_1,
            created_at=now - timedelta(hours=1),
            items=[
                OrderItem(
                    product_id=p1.id if p1 else None,
                    product_name=p1.name if p1 else "Hạt Dinh Dưỡng Cao Cấp Cho Chó",
                    product_image=p1.image_url if p1 else None,
                    price=p1.price if p1 else 395000,
                    quantity=1,
                    unit=p1.unit if p1 else "Túi 4kg",
                    subtotal=p1.price if p1 else 395000
                )
            ]
        )
        db.add(order_1)

        # 2. ĐƠN HÀNG 2: SHIPPING (Đang vận chuyển -> KHÔNG THỂ HỦY NỮA)
        timeline_2 = [
            {
                "step": "ORDER_PLACED",
                "status": OrderStatus.PENDING,
                "title": "Đặt hàng thành công",
                "description": "Đơn hàng đã được tạo trên hệ thống.",
                "time": (now - timedelta(hours=5)).isoformat(),
                "completed": True
            },
            {
                "step": "CONFIRMATION",
                "status": OrderStatus.CONFIRMED,
                "title": "Shop đã xác nhận",
                "description": "Shop đã xác nhận đơn hàng thành công và đóng gói niêm phong.",
                "time": (now - timedelta(hours=4)).isoformat(),
                "completed": True
            },
            {
                "step": "SHIPPING",
                "status": OrderStatus.SHIPPING,
                "title": "Đang giao hàng",
                "description": "Bưu tá tốc hành Nguyễn Văn Tiến (0988 234 567) đang trên đường giao bưu kiện.",
                "time": (now - timedelta(hours=1)).isoformat(),
                "completed": True
            },
            {
                "step": "DELIVERY",
                "status": OrderStatus.DELIVERED,
                "title": "Giao hàng thành công",
                "description": "Dự kiến giao trong 45 phút tới.",
                "time": None,
                "completed": False
            }
        ]

        order_2 = Order(
            order_code="ORD-20261016-1002",
            user_id=customer.id,
            customer_name=customer.full_name or "Lý Thiên Hương",
            customer_phone="0912345678",
            customer_address="Số 45 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM",
            notes="Gọi điện trước khi bấm chuông",
            total_amount=(p3.price if p3 else 55000) * 2,
            shipping_fee=30000.0,
            final_amount=((p3.price if p3 else 55000) * 2) + 30000.0,
            payment_method="BANK",
            payment_status="PAID",
            status=OrderStatus.SHIPPING,
            tracking_timeline=timeline_2,
            created_at=now - timedelta(hours=5),
            items=[
                OrderItem(
                    product_id=p3.id if p3 else None,
                    product_name=p3.name if p3 else "Pate Cá Hồi Tươi Cho Mèo",
                    product_image=p3.image_url if p3 else None,
                    price=p3.price if p3 else 55000,
                    quantity=2,
                    unit=p3.unit if p3 else "Lon 85g",
                    subtotal=(p3.price if p3 else 55000) * 2
                )
            ]
        )
        db.add(order_2)

        # 3. ĐƠN HÀNG 3: DELIVERED (Đã giao hàng -> CÓ THỂ YÊU CẦU HOÀN TRẢ)
        timeline_3 = [
            {
                "step": "ORDER_PLACED",
                "status": OrderStatus.PENDING,
                "title": "Đặt hàng thành công",
                "description": "Đơn hàng đã được tạo thành công.",
                "time": (now - timedelta(days=2)).isoformat(),
                "completed": True
            },
            {
                "step": "CONFIRMATION",
                "status": OrderStatus.CONFIRMED,
                "title": "Shop đã xác nhận",
                "description": "Shop xác nhận đơn và đóng gói cẩn thận.",
                "time": (now - timedelta(days=2, hours=-1)).isoformat(),
                "completed": True
            },
            {
                "step": "SHIPPING",
                "status": OrderStatus.SHIPPING,
                "title": "Đang giao hàng",
                "description": "Bàn giao vận chuyển nhanh nội thành.",
                "time": (now - timedelta(days=1, hours=10)).isoformat(),
                "completed": True
            },
            {
                "step": "DELIVERY",
                "status": OrderStatus.DELIVERED,
                "title": "Giao hàng thành công",
                "description": "Khách hàng đã nhận hàng và thanh toán đủ tiền.",
                "time": (now - timedelta(days=1)).isoformat(),
                "completed": True
            }
        ]

        order_3 = Order(
            order_code="ORD-20261014-0988",
            user_id=customer.id,
            customer_name=customer.full_name or "Lý Thiên Hương",
            customer_phone="0912345678",
            customer_address="Số 45 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM",
            notes=None,
            total_amount=p2.price if p2 else 185000,
            shipping_fee=30000.0,
            final_amount=(p2.price if p2 else 185000) + 30000.0,
            payment_method="COD",
            payment_status="PAID",
            status=OrderStatus.DELIVERED,
            tracking_timeline=timeline_3,
            created_at=now - timedelta(days=2),
            items=[
                OrderItem(
                    product_id=p2.id if p2 else None,
                    product_name=p2.name if p2 else "Đồ Chơi Bóng Gặm KONG Rubber",
                    product_image=p2.image_url if p2 else None,
                    price=p2.price if p2 else 185000,
                    quantity=1,
                    unit=p2.unit if p2 else "Hộp",
                    subtotal=p2.price if p2 else 185000
                )
            ]
        )
        db.add(order_3)

        db.commit()
        print("Demo orders seeded successfully!")
    finally:
        db.close()


if __name__ == "__main__":
    seed_demo_orders()
