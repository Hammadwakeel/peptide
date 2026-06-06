from fastapi import APIRouter

from schemas.auth import (
    LoginRequest,
    RefreshTokenRequest,
    SendOtpRequest,
    VerifyOtpRequest,
)
from services import auth_service

router = APIRouter(prefix="/auth", tags=["auth"])


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
