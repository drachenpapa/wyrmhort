import anyio
import pytest
from starlette.requests import Request

from firebase.auth import get_current_user_uid


def test_get_current_user_uid_valid(monkeypatch):
    mock_token = "fake-token"
    mock_request = Request(scope={"type": "http", "headers": [(b"authorization", f"Bearer {mock_token}".encode())]})

    def mock_verify_id_token(token):
        assert token == mock_token
        return {"uid": "user-123"}

    monkeypatch.setattr("firebase_admin.auth.verify_id_token", mock_verify_id_token)

    uid = anyio.run(get_current_user_uid, mock_request)
    assert uid == "user-123"


def test_get_current_user_uid_invalid_header():
    request = Request(scope={"type": "http", "headers": []})

    with pytest.raises(Exception) as exc_info:
        anyio.run(get_current_user_uid, request)

    assert "Missing or invalid auth header" in str(exc_info.value)


def test_get_current_user_uid_invalid_token(monkeypatch):
    request = Request(scope={"type": "http", "headers": [(b"authorization", b"Bearer invalid")]})

    def mock_verify_id_token(token):
        raise Exception("Invalid token")

    monkeypatch.setattr("firebase_admin.auth.verify_id_token", mock_verify_id_token)

    with pytest.raises(Exception) as exc_info:
        anyio.run(get_current_user_uid, request)

    assert "Token verification failed" in str(exc_info.value)
