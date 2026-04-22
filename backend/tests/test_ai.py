import httpx
import pytest

from backend.app.ai import get_ai_response_schema, run_board_ai
from backend.app.database import DEFAULT_BOARD
from backend.app.openai_client import OPENAI_RESPONSES_URL, ask_openai_json
from backend.app.settings import Settings


@pytest.mark.anyio
async def test_ask_openai_json_builds_structured_request() -> None:
    captured_request: httpx.Request | None = None

    async def handler(request: httpx.Request) -> httpx.Response:
        nonlocal captured_request
        captured_request = request
        return httpx.Response(
            200,
            json={
                "model": "gpt-5.2",
                "output_text": '{"reply":"4","operations":[]}',
            },
        )

    transport = httpx.MockTransport(handler)
    settings = Settings(openai_api_key="test-key")
    schema = get_ai_response_schema()

    async with httpx.AsyncClient(transport=transport) as client:
        result = await ask_openai_json(
            system_prompt="You are helpful.",
            prompt="What is 2+2?",
            settings=settings,
            json_schema=schema,
            client=client,
        )

    assert captured_request is not None
    assert str(captured_request.url) == OPENAI_RESPONSES_URL
    assert result["data"] == {"reply": "4", "operations": []}


@pytest.mark.anyio
async def test_run_board_ai_reply_only() -> None:
    async def handler(_: httpx.Request) -> httpx.Response:
        return httpx.Response(
            200,
            json={
                "model": "gpt-5.2",
                "output_text": '{"reply":"No board changes needed.","operations":[]}',
            },
        )

    transport = httpx.MockTransport(handler)
    settings = Settings(openai_api_key="test-key")

    async with httpx.AsyncClient(transport=transport) as client:
        result = await run_board_ai(
            board=DEFAULT_BOARD,
            user_message="Summarize the board",
            conversation_history=[],
            settings=settings,
            client=client,
        )

    assert result["reply"] == "No board changes needed."
    assert result["operations"] == []
    assert result["board"] == DEFAULT_BOARD


@pytest.mark.anyio
async def test_run_board_ai_create_card() -> None:
    async def handler(_: httpx.Request) -> httpx.Response:
        return httpx.Response(
            200,
            json={
                "model": "gpt-5.2",
                "output_text": """
                {
                  "reply":"I added the card.",
                  "operations":[
                    {
                      "action":"create",
                      "column_id":"col-backlog",
                      "card":{
                        "id":"card-new",
                        "title":"New task",
                        "details":"Created by AI."
                      }
                    }
                  ]
                }
                """,
            },
        )

    transport = httpx.MockTransport(handler)
    settings = Settings(openai_api_key="test-key")

    async with httpx.AsyncClient(transport=transport) as client:
        result = await run_board_ai(
            board=DEFAULT_BOARD,
            user_message="Add a new backlog card",
            conversation_history=[],
            settings=settings,
            client=client,
        )

    assert result["operations"][0]["action"] == "create"
    assert "card-new" in result["board"]["cards"]


@pytest.mark.anyio
async def test_run_board_ai_rejects_invalid_operation() -> None:
    async def handler(_: httpx.Request) -> httpx.Response:
        return httpx.Response(
            200,
            json={
                "model": "gpt-5.2",
                "output_text": '{"reply":"Done.","operations":[{"action":"rename_column","column_id":"col-backlog"}]}',
            },
        )

    transport = httpx.MockTransport(handler)
    settings = Settings(openai_api_key="test-key")

    async with httpx.AsyncClient(transport=transport) as client:
        with pytest.raises(ValueError, match="Unsupported card action: rename_column"):
            await run_board_ai(
                board=DEFAULT_BOARD,
                user_message="Rename a column",
                conversation_history=[],
                settings=settings,
                client=client,
            )


@pytest.mark.anyio
async def test_run_board_ai_rejects_create_with_null_card() -> None:
    async def handler(_: httpx.Request) -> httpx.Response:
        return httpx.Response(
            200,
            json={
                "model": "gpt-5.2",
                "output_text": """
                {
                  "reply":"Done.",
                  "operations":[
                    {
                      "action":"create",
                      "column_id":"col-backlog",
                      "to_column_id":null,
                      "position":null,
                      "card_id":null,
                      "title":null,
                      "details":null,
                      "card":null
                    }
                  ]
                }
                """,
            },
        )

    transport = httpx.MockTransport(handler)
    settings = Settings(openai_api_key="test-key")

    async with httpx.AsyncClient(transport=transport) as client:
        with pytest.raises(ValueError, match="Create operations require column_id and card."):
            await run_board_ai(
                board=DEFAULT_BOARD,
                user_message="Add a card",
                conversation_history=[],
                settings=settings,
                client=client,
            )
