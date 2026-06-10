from __future__ import annotations

from fastapi import HTTPException

PERMISSIONS_BY_LEVEL: dict[str, frozenset[str]] = {
    "owner": frozenset({
        "view_clinic",
        "edit_clinic",
        "edit_banking",
        "edit_branding",
        "edit_settings",
        "manage_members",
        "view_patients",
        "invite_patients",
    }),
    "admin": frozenset({
        "view_clinic",
        "edit_clinic",
        "edit_banking",
        "edit_branding",
        "edit_settings",
        "manage_members",
        "view_patients",
        "invite_patients",
    }),
    "staff": frozenset({
        "view_clinic",
        "view_patients",
    }),
    "associate_provider": frozenset({
        "view_clinic",
        "view_patients",
        "invite_patients",
    }),
}


def permissions_for_level(access_level: str) -> list[str]:
    return sorted(PERMISSIONS_BY_LEVEL.get(access_level, frozenset()))


def require_permission(membership: dict, permission: str) -> None:
    level = membership.get("access_level", "")
    if permission not in PERMISSIONS_BY_LEVEL.get(level, frozenset()):
        raise HTTPException(status_code=403, detail="Insufficient clinic permissions")


def require_owner_or_admin(membership: dict) -> None:
    if membership.get("access_level") not in ("owner", "admin"):
        raise HTTPException(status_code=403, detail="Only clinic owners and admins can perform this action")
