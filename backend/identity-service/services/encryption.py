from __future__ import annotations

import base64
import hashlib
import os

from cryptography.hazmat.primitives.ciphers.aead import AESGCM

from config import JWT_SECRET


def _encryption_key() -> bytes:
    secret = os.getenv("BANKING_ENCRYPTION_KEY", JWT_SECRET)
    if not secret:
        raise ValueError("BANKING_ENCRYPTION_KEY or JWT_SECRET must be set for banking encryption")
    return hashlib.sha256(secret.encode()).digest()


def encrypt_value(value: str) -> str:
    key = _encryption_key()
    nonce = os.urandom(12)
    ciphertext = AESGCM(key).encrypt(nonce, value.encode(), None)
    return base64.b64encode(nonce + ciphertext).decode()


def decrypt_value(token: str) -> str:
    key = _encryption_key()
    raw = base64.b64decode(token)
    nonce, ciphertext = raw[:12], raw[12:]
    return AESGCM(key).decrypt(nonce, ciphertext, None).decode()
