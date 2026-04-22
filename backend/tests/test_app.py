import sqlite3
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from backend.app.main import app, settings


@pytest.fixture
def client(tmp_path: Path) -> TestClient:
    original_db_path = settings.db_path
    settings.db_path = str(tmp_path / "pm.sqlite3")

    with TestClient(app) as test_client:
        yield test_client

    settings.db_path = original_db_path


def login(client: TestClient) -> None:
    response = client.post(
        "/api/auth/login",
        json={"username": "user", "password": "password"},
    )
    assert response.status_code == 200


def test_health_route(client: TestClient) -> None:
    response = client.get("/api/health")

    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_index_route(client: TestClient) -> None:
    response = client.get("/")

    assert response.status_code == 200
    assert "Kanban Studio" in response.text


def test_session_defaults_to_unauthenticated(client: TestClient) -> None:
    response = client.get("/api/auth/session")

    assert response.status_code == 200
    assert response.json() == {"authenticated": False, "username": None}


def test_login_logout_flow(client: TestClient) -> None:
    login(client)

    session_response = client.get("/api/auth/session")
    assert session_response.status_code == 200
    assert session_response.json() == {"authenticated": True, "username": "user"}

    logout_response = client.post("/api/auth/logout")
    assert logout_response.status_code == 200
    assert logout_response.json() == {"authenticated": False, "username": None}

    final_session_response = client.get("/api/auth/session")
    assert final_session_response.status_code == 200
    assert final_session_response.json() == {
        "authenticated": False,
        "username": None,
    }


def test_login_rejects_invalid_credentials(client: TestClient) -> None:
    response = client.post(
        "/api/auth/login",
        json={"username": "user", "password": "wrong"},
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid credentials"


def test_board_requires_authentication(client: TestClient) -> None:
    response = client.get("/api/board")

    assert response.status_code == 401
    assert response.json()["detail"] == "Authentication required"


def test_board_is_created_automatically_and_db_file_exists(
    client: TestClient,
    tmp_path: Path,
) -> None:
    login(client)

    response = client.get("/api/board")

    assert response.status_code == 200
    board = response.json()
    assert len(board["columns"]) == 5
    assert "card-1" in board["cards"]
    assert (tmp_path / "pm.sqlite3").exists()


def test_board_update_persists_for_authenticated_user(client: TestClient) -> None:
    login(client)
    initial_board = client.get("/api/board").json()
    initial_board["columns"][0]["title"] = "Ready"

    update_response = client.put("/api/board", json=initial_board)
    assert update_response.status_code == 200
    assert update_response.json()["columns"][0]["title"] == "Ready"

    reload_response = client.get("/api/board")
    assert reload_response.status_code == 200
    assert reload_response.json()["columns"][0]["title"] == "Ready"


def test_invalid_board_payload_is_rejected(client: TestClient) -> None:
    login(client)
    invalid_board = {
        "columns": [{"id": "col-1", "title": "Only One", "cardIds": []}],
        "cards": {},
    }

    response = client.put("/api/board", json=invalid_board)

    assert response.status_code == 400
    assert response.json()["detail"] == "Board must contain exactly 5 columns."


def test_database_contains_user_and_board_rows(client: TestClient, tmp_path: Path) -> None:
    login(client)
    response = client.get("/api/board")
    assert response.status_code == 200

    with sqlite3.connect(tmp_path / "pm.sqlite3") as connection:
        user_count = connection.execute("SELECT COUNT(*) FROM users").fetchone()[0]
        board_count = connection.execute("SELECT COUNT(*) FROM boards").fetchone()[0]

    assert user_count == 1
    assert board_count == 1


def test_ai_test_requires_authentication(client: TestClient) -> None:
    response = client.post("/api/ai/test")

    assert response.status_code == 401
    assert response.json()["detail"] == "Authentication required"


def test_ai_test_requires_api_key(client: TestClient) -> None:
    login(client)
    original_key = settings.openai_api_key
    settings.openai_api_key = ""

    response = client.post("/api/ai/test")

    settings.openai_api_key = original_key
    assert response.status_code == 500
    assert response.json()["detail"] == "OPENAI_API_KEY is not configured."
