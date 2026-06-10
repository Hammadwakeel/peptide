from fastapi import APIRouter, Depends

from middleware.auth import require_roles
from schemas.patient import (
    AcceptInvitationRequest,
    PatientAddressInput,
    PatientPaymentMethodInput,
    UpdatePatientAddressRequest,
    UpdatePatientProfileRequest,
)
from services import patient_service, patient_settings_service

router = APIRouter(prefix="/patient", tags=["patient"])
patient_user = require_roles("patient")


@router.post("/accept-invitation")
def accept_invitation(body: AcceptInvitationRequest) -> dict:
    """Patient enters email only — auto-generates password and emails it."""
    return patient_service.accept_invitation(body)


@router.get("/settings")
def get_settings(user: dict = Depends(patient_user)) -> dict:
    """Patient account settings: profile, shipping addresses, payment methods."""
    return patient_settings_service.get_settings(user)


@router.patch("/settings/profile")
def update_profile(
    body: UpdatePatientProfileRequest,
    user: dict = Depends(patient_user),
) -> dict:
    return patient_settings_service.update_profile(user, body)


@router.get("/settings/addresses")
def list_addresses(user: dict = Depends(patient_user)) -> dict:
    return patient_settings_service.list_addresses(user)


@router.post("/settings/addresses")
def add_address(
    body: PatientAddressInput,
    user: dict = Depends(patient_user),
) -> dict:
    return patient_settings_service.add_address(user, body)


@router.put("/settings/addresses/{address_id}")
def update_address(
    address_id: str,
    body: UpdatePatientAddressRequest,
    user: dict = Depends(patient_user),
) -> dict:
    return patient_settings_service.update_address(user, address_id, body)


@router.delete("/settings/addresses/{address_id}")
def delete_address(address_id: str, user: dict = Depends(patient_user)) -> dict:
    return patient_settings_service.remove_address(user, address_id)


@router.patch("/settings/addresses/{address_id}/default")
def set_default_address(address_id: str, user: dict = Depends(patient_user)) -> dict:
    return patient_settings_service.make_default_address(user, address_id)


@router.post("/settings/payment-methods")
def add_payment_method(
    body: PatientPaymentMethodInput,
    user: dict = Depends(patient_user),
) -> dict:
    """Patient saves a card for checkout (stores brand, last4, expiry only)."""
    return patient_settings_service.add_payment_method(user, body)


@router.delete("/settings/payment-methods/{payment_method_id}")
def delete_payment_method(
    payment_method_id: str,
    user: dict = Depends(patient_user),
) -> dict:
    return patient_settings_service.remove_payment_method(user, payment_method_id)


@router.patch("/settings/payment-methods/{payment_method_id}/default")
def set_default_payment_method(
    payment_method_id: str,
    user: dict = Depends(patient_user),
) -> dict:
    return patient_settings_service.make_default_payment_method(user, payment_method_id)
