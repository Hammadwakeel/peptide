from fastapi import APIRouter, Depends, Query

from middleware.auth import require_roles
from schemas.orders import RejectOrderRequest
from schemas.pagination import PaginationQuery
from services import clinic_orders

router = APIRouter(prefix="/provider", tags=["clinic-orders"])
provider_user = require_roles("clinic_owner", "clinic_staff")


@router.get("/orders")
def list_orders(
    pagination: PaginationQuery = Depends(),
    review_status: str | None = Query(
        None, pattern="^(pending_review|approved|rejected|cancelled)$",
    ),
    user: dict = Depends(provider_user),
) -> dict:
    """Physician reviews patient orders for their clinic."""
    return clinic_orders.list_orders_for_clinic(user, pagination, review_status)


@router.get("/orders/{order_id}")
def order_detail(order_id: str, user: dict = Depends(provider_user)) -> dict:
    return clinic_orders.get_clinic_order_detail(user, order_id)


@router.post("/orders/{order_id}/approve")
def approve_order(order_id: str, user: dict = Depends(provider_user)) -> dict:
    """Approve order; pharmacy lines ship via FedEx, peptides await separate carrier."""
    return clinic_orders.approve_clinic_order(user, order_id)


@router.post("/orders/{order_id}/reject")
def reject_order(
    order_id: str,
    body: RejectOrderRequest,
    user: dict = Depends(provider_user),
) -> dict:
    return clinic_orders.reject_clinic_order(user, order_id, body)
