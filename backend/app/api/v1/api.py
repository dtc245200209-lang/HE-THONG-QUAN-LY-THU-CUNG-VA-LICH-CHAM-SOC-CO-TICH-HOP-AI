from fastapi import APIRouter

from app.api.v1 import auth, pets, appointments, care_sessions, ai, public, users, services, payments, notifications, audit_logs, websockets, inventory, products, orders

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(pets.router, prefix="/pets", tags=["pets"])
api_router.include_router(appointments.router, prefix="/appointments", tags=["appointments"])
api_router.include_router(care_sessions.router, prefix="/care-sessions", tags=["care-sessions"])
api_router.include_router(ai.router, prefix="/ai", tags=["ai"])
api_router.include_router(public.router, prefix="/public", tags=["public"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(services.router, prefix="/services", tags=["services"])
api_router.include_router(payments.router, prefix="/payments", tags=["payments"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["notifications"])
api_router.include_router(audit_logs.router, prefix="/audit-logs", tags=["audit-logs"])
api_router.include_router(websockets.router, prefix="/ws", tags=["websockets"])
api_router.include_router(inventory.router, prefix="/inventory", tags=["inventory"])
api_router.include_router(products.router, prefix="/products", tags=["products"])
api_router.include_router(products.router, prefix="/public/products", tags=["public-products"])
api_router.include_router(orders.router, prefix="/orders", tags=["orders"])

