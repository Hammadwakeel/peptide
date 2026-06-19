from pydantic import BaseModel, Field


class PaginationQuery(BaseModel):
    page: int = Field(1, ge=1)
    limit: int = Field(50, ge=1, le=100)


def paginated_response(items: list, total: int, page: int, limit: int, key: str = "data") -> dict:
    total_pages = max(1, (total + limit - 1) // limit) if total > 0 else 0
    return {
        "status": True,
        key: items,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "total_pages": total_pages if total > 0 else 0,
            "has_next": page < total_pages,
            "has_prev": page > 1,
        },
    }
