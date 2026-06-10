from __future__ import annotations

import mimetypes
import os
import uuid

import boto3
from botocore.exceptions import BotoCoreError, ClientError

from config import (
    ALLOWED_DOCUMENT_TYPES,
    ALLOWED_IMAGE_TYPES,
    ALLOWED_VOICE_TYPES,
    MAX_DOCUMENT_BYTES,
    MAX_IMAGE_BYTES,
    MAX_VOICE_BYTES,
    S3_ACCESS_KEY_ID,
    S3_BUCKET_NAME,
    S3_REGION,
    S3_SECRET_ACCESS_KEY,
    S3_SSL_VERIFY,
)

CHAT_ALLOWED_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".webm",
    ".mp3",
    ".mpeg",
    ".mp4",
    ".ogg",
    ".wav",
    ".m4a",
    ".aac",
    ".pdf",
    ".doc",
    ".docx",
    ".txt",
    ".xls",
    ".xlsx",
}


class ChatMediaStorage:
    def __init__(self) -> None:
        self.bucket_name = S3_BUCKET_NAME
        self.region = S3_REGION
        if not S3_SSL_VERIFY:
            import urllib3

            urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
        self.client = boto3.client(
            "s3",
            aws_access_key_id=S3_ACCESS_KEY_ID,
            aws_secret_access_key=S3_SECRET_ACCESS_KEY,
            region_name=self.region,
            verify=S3_SSL_VERIFY,
        )

    def public_url(self, key: str) -> str:
        return f"https://{self.bucket_name}.s3.{self.region}.amazonaws.com/{key}"

    def upload_chat_media(
        self,
        *,
        conversation_id: str,
        message_id: str,
        file_bytes: bytes,
        filename: str,
        content_type: str,
    ) -> dict[str, str]:
        ext = os.path.splitext(filename)[1].lower() or mimetypes.guess_extension(content_type) or ""
        if ext not in CHAT_ALLOWED_EXTENSIONS:
            raise ValueError(f"Unsupported file type '{ext}' for chat media.")

        if content_type in ALLOWED_IMAGE_TYPES and len(file_bytes) > MAX_IMAGE_BYTES:
            raise ValueError("Image exceeds size limit.")
        if content_type in ALLOWED_VOICE_TYPES and len(file_bytes) > MAX_VOICE_BYTES:
            raise ValueError("Voice message exceeds size limit.")
        if content_type in ALLOWED_DOCUMENT_TYPES and len(file_bytes) > MAX_DOCUMENT_BYTES:
            raise ValueError("Document exceeds size limit.")

        safe_name = os.path.basename(filename).replace(" ", "_")
        key = f"chat/{conversation_id}/{message_id}/{safe_name}"
        try:
            self.client.put_object(
                Bucket=self.bucket_name,
                Key=key,
                Body=file_bytes,
                ContentType=content_type,
            )
        except (BotoCoreError, ClientError) as exc:
            raise RuntimeError(f"S3 upload failed: {exc}") from exc

        return {"key": key, "url": self.public_url(key)}


media_storage = ChatMediaStorage()


def new_message_id() -> str:
    return uuid.uuid4().hex
