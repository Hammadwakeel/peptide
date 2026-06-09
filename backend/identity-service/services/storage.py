import sys
from pathlib import Path

COMMON_SERVICE_DIR = Path(__file__).resolve().parent.parent.parent / "common-service"
sys.path.insert(0, str(COMMON_SERVICE_DIR))

from service.s3_service import S3Service  # noqa: E402

s3 = S3Service()


def public_url(key: str) -> str:
    """Public object URL for a key in the configured S3 bucket."""
    return f"https://{s3.bucket_name}.s3.{s3.region}.amazonaws.com/{key}"
