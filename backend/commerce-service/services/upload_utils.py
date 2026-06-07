from fastapi import HTTPException, UploadFile

MAX_FILE_SIZE = 10 * 1024 * 1024
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}


async def read_image_upload(file: UploadFile) -> tuple[bytes, str]:
    if not file.filename:
        raise HTTPException(status_code=400, detail="Product image must have a filename")

    content_type = file.content_type or "application/octet-stream"
    if content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported image type: {content_type}. Allowed: JPEG, PNG, WebP",
        )

    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="Product image is empty")
    if len(data) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="Image exceeds 10 MB limit")

    return data, content_type
