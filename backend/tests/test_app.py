from fastapi.testclient import TestClient

from backend.app.main import app


client = TestClient(app)


def test_health_route() -> None:
    response = client.get("/api/health")

    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_index_route() -> None:
    response = client.get("/")

    assert response.status_code == 200
    assert "Kanban Studio" in response.text


def test_session_defaults_to_unauthenticated() -> None:
    response = client.get("/api/auth/session")

    assert response.status_code == 200
    assert response.json() == {"authenticated": False, "username": None}


def test_login_logout_flow() -> None:
    login_response = client.post(
        "/api/auth/login",
        json={"username": "user", "password": "password"},
    )
    assert login_response.status_code == 200
    assert login_response.json() == {"authenticated": True, "username": "user"}

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


def test_login_rejects_invalid_credentials() -> None:
    response = client.post(
        "/api/auth/login",
        json={"username": "user", "password": "wrong"},
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid credentials"
