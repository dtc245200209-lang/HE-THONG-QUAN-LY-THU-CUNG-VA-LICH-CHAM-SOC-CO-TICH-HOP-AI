import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship

from app.core.database import Base


class OrderStatus:
    PENDING = "PENDING"                   # Chờ shop xác nhận (Khách CÓ THỂ hủy)
    CONFIRMED = "CONFIRMED"               # Shop đã xác nhận đơn (Khách KHÔNG THỂ hủy)
    SHIPPING = "SHIPPING"                 # Đang giao hàng (Khách KHÔNG THỂ hủy)
    DELIVERED = "DELIVERED"               # Đã giao hàng thành công (Khách CÓ THỂ yêu cầu hoàn trả)
    CANCELLED = "CANCELLED"               # Đã hủy đơn
    RETURN_REQUESTED = "RETURN_REQUESTED" # Khách hàng yêu cầu hoàn trả sản phẩm
    RETURNED = "RETURNED"                 # Shop đã chấp thuận hoàn trả & hoàn tiền
    RETURN_REJECTED = "RETURN_REJECTED"   # Shop từ chối yêu cầu hoàn trả


class Order(Base):
    __tablename__ = "orders"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_code = Column(String(50), unique=True, index=True, nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)

    # Thông tin người nhận
    customer_name = Column(String(255), nullable=False)
    customer_phone = Column(String(50), nullable=False)
    customer_address = Column(Text, nullable=False)
    notes = Column(Text, nullable=True)

    # Tài chính
    total_amount = Column(Float, nullable=False, default=0.0)
    shipping_fee = Column(Float, nullable=False, default=0.0)
    final_amount = Column(Float, nullable=False, default=0.0)

    # Phương thức và Trạng thái
    payment_method = Column(String(50), default="COD")       # COD, BANK
    payment_status = Column(String(50), default="PENDING")   # PENDING, PAID, REFUNDED
    status = Column(String(50), default=OrderStatus.PENDING, index=True, nullable=False)

    # Thông tin hủy đơn
    cancel_reason = Column(Text, nullable=True)
    cancelled_by = Column(String(50), nullable=True)         # CUSTOMER, ADMIN
    cancelled_at = Column(DateTime(timezone=True), nullable=True)

    # Thông tin hoàn trả
    return_reason = Column(Text, nullable=True)
    return_requested_at = Column(DateTime(timezone=True), nullable=True)
    return_response_notes = Column(Text, nullable=True)
    return_processed_at = Column(DateTime(timezone=True), nullable=True)

    # Tiến trình theo dõi giao hàng (Tracking Timeline Logs)
    tracking_timeline = Column(JSONB, nullable=True, default=list)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", backref="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id"), nullable=False, index=True)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id"), nullable=True, index=True)

    product_name = Column(String(255), nullable=False)
    product_image = Column(String(1000), nullable=True)
    price = Column(Float, nullable=False)
    quantity = Column(Integer, nullable=False, default=1)
    unit = Column(String(50), nullable=True, default="Món")
    subtotal = Column(Float, nullable=False)

    order = relationship("Order", back_populates="items")
    product = relationship("Product")
