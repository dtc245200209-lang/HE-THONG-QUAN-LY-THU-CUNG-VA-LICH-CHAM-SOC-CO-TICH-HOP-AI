from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings, setup_logging

setup_logging()

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set all CORS enabled origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "ok", "environment": settings.ENVIRONMENT}

# TODO: Include routers
from app.api.v1.api import api_router
from app.api.deps import RoleChecker, get_current_active_user
from fastapi import Depends

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/api/v1/admin-only")
def admin_only_endpoint(user = Depends(RoleChecker(["ADMIN"]))):
    return {"message": "Hello Admin"}
