import os
from pathlib import Path

from dotenv import load_dotenv

SERVICE_DIR = Path(__file__).resolve().parent
BACKEND_DIR = SERVICE_DIR.parent
load_dotenv(SERVICE_DIR / ".env", override=True)
load_dotenv(BACKEND_DIR / ".env", override=False)
load_dotenv(BACKEND_DIR / "common-service" / ".env", override=False)

PORT = int(os.getenv("COMMUNICATION_SERVICE_PORT", "3003"))
JWT_SECRET = os.getenv("JWT_SECRET", "")

MONGODB_URI = os.getenv("MONGODB_URI", "")
MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME", "frontien_chats")

REDIS_URL = os.getenv("REDIS_URL", "")

KAFKA_BOOTSTRAP_SERVERS = os.getenv(
    "KAFKA_BOOTSTRAP_SERVERS",
    "kafka-25c66c9e-aicallhistory-0f18.g.aivencloud.com:26614",
)
KAFKA_USERNAME = os.getenv("KAFKA_USERNAME", "")
KAFKA_PASSWORD = os.getenv("KAFKA_PASSWORD", "")
_ca_path = os.getenv("KAFKA_SSL_CA_LOCATION", "kafka.pem")
_ca = Path(_ca_path)
if not _ca.is_absolute():
    _ca = SERVICE_DIR / _ca
KAFKA_SSL_CA_LOCATION = str(_ca.resolve()) if _ca_path else ""
KAFKA_SSL_ENDPOINT_ALGORITHM = os.getenv("KAFKA_SSL_ENDPOINT_ALGORITHM", "none")
# Set false on Windows if Avast/antivirus SSL scanning breaks certificate verify (dev only)
KAFKA_SSL_VERIFY = os.getenv("KAFKA_SSL_VERIFY", "false").lower() == "true"
KAFKA_TOPIC = os.getenv("KAFKA_TOPIC", "chats")
KAFKA_CONSUMER_GROUP = os.getenv("KAFKA_CONSUMER_GROUP", "communication-service")

S3_ACCESS_KEY_ID = os.getenv("S3_ACCESS_KEY_ID", "")
S3_SECRET_ACCESS_KEY = os.getenv("S3_SECRET_ACCESS_KEY", "")
S3_REGION = os.getenv("S3_REGION", "us-east-1")
S3_BUCKET_NAME = os.getenv("S3_BUCKET_NAME", "")
# Set false on Windows if Avast/antivirus SSL scanning breaks certificate verify (dev only)
S3_SSL_VERIFY = os.getenv("S3_SSL_VERIFY", "false").lower() == "true"

MAX_TEXT_BYTES = int(os.getenv("CHAT_MAX_TEXT_BYTES", str(2000)))
MAX_IMAGE_BYTES = int(os.getenv("CHAT_MAX_IMAGE_BYTES", str(10 * 1024 * 1024)))
MAX_VOICE_BYTES = int(os.getenv("CHAT_MAX_VOICE_BYTES", str(25 * 1024 * 1024)))
MAX_DOCUMENT_BYTES = int(os.getenv("CHAT_MAX_DOCUMENT_BYTES", str(25 * 1024 * 1024)))

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}
ALLOWED_VOICE_TYPES = {
    "audio/webm",
    "audio/mpeg",
    "audio/mp4",
    "audio/ogg",
    "audio/wav",
    "audio/x-m4a",
    "audio/aac",
}
ALLOWED_DOCUMENT_TYPES = {
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
}
