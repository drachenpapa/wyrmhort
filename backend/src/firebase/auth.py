import os

from fastapi import HTTPException, Request, status
from firebase_admin import auth, exceptions as firebase_exceptions

from logger_config import setup_logger

logger = setup_logger(__name__)
ALLOWED_EMAIL = os.environ.get("ALLOWED_EMAIL")


async def get_current_user_uid(request: Request) -> str:
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        logger.warning("Authorization header missing or malformed.")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing or invalid auth header")

    id_token = auth_header.split("Bearer ")[1]

    try:
        decoded_token = auth.verify_id_token(id_token)
        uid: str = decoded_token["uid"]
        email: str | None = decoded_token.get("email")
    except firebase_exceptions.FirebaseError as e:
        logger.warning(f"Token verification failed: {e}")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token verification failed") from e
    except Exception as e:
        logger.error(f"Unexpected error during token verification: {e}")
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Auth service unavailable") from e

    if ALLOWED_EMAIL and email != ALLOWED_EMAIL:
        logger.warning(f"Access denied for email: {email}")
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    return uid
