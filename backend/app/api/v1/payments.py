from typing import List, Any, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from uuid import UUID
from pydantic import BaseModel

from app.api import deps
from app.models.payment import Payment, PaymentStatus
from app.models.appointment import Appointment, AppointmentStatus
from app.models.user import User
from app.schemas.payment import PaymentCreate, PaymentResponse

router = APIRouter()

class VietQRRequest(BaseModel):
    appointment_id: UUID
    amount: float
    bank_code: str = "MB"
    account_no: str = "0987654321"
    account_name: str = "PETCARE HOSPITAL"

class CheckoutSessionRequest(BaseModel):
    appointment_id: UUID
    amount: float
    method: str = "VIETQR"  # VIETQR, MOMO, VNPAY

@router.get("", response_model=List[PaymentResponse])
def get_payments(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    is_admin = any(r.name in ["ADMIN", "RECEPTIONIST"] for r in current_user.roles)
    
    query = db.query(Payment).options(
        joinedload(Payment.appointment).joinedload(Appointment.customer),
        joinedload(Payment.appointment).joinedload(Appointment.caregiver),
        joinedload(Payment.appointment).joinedload(Appointment.pet),
        joinedload(Payment.appointment).joinedload(Appointment.services)
    ).order_by(Payment.created_at.desc())

    if is_admin:
        payments = query.all()
    else:
        # Customers see payments related to their appointments
        payments = query.join(Appointment).filter(Appointment.customer_id == current_user.id).all()
    return payments

@router.post("", response_model=PaymentResponse)
def create_payment(
    *,
    db: Session = Depends(deps.get_db),
    payment_in: PaymentCreate,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    is_admin = any(r.name in ["ADMIN", "RECEPTIONIST"] for r in current_user.roles)
    if not is_admin:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    payment = Payment(**payment_in.model_dump())
    db.add(payment)
    
    # Auto-confirm appointment when payment is created with PAID/COMPLETED
    appt = db.query(Appointment).filter(Appointment.id == payment_in.appointment_id).first()
    if appt and appt.status == AppointmentStatus.PENDING:
        appt.status = AppointmentStatus.CONFIRMED
        
    db.commit()
    db.refresh(payment)
    return payment

@router.post("/generate-qr")
def generate_vietqr(
    *,
    db: Session = Depends(deps.get_db),
    req: VietQRRequest,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Generates a Napas247 VietQR standard payment image link with embedded amount and booking code.
    """
    appt = db.query(Appointment).filter(Appointment.id == req.appointment_id).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")

    short_id = str(appt.id).replace("-", "")[:8].upper()
    add_info = f"PETCARE {short_id}"
    clean_account_name = req.account_name.replace(" ", "%20")
    clean_info = add_info.replace(" ", "%20")
    int_amount = int(req.amount)

    # Standard VietQR Napas247 URL format
    qr_url = f"https://img.vietqr.io/image/{req.bank_code}-{req.account_no}-compact2.png?amount={int_amount}&addInfo={clean_info}&accountName={clean_account_name}"

    return {
        "status": "success",
        "qr_url": qr_url,
        "amount": int_amount,
        "bank_code": req.bank_code,
        "bank_name": "Ngân hàng Quân Đội (MBBank)",
        "account_no": req.account_no,
        "account_name": req.account_name,
        "transfer_content": add_info,
        "appointment_id": str(appt.id)
    }

@router.post("/checkout-session")
def create_checkout_session(
    *,
    db: Session = Depends(deps.get_db),
    req: CheckoutSessionRequest,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Creates an online payment checkout session for VietQR, MoMo, or VNPay sandbox.
    """
    appt = db.query(Appointment).filter(Appointment.id == req.appointment_id).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")

    # Find or create payment entry
    payment = db.query(Payment).filter(Payment.appointment_id == appt.id, Payment.status == PaymentStatus.PENDING).first()
    if not payment:
        payment = Payment(
            appointment_id=appt.id,
            amount=req.amount,
            status=PaymentStatus.PENDING,
            payment_method=req.method.upper()
        )
        db.add(payment)
        db.commit()
        db.refresh(payment)

    short_id = str(appt.id).replace("-", "")[:8].upper()
    transfer_content = f"PETCARE {short_id}"
    int_amount = int(req.amount)

    vietqr_url = f"https://img.vietqr.io/image/MB-0987654321-compact2.png?amount={int_amount}&addInfo=PETCARE%20{short_id}&accountName=PETCARE%20HOSPITAL"

    return {
        "payment_id": str(payment.id),
        "appointment_id": str(appt.id),
        "method": req.method.upper(),
        "amount": int_amount,
        "order_code": short_id,
        "qr_code_url": vietqr_url,
        "bank_info": {
            "bank_name": "MBBank (Ngân hàng Quân Đội)",
            "account_no": "0987654321",
            "account_name": "PETCARE HOSPITAL",
            "transfer_content": transfer_content
        },
        "momo_checkout_url": f"https://payment.momo.vn/v2/gateway/pay?orderId={payment.id}&amount={int_amount}",
        "vnpay_checkout_url": f"https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_TxnRef={payment.id}&vnp_Amount={int_amount * 100}"
    }

@router.post("/{id}/confirm-online")
def confirm_online_payment(
    *,
    db: Session = Depends(deps.get_db),
    id: UUID,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Confirms an online payment, marks payment as COMPLETED and appointment as CONFIRMED.
    """
    payment = db.query(Payment).filter(Payment.id == id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")

    payment.status = PaymentStatus.COMPLETED
    
    appt = db.query(Appointment).filter(Appointment.id == payment.appointment_id).first()
    if appt and appt.status == AppointmentStatus.PENDING:
        appt.status = AppointmentStatus.CONFIRMED

    db.commit()
    db.refresh(payment)

    return {
        "status": "success",
        "message": "Thanh toán trực tuyến thành công!",
        "payment_id": str(payment.id),
        "appointment_id": str(payment.appointment_id),
        "payment_status": payment.status
    }

