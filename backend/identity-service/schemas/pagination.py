from pydantic import BaseModel, Field


class PaginationQuery(BaseModel):
    page: int = Field(1, ge=1, description="Page number (1-based)")
    limit: int = Field(20, ge=1, le=100, description="Items per page")


def build_pagination_meta(total: int, page: int, limit: int) -> dict:
    total_pages = max(1, (total + limit - 1) // limit) if total > 0 else 0
    return {
        "page": page,
        "limit": limit,
        "total": total,
        "total_pages": total_pages if total > 0 else 0,
        "has_next": page < total_pages,
        "has_prev": page > 1,
    }


def paginated_response(items: list, total: int, page: int, limit: int, key: str = "data") -> dict:
    return {
        "status": True,
        key: items,
        "pagination": build_pagination_meta(total, page, limit),
    }
