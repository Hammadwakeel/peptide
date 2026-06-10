from __future__ import annotations

from fastapi import HTTPException

from db import connect
import uuid

from repository.patient_settings_repository import (
    create_patient_address,
    create_patient_payment_method,
    delete_patient_address,
    delete_patient_payment_method,
    get_patient_address,
    get_patient_by_user_id,
    list_patient_addresses,
    list_patient_payment_methods,
    set_default_patient_address,
    set_default_patient_payment_method,
    update_patient_address,
    update_patient_profile,
)
from schemas.patient import (
    PatientAddressInput,
    PatientPaymentMethodInput,
    UpdatePatientAddressRequest,
    UpdatePatientProfileRequest,
)


def _address_label(row: dict, index: int) -> str:
    if row.get("is_default"):
        return "Home"
    return f"Address {index + 1}"


def fmt_address(row: dict, index: int = 0) -> dict:
    return {
        "id": str(row["id"]),
        "label": _address_label(row, index),
        "line1": row["address1"],
        "line2": row.get("address2"),
        "city": row["city"],
        "state": row["state"],
        "zip": row["zip"],
        "country": row.get("country", "US"),
        "is_default": bool(row.get("is_default")),
    }


def fmt_payment_method(row: dict) -> dict:
    return {
        "id": str(row["id"]),
        "brand": row.get("card_brand") or "Card",
        "last4": row.get("card_last4") or "0000",
        "exp_month": int(row["exp_month"]) if row.get("exp_month") else 1,
        "exp_year": int(row["exp_year"]) if row.get("exp_year") else 2030,
        "is_default": bool(row.get("is_default")),
    }


def fmt_settings(patient: dict, addresses: list[dict], payment_methods: list[dict]) -> dict:
    name = " ".join(
        part for part in [patient.get("first_name"), patient.get("last_name")] if part
    ).strip()
    return {
        "id": str(patient["id"]),
        "name": name,
        "first_name": patient.get("first_name"),
        "last_name": patient.get("last_name"),
        "email": patient.get("user_email") or patient.get("email"),
        "phone": patient.get("phone") or "",
        "date_of_birth": str(patient["dob"]) if patient.get("dob") else None,
        "clinic": {
            "id": str(patient["clinic_id"]),
            "name": patient.get("clinic_name"),
        },
        "shipping_addresses": [fmt_address(a, i) for i, a in enumerate(addresses)],
        "payment_methods": [fmt_payment_method(m) for m in payment_methods],
    }


def _require_patient(cursor, user_id: str) -> dict:
    patient = get_patient_by_user_id(cursor, user_id)
    if not patient:
        raise HTTPException(status_code=403, detail="No active patient profile found")
    return patient


def get_settings(user: dict) -> dict:
    conn = connect()
    cursor = conn.cursor()
    try:
        patient = _require_patient(cursor, user["sub"])
        addresses = list_patient_addresses(cursor, str(patient["id"]))
        payment_methods = list_patient_payment_methods(cursor, str(patient["id"]))
        return {"status": True, "settings": fmt_settings(patient, addresses, payment_methods)}
    finally:
        cursor.close()
        conn.close()


def update_profile(user: dict, body: UpdatePatientProfileRequest) -> dict:
    conn = connect()
    cursor = conn.cursor()
    try:
        patient = _require_patient(cursor, user["sub"])
        data = body.model_dump(exclude_unset=True)
        if not data:
            raise HTTPException(status_code=400, detail="No profile fields to update")
        update_patient_profile(cursor, str(patient["id"]), data)
        conn.commit()
        return get_settings(user)
    except HTTPException:
        conn.rollback()
        raise
    except Exception as exc:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    finally:
        cursor.close()
        conn.close()


def list_addresses(user: dict) -> dict:
    conn = connect()
    cursor = conn.cursor()
    try:
        patient = _require_patient(cursor, user["sub"])
        rows = list_patient_addresses(cursor, str(patient["id"]))
        return {
            "status": True,
            "addresses": [fmt_address(r, i) for i, r in enumerate(rows)],
        }
    finally:
        cursor.close()
        conn.close()


def add_address(user: dict, body: PatientAddressInput) -> dict:
    conn = connect()
    cursor = conn.cursor()
    try:
        patient = _require_patient(cursor, user["sub"])
        patient_id = str(patient["id"])
        existing = list_patient_addresses(cursor, patient_id)
        payload = body.model_dump()
        if not existing:
            payload["is_default"] = True
        row = create_patient_address(cursor, patient_id, payload)
        conn.commit()
        return {"status": True, "address": fmt_address(row, len(existing))}
    except HTTPException:
        conn.rollback()
        raise
    except Exception as exc:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    finally:
        cursor.close()
        conn.close()


def update_address(user: dict, address_id: str, body: UpdatePatientAddressRequest) -> dict:
    conn = connect()
    cursor = conn.cursor()
    try:
        patient = _require_patient(cursor, user["sub"])
        data = body.model_dump(exclude_unset=True)
        if not data:
            raise HTTPException(status_code=400, detail="No address fields to update")
        row = update_patient_address(cursor, str(patient["id"]), address_id, data)
        if not row:
            raise HTTPException(status_code=404, detail="Address not found")
        conn.commit()
        return {"status": True, "address": fmt_address(row)}
    except HTTPException:
        conn.rollback()
        raise
    except Exception as exc:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    finally:
        cursor.close()
        conn.close()


def remove_address(user: dict, address_id: str) -> dict:
    conn = connect()
    cursor = conn.cursor()
    try:
        patient = _require_patient(cursor, user["sub"])
        deleted = delete_patient_address(cursor, str(patient["id"]), address_id)
        if not deleted:
            raise HTTPException(status_code=404, detail="Address not found")
        conn.commit()
        return {"status": True, "message": "Address removed"}
    except HTTPException:
        conn.rollback()
        raise
    finally:
        cursor.close()
        conn.close()


def make_default_address(user: dict, address_id: str) -> dict:
    conn = connect()
    cursor = conn.cursor()
    try:
        patient = _require_patient(cursor, user["sub"])
        row = set_default_patient_address(cursor, str(patient["id"]), address_id)
        if not row:
            raise HTTPException(status_code=404, detail="Address not found")
        conn.commit()
        return {"status": True, "address": fmt_address(row)}
    except HTTPException:
        conn.rollback()
        raise
    finally:
        cursor.close()
        conn.close()


def add_payment_method(user: dict, body: PatientPaymentMethodInput) -> dict:
    conn = connect()
    cursor = conn.cursor()
    try:
        patient = _require_patient(cursor, user["sub"])
        patient_id = str(patient["id"])
        existing = list_patient_payment_methods(cursor, patient_id)
        payload = body.model_dump()
        if not existing:
            payload["is_default"] = True
        payload["stripe_payment_method_id"] = f"local_{uuid.uuid4().hex}"
        row = create_patient_payment_method(cursor, patient_id, payload)
        conn.commit()
        return {"status": True, "payment_method": fmt_payment_method(row)}
    except HTTPException:
        conn.rollback()
        raise
    except Exception as exc:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    finally:
        cursor.close()
        conn.close()


def remove_payment_method(user: dict, payment_method_id: str) -> dict:
    conn = connect()
    cursor = conn.cursor()
    try:
        patient = _require_patient(cursor, user["sub"])
        deleted = delete_patient_payment_method(cursor, str(patient["id"]), payment_method_id)
        if not deleted:
            raise HTTPException(status_code=404, detail="Payment method not found")
        conn.commit()
        return {"status": True, "message": "Payment method removed"}
    except HTTPException:
        conn.rollback()
        raise
    finally:
        cursor.close()
        conn.close()


def make_default_payment_method(user: dict, payment_method_id: str) -> dict:
    conn = connect()
    cursor = conn.cursor()
    try:
        patient = _require_patient(cursor, user["sub"])
        row = set_default_patient_payment_method(
            cursor, str(patient["id"]), payment_method_id,
        )
        if not row:
            raise HTTPException(status_code=404, detail="Payment method not found")
        conn.commit()
        return {"status": True, "payment_method": fmt_payment_method(row)}
    except HTTPException:
        conn.rollback()
        raise
    finally:
        cursor.close()
        conn.close()
