from fastapi import APIRouter, Depends

from middleware.auth import get_current_user
from services import conversation_service

router = APIRouter(prefix="/message-templates", tags=["message-templates"])


@router.get("")
def list_templates(user: dict = Depends(get_current_user)) -> dict:
    templates = conversation_service.get_templates_for_user(user)
    return {"status": True, "templates": templates}
