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
    assert len(board["columns"]) >= 1
    assert board["viewMode"] == "classic"
    assert board["themeId"] == "core"
    assert board["playerProfile"]["primaryRole"] == "product"
    assert board["drawSettings"]["sourceColumnId"] == "col-backlog"
    assert board["drawSettings"]["targetColumnId"] == "col-discovery"
    assert board["runState"]["redrawsRemaining"] == 1
    assert board["cards"]["card-1"]["workType"] == "product"
    assert board["cards"]["card-1"]["blocked"] is False
    assert board["cards"]["card-1"]["drawState"]["lastDrawnAt"] is None
    assert "card-1" in board["cards"]
    assert (tmp_path / "pm.sqlite3").exists()


def test_board_update_persists_for_authenticated_user(client: TestClient) -> None:
    login(client)
    initial_board = client.get("/api/board").json()
    initial_board["columns"][0]["title"] = "Ready"
    initial_board["viewMode"] = "arcade"
    initial_board["playerProfile"]["primaryRole"] = "design"
    initial_board["drawSettings"]["sourceColumnId"] = "col-discovery"
    initial_board["drawSettings"]["targetColumnId"] = "col-progress"
    initial_board["runState"]["redrawsRemaining"] = 0
    initial_board["cards"]["card-1"]["blocked"] = True
    initial_board["cards"]["card-1"]["drawState"]["lastDrawnAt"] = "2026-04-22T10:00:00.000Z"

    update_response = client.put("/api/board", json=initial_board)
    assert update_response.status_code == 200
    assert update_response.json()["columns"][0]["title"] == "Ready"
    assert update_response.json()["viewMode"] == "arcade"
    assert update_response.json()["playerProfile"]["primaryRole"] == "design"
    assert update_response.json()["drawSettings"]["sourceColumnId"] == "col-discovery"
    assert update_response.json()["drawSettings"]["targetColumnId"] == "col-progress"
    assert update_response.json()["runState"]["redrawsRemaining"] == 0
    assert update_response.json()["cards"]["card-1"]["blocked"] is True

    reload_response = client.get("/api/board")
    assert reload_response.status_code == 200
    assert reload_response.json()["columns"][0]["title"] == "Ready"
    assert reload_response.json()["viewMode"] == "arcade"
    assert reload_response.json()["playerProfile"]["primaryRole"] == "design"
    assert reload_response.json()["drawSettings"]["sourceColumnId"] == "col-discovery"
    assert reload_response.json()["drawSettings"]["targetColumnId"] == "col-progress"
    assert reload_response.json()["runState"]["redrawsRemaining"] == 0
    assert reload_response.json()["cards"]["card-1"]["drawState"]["lastDrawnAt"] == "2026-04-22T10:00:00.000Z"


def test_invalid_board_payload_is_rejected(client: TestClient) -> None:
    login(client)
    invalid_board = {
        "columns": [],
        "cards": {},
    }

    response = client.put("/api/board", json=invalid_board)

    assert response.status_code == 400
    assert response.json()["detail"] == "Board must contain at least 1 column."


def test_variable_column_count_is_accepted(client: TestClient) -> None:
    login(client)
    board = client.get("/api/board").json()
    board["columns"].append({"id": "col-extra", "title": "Extra", "cardIds": []})

    response = client.put("/api/board", json=board)

    assert response.status_code == 200
    assert len(response.json()["columns"]) == 6


def test_invalid_draw_settings_are_normalized(client: TestClient) -> None:
    login(client)
    board = client.get("/api/board").json()
    board["drawSettings"]["targetColumnId"] = board["drawSettings"]["sourceColumnId"]

    response = client.put("/api/board", json=board)

    assert response.status_code == 200
    assert response.json()["drawSettings"]["sourceColumnId"] == "col-backlog"
    assert response.json()["drawSettings"]["targetColumnId"] == "col-discovery"


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


def test_ai_chat_requires_authentication(client: TestClient) -> None:
    response = client.post("/api/ai/chat", json={"message": "Hello"})

    assert response.status_code == 401
    assert response.json()["detail"] == "Authentication required"


def test_ai_history_requires_authentication(client: TestClient) -> None:
    response = client.get("/api/ai/history")

    assert response.status_code == 401
    assert response.json()["detail"] == "Authentication required"


def test_ai_chat_requires_api_key(client: TestClient) -> None:
    login(client)
    original_key = settings.openai_api_key
    settings.openai_api_key = ""

    response = client.post("/api/ai/chat", json={"message": "Hello"})

    settings.openai_api_key = original_key
    assert response.status_code == 400
    assert response.json()["detail"] == "OPENAI_API_KEY is not configured."


def test_ai_chat_applies_board_changes_and_stores_history(
    client: TestClient,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    login(client)
    captured_history: list[dict[str, str]] = []

    async def fake_ask_openai_json(*args, **kwargs):  # type: ignore[no-untyped-def]
        return {
            "model": "gpt-5.2",
            "data": {
                "reply": "I added the card.",
                "operations": [
                    {
                        "action": "create",
                        "column_id": "col-backlog",
                        "card": {
                            "id": "card-new",
                            "title": "New task",
                            "details": "Created by AI.",
                        },
                    }
                ],
            },
        }

    monkeypatch.setattr("backend.app.ai.ask_openai_json", fake_ask_openai_json)

    response = client.post("/api/ai/chat", json={"message": "Add a new backlog card"})

    assert response.status_code == 200
    body = response.json()
    assert body["reply"] == "I added the card."
    assert body["operations"][0]["action"] == "create"
    assert "card-new" in body["board"]["cards"]

    board_response = client.get("/api/board")
    assert board_response.status_code == 200
    assert "card-new" in board_response.json()["cards"]

    async def fake_run_board_ai(*, conversation_history, **kwargs):  # type: ignore[no-untyped-def]
        captured_history.extend(conversation_history)
        return {
            "model": "gpt-5.2",
            "reply": "No new changes.",
            "operations": [],
            "board": board_response.json(),
        }

    monkeypatch.setattr("backend.app.ai_routes.run_board_ai", fake_run_board_ai)
    follow_up = client.post("/api/ai/chat", json={"message": "What changed?"})

    assert follow_up.status_code == 200
    assert captured_history[-2:] == [
        {"role": "user", "content": "Add a new backlog card"},
        {"role": "assistant", "content": "I added the card."},
    ]


def test_ai_history_returns_session_messages(
    client: TestClient,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    login(client)

    async def fake_ask_openai_json(*args, **kwargs):  # type: ignore[no-untyped-def]
        return {
            "model": "gpt-5.2",
            "data": {
                "reply": "Done.",
                "operations": [],
            },
        }

    monkeypatch.setattr("backend.app.ai.ask_openai_json", fake_ask_openai_json)
    response = client.post("/api/ai/chat", json={"message": "Summarize the board"})
    assert response.status_code == 200

    history_response = client.get("/api/ai/history")
    assert history_response.status_code == 200
    assert history_response.json()["messages"][-2:] == [
        {"role": "user", "content": "Summarize the board"},
        {"role": "assistant", "content": "Done."},
    ]
