from fastapi import APIRouter, Query

from schemas.auth import (
    CreateAdminRequest,
    LoginRequest,
    RefreshTokenRequest,
    SendOtpRequest,
    SetPasswordRequest,
    VerifyOtpRequest,
)
from services import auth_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/create-admin", status_code=201)
def create_admin(body: CreateAdminRequest) -> dict:
    return auth_service.create_admin(body)


@router.post("/login")
def login(body: LoginRequest) -> dict:
    return auth_service.login(body)


@router.post("/send-otp")
def send_otp(body: SendOtpRequest) -> dict:
    return auth_service.send_otp(body)


@router.post("/verify-otp")
def verify_otp(body: VerifyOtpRequest) -> dict:
    return auth_service.verify_otp(body)


@router.post("/refresh-token")
def refresh_token(body: RefreshTokenRequest) -> dict:
    return auth_service.refresh_token(body)


@router.get("/set-password")
def check_set_password_token(token: str = Query(..., min_length=16)) -> dict:
    """Check whether a set-password link is valid before showing the password form."""
    return auth_service.check_set_password_token(token)


@router.post("/set-password")
def set_password(body: SetPasswordRequest) -> dict:
    return auth_service.set_password(body)
