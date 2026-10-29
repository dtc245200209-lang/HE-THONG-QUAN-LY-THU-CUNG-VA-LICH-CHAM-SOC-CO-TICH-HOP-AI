import uuid
from datetime import datetime, timezone, timedelta
from typing import Optional, List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy.orm.attributes import flag_modified
from sqlalchemy import desc

from app.api import deps
from app.models.user import User
from app.models.product import Product
from app.models.order import Order, OrderItem, OrderStatus
from app.models.notification import Notification, NotificationType
from app.schemas.order import (
    OrderCreate, OrderResponse, OrderListResponse,
    OrderCancelRequest, OrderReturnRequest, OrderStatusUpdateRequest
)

router = APIRouter()


def format_order_response(order: Order) -> OrderResponse:
    can_cancel = (order.status == OrderStatus.PENDING)
    can_return = (order.status == OrderStatus.DELIVERED)

    resp_dict = {
        "id": order.id,
        "order_code": order.order_code,
        "user_id": order.user_id,
        "customer_name": order.customer_name,
        "customer_phone": order.customer_phone,
        "customer_address": order.customer_address,
        "notes": order.notes,
        "total_amount": order.total_amount,
        "shipping_fee": order.shipping_fee,
        "final_amount": order.final_amount,
        "payment_method": order.payment_method,
        "payment_status": order.payment_status,
        "status": order.status,
        "cancel_reason": order.cancel_reason,
        "cancelled_by": order.cancelled_by,
        "cancelled_at": order.cancelled_at,
        "return_reason": order.return_reason,
        "return_requested_at": order.return_requested_at,
        "return_response_notes": order.return_response_notes,
        "return_processed_at": order.return_processed_at,
        "tracking_timeline": order.tracking_timeline or [],
        "created_at": order.created_at,
        "updated_at": order.updated_at,
        "items": [
            {
                "id": item.id,
                "product_id": item.product_id,
                "product_name": item.product_name,
                "product_image": item.product_image,
                "price": item.price,
                "quantity": item.quantity,
                "unit": item.unit,
                "subtotal": item.subtotal
            }
            for item in order.items
        ],
        "can_cancel": can_cancel,
        "can_return": can_return
    }
    return OrderResponse(**resp_dict)


@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(
    order_in: OrderCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """
    Tạo đơn hàng mới từ giỏ hàng hoặc mua ngay.
    Tự động liên kết với tài khoản khách hàng đang đăng nhập, tính phí ship, kiểm tra tồn kho.
    """
    if not order_in.items:
        raise HTTPException(status_code=400, detail="Đơn hàng phải có ít nhất 1 sản phẩm.")

    now = datetime.now(timezone.utc)

    # Chống click đúp tạo đơn trùng lặp (Idempotency / Debounce trong vòng 5 giây)
    five_secs_ago = now - timedelta(seconds=5)
    recent_order = db.query(Order).filter(
        Order.user_id == current_user.id,
        Order.created_at >= five_secs_ago
    ).order_by(Order.created_at.desc()).first()

    if recent_order:
        existing_items = {str(it.product_id): it.quantity for it in recent_order.items}
        new_items = {str(it.product_id): it.quantity for it in order_in.items}
        if existing_items == new_items:
            # Phát hiện double-click / gửi yêu cầu song song, trả về đơn hàng đã tạo, không tạo mới
            return format_order_response(recent_order)

    order_code = f"ORD-{now.strftime('%Y%m%d%H%M')}-{uuid.uuid4().hex[:4].upper()}"

    total_amount = 0.0
    order_items = []

    for item_in in order_in.items:
        product = db.query(Product).filter(Product.id == item_in.product_id, Product.is_active == True).first()
        if not product:
            raise HTTPException(
                status_code=404,
                detail=f"Sản phẩm ID '{item_in.product_id}' không tồn tại hoặc đã ngừng kinh doanh."
            )

        if product.stock_quantity < item_in.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Sản phẩm '{product.name}' chỉ còn {product.stock_quantity} {product.unit} trong kho, không đủ đáp ứng {item_in.quantity}."
            )

        # Trừ tồn kho
        product.stock_quantity -= item_in.quantity

        item_subtotal = float(product.price * item_in.quantity)
        total_amount += item_subtotal

        order_item = OrderItem(
            product_id=product.id,
            product_name=product.name,
            product_image=product.image_url,
            price=product.price,
            quantity=item_in.quantity,
            unit=product.unit,
            subtotal=item_subtotal
        )
        order_items.append(order_item)

    # Miễn phí vận chuyển cho đơn hàng từ 300.000₫
    shipping_fee = 0.0 if total_amount >= 300000 else 30000.0
    final_amount = total_amount + shipping_fee

    # Khởi tạo timeline tiến trình giao hàng trực quan
    initial_timeline = [
        {
            "step": "ORDER_PLACED",
            "status": OrderStatus.PENDING,
            "title": "Đặt hàng thành công",
            "description": "Đơn hàng đã được ghi nhận trên hệ thống và chuyển đến PetCare Store.",
            "time": now.isoformat(),
            "completed": True
        },
        {
            "step": "CONFIRMATION",
            "status": OrderStatus.CONFIRMED,
            "title": "Chờ shop xác nhận",
            "description": "Nhân viên PetCare đang kiểm tra thông tin và chuẩn bị đóng gói sản phẩm.",
            "time": None,
            "completed": False
        },
        {
            "step": "SHIPPING",
            "status": OrderStatus.SHIPPING,
            "title": "Đang giao hàng",
            "description": "Đơn hàng được bàn giao cho nhân viên giao vận siêu tốc trong 2 giờ.",
            "time": None,
            "completed": False
        },
        {
            "step": "DELIVERY",
            "status": OrderStatus.DELIVERED,
            "title": "Giao hàng thành công",
            "description": "Khách hàng nhận hàng, kiểm tra sản phẩm và thanh toán.",
            "time": None,
            "completed": False
        }
    ]

    new_order = Order(
        order_code=order_code,
        user_id=current_user.id,
        customer_name=order_in.customer_name.strip(),
        customer_phone=order_in.customer_phone.strip(),
        customer_address=order_in.customer_address.strip(),
        notes=order_in.notes,
        total_amount=total_amount,
        shipping_fee=shipping_fee,
        final_amount=final_amount,
        payment_method=order_in.payment_method.upper(),
        payment_status="PENDING",
        status=OrderStatus.PENDING,
        tracking_timeline=initial_timeline,
        items=order_items
    )

    db.add(new_order)

    # Tạo thông báo cho khách hàng
    notification = Notification(
        user_id=current_user.id,
        type=NotificationType.SYSTEM,
        title=f"Đã đặt thành công đơn hàng #{order_code}",
        message=f"Đơn hàng trị giá {final_amount:,.0f}₫ của bạn đã được tiếp nhận và đang chờ shop xác nhận.",
        action_url="/customer/orders"
    )
    db.add(notification)

    db.commit()
    db.refresh(new_order)

    return format_order_response(new_order)


@router.get("/my-orders", response_model=OrderListResponse)
def get_my_orders(
    status_filter: Optional[str] = Query(None, description="Tất cả hoặc PENDING, CONFIRMED, SHIPPING, DELIVERED, CANCELLED, RETURN_REQUESTED"),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """
    Xem danh sách tất cả các đơn hàng đã mua của khách hàng hiện tại.
    """
    query = db.query(Order).filter(Order.user_id == current_user.id)
    if status_filter and status_filter.upper() != "ALL":
        query = query.filter(Order.status == status_filter.upper())

    orders = query.order_by(desc(Order.created_at)).all()
    items = [format_order_response(o) for o in orders]
    return OrderListResponse(total=len(items), items=items)

@router.get("/lookup/{order_code}", response_model=OrderResponse)
def lookup_order_by_code(
    order_code: str,
    db: Session = Depends(deps.get_db)
):
    """
    Tra cứu đơn hàng công khai bằng mã đơn (ví dụ: ORD-20261016...)
    Giúp khách hàng theo dõi trạng thái đơn hàng, tiến trình giao hàng mọi lúc mọi nơi mà không gặp trở ngại.
    """
    clean_code = order_code.strip()
    order = db.query(Order).filter(Order.order_code.ilike(clean_code)).first()
    if not order:
        raise HTTPException(
            status_code=404, 
            detail=f"Không tìm thấy đơn hàng với mã '{clean_code}'. Vui lòng kiểm tra lại mã đơn!"
        )
    return format_order_response(order)


@router.post("/confirm-transfer/{order_identifier}", response_model=OrderResponse)
def confirm_order_bank_transfer(
    order_identifier: str,
    db: Session = Depends(deps.get_db),
    current_user: Optional[User] = Depends(deps.get_current_user_optional)
):
    """
    Khách hàng ấn xác nhận 'Tôi đã chuyển khoản xong':
    - Cập nhật trạng thái thanh toán sang PAID
    - Cập nhật trạng thái đơn hàng sang CONFIRMED (Shop đã xác nhận • Chuẩn bị giao hàng)
    - Cập nhật timeline tiến trình đơn hàng
    """
    clean_id = order_identifier.strip()
    order = db.query(Order).filter(Order.order_code.ilike(clean_id)).first()
    if not order:
        try:
            val_uuid = uuid.UUID(clean_id)
            order = db.query(Order).filter(Order.id == val_uuid).first()
        except ValueError:
            pass

    if not order:
        raise HTTPException(status_code=404, detail="Không tìm thấy đơn hàng.")

    now = datetime.now(timezone.utc)
    if order.status == OrderStatus.PENDING:
        order.status = OrderStatus.CONFIRMED
        order.payment_status = "PAID"

        timeline = list(order.tracking_timeline or [])
        for step in timeline:
            if step.get("step") == "CONFIRMATION":
                step["completed"] = True
                step["time"] = now.isoformat()
                step["description"] = "Khách hàng đã xác nhận chuyển khoản VietQR thành công. Shop đang chuẩn bị hàng để giao ngay."
                break
        order.tracking_timeline = timeline
        flag_modified(order, "tracking_timeline")

        notification = Notification(
            user_id=order.user_id,
            type=NotificationType.SYSTEM,
            title=f"Đơn hàng #{order.order_code} đã thanh toán VietQR",
            message="Khách hàng đã xác nhận chuyển khoản thành công. Đơn hàng đang được chuẩn bị giao hàng.",
            action_url="/customer/orders"
        )
        db.add(notification)
        db.commit()
        db.refresh(order)

    return format_order_response(order)


@router.get("/{order_id}", response_model=OrderResponse)
def get_order_detail(
    order_id: UUID,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """
    Xem chi tiết đơn hàng và tiến trình giao hàng theo mã UUID.
    """
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Không tìm thấy đơn hàng.")

    user_roles_list = [r.name for r in current_user.roles]
    is_staff = any(role in ["ADMIN", "RECEPTIONIST"] for role in user_roles_list)

    if order.user_id != current_user.id and not is_staff:
        raise HTTPException(status_code=403, detail="Bạn không có quyền truy cập đơn hàng này.")

    return format_order_response(order)


@router.post("/{order_id}/cancel", response_model=OrderResponse)
def cancel_order(
    order_id: UUID,
    cancel_in: OrderCancelRequest,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """
    Khách hàng hủy đơn hàng.
    QUY TẮC CỐT LÕI:
    - Chỉ được phép hủy khi trạng thái là PENDING (Chờ shop xác nhận).
    - Sau khi shop đã xác nhận (CONFIRMED) hoặc đang giao hàng (SHIPPING, DELIVERED), KHÔNG THỂ HỦY.
    """
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Không tìm thấy đơn hàng.")

    user_roles_list = [r.name for r in current_user.roles]
    is_staff = any(role in ["ADMIN", "RECEPTIONIST"] for role in user_roles_list)

    if order.user_id != current_user.id and not is_staff:
        raise HTTPException(status_code=403, detail="Bạn không có quyền hủy đơn hàng này.")

    # Kiểm tra điều kiện nghiêm ngặt: chỉ cho phép hủy khi đang PENDING
    if order.status != OrderStatus.PENDING:
        raise HTTPException(
            status_code=400,
            detail="Không thể hủy đơn hàng vì chủ shop đã xác nhận hoặc đơn hàng đang được vận chuyển! Vui lòng liên hệ hotline 1900 8888 nếu bạn cần hỗ trợ khẩn cấp."
        )

    now = datetime.now(timezone.utc)
    order.status = OrderStatus.CANCELLED
    order.cancel_reason = cancel_in.reason or "Khách hàng hủy trước khi shop xác nhận"
    order.cancelled_by = "CUSTOMER" if not is_staff else "ADMIN"
    order.cancelled_at = now

    # Hoàn trả lại số lượng tồn kho sản phẩm
    for item in order.items:
        if item.product_id:
            product = db.query(Product).filter(Product.id == item.product_id).first()
            if product:
                product.stock_quantity += item.quantity

    # Cập nhật timeline
    timeline = list(order.tracking_timeline or [])
    timeline.append({
        "step": "CANCELLED",
        "status": OrderStatus.CANCELLED,
        "title": "Đã hủy đơn hàng",
        "description": f"Đơn hàng đã được hủy bởi {order.cancelled_by}. Lý do: {order.cancel_reason}",
        "time": now.isoformat(),
        "completed": True
    })
    order.tracking_timeline = timeline

    # Thông báo cho khách hàng
    notification = Notification(
        user_id=order.user_id,
        type=NotificationType.SYSTEM,
        title=f"Đơn hàng #{order.order_code} đã được hủy",
        message=f"Đơn hàng #{order.order_code} đã được hủy thành công. Cảm ơn bạn đã quan tâm.",
        action_url="/customer/orders"
    )
    db.add(notification)

    db.commit()
    db.refresh(order)
    return format_order_response(order)


@router.post("/{order_id}/return", response_model=OrderResponse)
def request_order_return(
    order_id: UUID,
    return_in: OrderReturnRequest,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """
    Khách hàng gửi yêu cầu đổi/trả hàng và hoàn tiền.
    QUY TẮC CỐT LÕI:
    - Chỉ được phép yêu cầu trả hàng khi đơn hàng ĐÃ GIAO THÀNH CÔNG (DELIVERED).
    - Có lý do cụ thể (sản phẩm lỗi, cận date, không đúng mô tả...).
    """
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Không tìm thấy đơn hàng.")

    if order.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Bạn không có quyền yêu cầu hoàn trả đơn hàng này.")

    if order.status != OrderStatus.DELIVERED:
        raise HTTPException(
            status_code=400,
            detail="Chỉ có thể gửi yêu cầu hoàn trả hàng sau khi bưu kiện đã được giao thành công (DELIVERED)!"
        )

    now = datetime.now(timezone.utc)
    order.status = OrderStatus.RETURN_REQUESTED
    order.return_reason = return_in.reason.strip()
    order.return_requested_at = now

    timeline = list(order.tracking_timeline or [])
    timeline.append({
        "step": "RETURN_REQUESTED",
        "status": OrderStatus.RETURN_REQUESTED,
        "title": "Yêu cầu đổi/trả sản phẩm",
        "description": f"Khách hàng đã gửi yêu cầu hoàn trả. Lý do: {order.return_reason}. Nhân viên PetCare sẽ liên hệ xử lý trong vòng 24 giờ.",
        "time": now.isoformat(),
        "completed": True
    })
    order.tracking_timeline = timeline

    notification = Notification(
        user_id=order.user_id,
        type=NotificationType.SYSTEM,
        title=f"Đã ghi nhận yêu cầu hoàn trả đơn hàng #{order.order_code}",
        message=f"PetCare đã nhận được yêu cầu hoàn trả với lý do '{order.return_reason}'. Bác sĩ/Nhân viên chăm sóc sẽ hỗ trợ bạn ngay.",
        action_url="/customer/orders"
    )
    db.add(notification)

    db.commit()
    db.refresh(order)
    return format_order_response(order)


# =====================================================================
# PHÂN HỆ QUẢN TRỊ DÀNH CHO CHỦ SHOP / ADMIN / LỄ TÂN
# =====================================================================

@router.get("/admin/all", response_model=OrderListResponse)
def get_all_orders_admin(
    status_filter: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.RoleChecker(["ADMIN", "RECEPTIONIST"]))
):
    """
    Dành cho Quản trị viên / Chủ shop: Xem toàn bộ đơn hàng của tất cả khách hàng.
    """
    query = db.query(Order)
    if status_filter and status_filter.upper() != "ALL":
        query = query.filter(Order.status == status_filter.upper())

    if search:
        s = f"%{search.strip()}%"
        query = query.filter(
            (Order.order_code.ilike(s)) |
            (Order.customer_name.ilike(s)) |
            (Order.customer_phone.ilike(s))
        )

    orders = query.order_by(desc(Order.created_at)).all()
    items = [format_order_response(o) for o in orders]
    return OrderListResponse(total=len(items), items=items)


@router.get("/admin/statistics")
def get_order_statistics(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.RoleChecker(["ADMIN", "RECEPTIONIST"]))
):
    """
    Thống kê tổng quan số lượng đơn hàng đi và đơn hoàn trả dành riêng cho Admin giám sát.
    """
    all_orders = db.query(Order).all()
    total_orders = len(all_orders)

    pending_count = sum(1 for o in all_orders if o.status == OrderStatus.PENDING)
    confirmed_count = sum(1 for o in all_orders if o.status == OrderStatus.CONFIRMED)
    shipping_count = sum(1 for o in all_orders if o.status == OrderStatus.SHIPPING)
    delivered_count = sum(1 for o in all_orders if o.status == OrderStatus.DELIVERED)
    cancelled_count = sum(1 for o in all_orders if o.status == OrderStatus.CANCELLED)

    return_requested_count = sum(1 for o in all_orders if o.status == OrderStatus.RETURN_REQUESTED)
    returned_count = sum(1 for o in all_orders if o.status == OrderStatus.RETURNED)
    return_rejected_count = sum(1 for o in all_orders if o.status == OrderStatus.RETURN_REJECTED)

    # Đơn hàng đi = đã được duyệt và xuất kho đi giao (CONFIRMED + SHIPPING + DELIVERED)
    dispatched_count = confirmed_count + shipping_count + delivered_count
    dispatched_revenue = sum(
        o.final_amount for o in all_orders 
        if o.status in [OrderStatus.CONFIRMED, OrderStatus.SHIPPING, OrderStatus.DELIVERED]
    )

    # Đơn hoàn trả
    total_return_cases = return_requested_count + returned_count + return_rejected_count
    refunded_amount = sum(
        o.final_amount for o in all_orders 
        if o.status == OrderStatus.RETURNED
    )
    pending_refund_amount = sum(
        o.final_amount for o in all_orders 
        if o.status == OrderStatus.RETURN_REQUESTED
    )

    return_rate = round((total_return_cases / total_orders * 100), 1) if total_orders > 0 else 0.0

    return {
        "total_orders": total_orders,
        "pending_count": pending_count,
        "dispatched_count": dispatched_count,
        "shipping_count": shipping_count,
        "delivered_count": delivered_count,
        "dispatched_revenue": dispatched_revenue,
        "total_return_cases": total_return_cases,
        "return_requested_count": return_requested_count,
        "returned_count": returned_count,
        "return_rejected_count": return_rejected_count,
        "refunded_amount": refunded_amount,
        "pending_refund_amount": pending_refund_amount,
        "return_rate": return_rate,
        "cancelled_count": cancelled_count
    }


@router.put("/admin/{order_id}/status", response_model=OrderResponse)
def update_order_status_admin(
    order_id: UUID,
    status_in: OrderStatusUpdateRequest,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.RoleChecker(["ADMIN", "RECEPTIONIST"]))
):
    """
    Dành cho Quản trị viên / Chủ shop:
    - CONFIRMED: Xác nhận đơn hàng (sau khi xác nhận thì khách hàng không thể tự hủy đơn nữa).
    - SHIPPING: Bàn giao hàng cho bên vận chuyển.
    - DELIVERED: Xác nhận khách đã nhận hàng thành công.
    - RETURNED: Chấp thuận hoàn trả hàng & hoàn tiền.
    - RETURN_REJECTED: Từ chối yêu cầu hoàn trả.
    """
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Không tìm thấy đơn hàng.")

    now = datetime.now(timezone.utc)
    new_status = status_in.status.upper()
    timeline = list(order.tracking_timeline or [])

    if new_status == OrderStatus.CONFIRMED:
        order.status = OrderStatus.CONFIRMED
        # Cập nhật mốc timeline CONFIRMATION
        for step in timeline:
            if step.get("step") == "CONFIRMATION":
                step["completed"] = True
                step["time"] = now.isoformat()
                step["description"] = "Shop đã xác nhận đơn hàng thành công và đang đóng gói sản phẩm."
                break

        notification = Notification(
            user_id=order.user_id,
            type=NotificationType.SYSTEM,
            title=f"Đơn hàng #{order.order_code} đã được shop xác nhận",
            message="Chủ shop đã duyệt đơn và đang đóng gói cẩn thận. Đơn hàng không thể hủy tự động lúc này.",
            action_url="/customer/orders"
        )
        db.add(notification)

    elif new_status == OrderStatus.SHIPPING:
        order.status = OrderStatus.SHIPPING
        for step in timeline:
            if step.get("step") == "SHIPPING":
                step["completed"] = True
                step["time"] = now.isoformat()
                step["description"] = "Đơn hàng đang trên xe giao vận tốc hành, dự kiến giao trong 2 giờ."
                break

        notification = Notification(
            user_id=order.user_id,
            type=NotificationType.SYSTEM,
            title=f"Đơn hàng #{order.order_code} đang được giao",
            message="Tài xế giao hàng đang trên đường tới địa chỉ của bạn. Vui lòng giữ máy nhận hàng.",
            action_url="/customer/orders"
        )
        db.add(notification)

    elif new_status == OrderStatus.DELIVERED:
        order.status = OrderStatus.DELIVERED
        order.payment_status = "PAID"
        for step in timeline:
            if step.get("step") == "DELIVERY":
                step["completed"] = True
                step["time"] = now.isoformat()
                step["description"] = "Đã giao hàng thành công đến tay khách hàng."
                break

        notification = Notification(
            user_id=order.user_id,
            type=NotificationType.SYSTEM,
            title=f"Đơn hàng #{order.order_code} đã giao thành công",
            message="Cảm ơn bạn đã tin tưởng mua sắm tại PetCare. Nếu có bất kỳ vấn đề gì, bạn có thể gửi yêu cầu hoàn trả tại trang đơn hàng.",
            action_url="/customer/orders"
        )
        db.add(notification)

    elif new_status == OrderStatus.RETURNED:
        order.status = OrderStatus.RETURNED
        order.payment_status = "REFUNDED"
        order.return_processed_at = now
        order.return_response_notes = status_in.notes or "Shop đã kiểm tra và chấp thuận hoàn trả sản phẩm, hoàn tiền thành công."

        # Hoàn trả lại số lượng tồn kho nếu sản phẩm còn nguyên vẹn
        for item in order.items:
            if item.product_id:
                product = db.query(Product).filter(Product.id == item.product_id).first()
                if product:
                    product.stock_quantity += item.quantity

        timeline.append({
            "step": "RETURNED",
            "status": OrderStatus.RETURNED,
            "title": "Chấp thuận hoàn trả hàng & Hoàn tiền",
            "description": order.return_response_notes,
            "time": now.isoformat(),
            "completed": True
        })

        notification = Notification(
            user_id=order.user_id,
            type=NotificationType.SYSTEM,
            title=f"Yêu cầu hoàn trả đơn hàng #{order.order_code} đã được chấp thuận",
            message=f"Shop đã đồng ý yêu cầu hoàn trả. {order.return_response_notes}",
            action_url="/customer/orders"
        )
        db.add(notification)

    elif new_status == OrderStatus.RETURN_REJECTED:
        order.status = OrderStatus.RETURN_REJECTED
        order.return_processed_at = now
        order.return_response_notes = status_in.notes or "Sản phẩm không đáp ứng điều kiện hoàn trả (đã mở nắp sử dụng quá hạn/hư hỏng do phía người dùng)."

        timeline.append({
            "step": "RETURN_REJECTED",
            "status": OrderStatus.RETURN_REJECTED,
            "title": "Từ chối yêu cầu hoàn trả",
            "description": order.return_response_notes,
            "time": now.isoformat(),
            "completed": True
        })

        notification = Notification(
            user_id=order.user_id,
            type=NotificationType.SYSTEM,
            title=f"Yêu cầu hoàn trả đơn hàng #{order.order_code} bị từ chối",
            message=f"Lý do: {order.return_response_notes}. Vui lòng liên hệ hotline 1900 8888 để được giải đáp.",
            action_url="/customer/orders"
        )
        db.add(notification)

    elif new_status == OrderStatus.CANCELLED:
        order.status = OrderStatus.CANCELLED
        order.cancel_reason = status_in.notes or "Shop hủy đơn do hết hàng hoặc thông tin không hợp lệ"
        order.cancelled_by = "ADMIN"
        order.cancelled_at = now

        for item in order.items:
            if item.product_id:
                product = db.query(Product).filter(Product.id == item.product_id).first()
                if product:
                    product.stock_quantity += item.quantity

        timeline.append({
            "step": "CANCELLED",
            "status": OrderStatus.CANCELLED,
            "title": "Đơn hàng đã bị hủy bởi Shop",
            "description": order.cancel_reason,
            "time": now.isoformat(),
            "completed": True
        })

        notification = Notification(
            user_id=order.user_id,
            type=NotificationType.SYSTEM,
            title=f"Đơn hàng #{order.order_code} đã bị hủy",
            message=f"Lý do: {order.cancel_reason}",
            action_url="/customer/orders"
        )
        db.add(notification)

    else:
        raise HTTPException(status_code=400, detail=f"Trạng thái '{new_status}' không hợp lệ.")

    order.tracking_timeline = timeline
    db.commit()
    db.refresh(order)
    return format_order_response(order)
