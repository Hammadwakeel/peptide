import logging
import mimetypes
import os
import uuid

from google.cloud import storage

logger = logging.getLogger(__name__)


class GoogleCloudStorage:
    def __init__(
        self,
        credentials_path: str,
        bucket_name: str,
        *,
        use_object_acl: bool = False,
    ):
        self.client = storage.Client.from_service_account_json(credentials_path)
        self.bucket = self.client.bucket(bucket_name)
        self.use_object_acl = use_object_acl

    def _public_url(self, blob_name: str) -> str:
        return f"https://storage.googleapis.com/{self.bucket.name}/{blob_name}"

    def _maybe_make_public(self, blob, make_public: bool) -> str:
        if make_public and self.use_object_acl:
            try:
                blob.make_public()
                return blob.public_url
            except Exception as exc:
                logger.warning(
                    "Object ACL make_public failed (uniform bucket access?): %s",
                    exc,
                )
        return self._public_url(blob.name)

    def upload_file(
        self,
        local_file_path: str,
        folder: str = "",
        make_public: bool = False,
    ) -> dict:
        if not os.path.exists(local_file_path):
            raise FileNotFoundError(local_file_path)

        original_name = os.path.basename(local_file_path)
        ext = os.path.splitext(original_name)[1]
        unique_name = f"{uuid.uuid4().hex}{ext}"
        blob_name = f"{folder.strip('/')}/{unique_name}" if folder else unique_name

        content_type, _ = mimetypes.guess_type(local_file_path)
        blob = self.bucket.blob(blob_name)
        blob.upload_from_filename(local_file_path, content_type=content_type)
        url = self._maybe_make_public(blob, make_public)

        return {"file_name": original_name, "blob_name": blob_name, "url": url}

    def upload_bytes(
        self,
        file_bytes: bytes,
        filename: str,
        folder: str = "",
        content_type: str | None = None,
        make_public: bool = False,
    ) -> dict:
        ext = os.path.splitext(filename)[1]
        unique_name = f"{uuid.uuid4().hex}{ext}"
        blob_name = f"{folder.strip('/')}/{unique_name}" if folder else unique_name

        blob = self.bucket.blob(blob_name)
        blob.upload_from_string(file_bytes, content_type=content_type)
        url = self._maybe_make_public(blob, make_public)

        return {"blob_name": blob_name, "url": url}

    def delete_file(self, blob_name: str) -> None:
        blob = self.bucket.blob(blob_name)
        blob.delete()

    def generate_signed_url(self, blob_name: str, expiration_minutes: int = 60) -> str:
        from datetime import timedelta

        blob = self.bucket.blob(blob_name)
        return blob.generate_signed_url(
            version="v4",
            expiration=timedelta(minutes=expiration_minutes),
            method="GET",
        )
