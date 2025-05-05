import os

from fastapi import Request, HTTPException, status
from firebase_admin import auth

ALLOWED_EMAIL = os.environ.get("ALLOWED_EMAIL")


async def get_current_user_uid(request: Request) -> str:
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing or invalid auth header")

    id_token = auth_header.split("Bearer ")[1]

    try:
        decoded_token = auth.verify_id_token(id_token)
        uid = decoded_token["uid"]
        email = decoded_token.get("email")
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token verification failed")

    if ALLOWED_EMAIL and email != ALLOWED_EMAIL:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    return uid
