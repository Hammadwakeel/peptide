import sys
from pathlib import Path

from config import GCS_BUCKET_NAME, GCS_CREDENTIALS_PATH, GCS_USE_OBJECT_ACL

BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(BACKEND_DIR / "storage"))
from gcs import GoogleCloudStorage  # noqa: E402

gcs = GoogleCloudStorage(
    credentials_path=GCS_CREDENTIALS_PATH,
    bucket_name=GCS_BUCKET_NAME,
    use_object_acl=GCS_USE_OBJECT_ACL,
)
