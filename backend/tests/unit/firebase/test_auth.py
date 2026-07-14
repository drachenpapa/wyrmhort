import pytest
from fastapi import HTTPException
from starlette.requests import Request

from firebase.auth import get_current_user_uid


def _make_request(token: str | None) -> Request:
    headers = [(b"authorization", f"Bearer {token}".encode())] if token else []
    return Request(scope={"type": "http", "headers": headers})


async def test_valid_token_returns_uid(monkeypatch):
    monkeypatch.setattr("firebase_admin.auth.verify_id_token", lambda _: {"uid": "user-123"})
    uid = await get_current_user_uid(_make_request("valid-token"))
    assert uid == "user-123"


async def test_missing_auth_header_raises_401():
    with pytest.raises(HTTPException) as exc_info:
        await get_current_user_uid(_make_request(None))
    assert exc_info.value.status_code == 401


async def test_invalid_token_raises_401(monkeypatch):
    from firebase_admin import exceptions as firebase_exceptions

    def _fail(_):
        raise firebase_exceptions.FirebaseError("INVALID_ARGUMENT", "bad token")

    monkeypatch.setattr("firebase_admin.auth.verify_id_token", _fail)
    with pytest.raises(HTTPException) as exc_info:
        await get_current_user_uid(_make_request("bad-token"))
    assert exc_info.value.status_code == 401


async def test_unexpected_error_during_verification_raises_503(monkeypatch):
    def _fail(_):
        raise RuntimeError("network error")

    monkeypatch.setattr("firebase_admin.auth.verify_id_token", _fail)
    with pytest.raises(HTTPException) as exc_info:
        await get_current_user_uid(_make_request("any-token"))
    assert exc_info.value.status_code == 503


async def test_disallowed_email_raises_403(monkeypatch):
    monkeypatch.setattr("firebase.auth.ALLOWED_EMAIL", "allowed@example.com")
    monkeypatch.setattr(
        "firebase_admin.auth.verify_id_token",
        lambda _: {"uid": "user-123", "email": "other@example.com"},
    )
    with pytest.raises(HTTPException) as exc_info:
        await get_current_user_uid(_make_request("valid-token"))
    assert exc_info.value.status_code == 403


async def test_allowed_email_passes(monkeypatch):
    monkeypatch.setattr("firebase.auth.ALLOWED_EMAIL", "allowed@example.com")
    monkeypatch.setattr(
        "firebase_admin.auth.verify_id_token",
        lambda _: {"uid": "user-123", "email": "allowed@example.com"},
    )
    uid = await get_current_user_uid(_make_request("valid-token"))
    assert uid == "user-123"
