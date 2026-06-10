from fastapi import APIRouter, Depends, Query

from middleware.auth import require_roles
from schemas.orders import CreatePatientOrderRequest
from schemas.pagination import PaginationQuery
from services import patient_orders

router = APIRouter(prefix="/patient", tags=["patient-orders"])
patient_user = require_roles("patient")


@router.post("/orders")
def place_order(
    body: CreatePatientOrderRequest,
    user: dict = Depends(patient_user),
) -> dict:
    """Patient places an order from their clinic store; awaits physician approval."""
    return patient_orders.place_patient_order(user, body)


@router.get("/orders")
def list_orders(
    pagination: PaginationQuery = Depends(),
    review_status: str | None = Query(
        None, pattern="^(pending_review|approved|rejected|cancelled)$",
    ),
    user: dict = Depends(patient_user),
) -> dict:
    return patient_orders.list_orders_for_patient(user, pagination, review_status)


@router.get("/orders/{order_id}")
def order_detail(order_id: str, user: dict = Depends(patient_user)) -> dict:
    return patient_orders.get_patient_order_detail(user, order_id)


@router.get("/orders/{order_id}/tracking")
def order_tracking(order_id: str, user: dict = Depends(patient_user)) -> dict:
    """Live FedEx tracking for pharmacy shipments on an approved order."""
    return patient_orders.track_patient_order(user, order_id)
