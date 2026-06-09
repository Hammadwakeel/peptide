import mimetypes
import os
from pathlib import Path

import boto3
from botocore.exceptions import BotoCoreError, ClientError
from dotenv import load_dotenv

SERVICE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(SERVICE_DIR / ".env", override=True)

ALLOWED_EXTENSIONS = {
    # images
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".webp",
    # documents
    ".pdf",
    ".doc",
    ".docx",
    ".xls",
    ".xlsx",
    ".txt",
    ".csv",
}


class S3Service:
    """Upload images/documents to S3 and delete them."""

    def __init__(
        self,
        access_key_id: str | None = None,
        secret_access_key: str | None = None,
        region: str | None = None,
        bucket_name: str | None = None,
    ):
        self.bucket_name = bucket_name or os.getenv("S3_BUCKET_NAME", "")
        self.region = region or os.getenv("S3_REGION", "us-east-1")
        self.client = boto3.client(
            "s3",
            aws_access_key_id=access_key_id or os.getenv("S3_ACCESS_KEY_ID"),
            aws_secret_access_key=secret_access_key or os.getenv("S3_SECRET_ACCESS_KEY"),
            region_name=self.region,
        )

    @staticmethod
    def _validate(key: str) -> None:
        ext = os.path.splitext(key)[1].lower()
        if ext not in ALLOWED_EXTENSIONS:
            raise ValueError(f"Unsupported file type '{ext}'. Only images and documents are allowed.")

    def upload_file(self, local_file_path: str, key: str) -> dict:
        if not os.path.exists(local_file_path):
            raise FileNotFoundError(local_file_path)

        with open(local_file_path, "rb") as f:
            file_bytes = f.read()
        content_type, _ = mimetypes.guess_type(local_file_path)
        return self.upload_bytes(file_bytes, key, content_type=content_type)

    def upload_bytes(
        self,
        file_bytes: bytes,
        key: str,
        content_type: str | None = None,
    ) -> dict:
        self._validate(key)
        if content_type is None:
            content_type, _ = mimetypes.guess_type(key)
        extra_args = {"ContentType": content_type} if content_type else {}
        try:
            self.client.put_object(
                Bucket=self.bucket_name,
                Key=key,
                Body=file_bytes,
                **extra_args,
            )
        except (BotoCoreError, ClientError) as exc:
            raise RuntimeError(f"S3 upload failed: {exc}") from exc

        return {"key": key}

    def delete_file(self, key: str) -> None:
        try:
            self.client.delete_object(Bucket=self.bucket_name, Key=key)
        except (BotoCoreError, ClientError) as exc:
            raise RuntimeError(f"S3 delete failed: {exc}") from exc
