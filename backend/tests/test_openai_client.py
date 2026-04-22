import httpx
import pytest

from backend.app.openai_client import OPENAI_RESPONSES_URL, ask_openai
from backend.app.settings import Settings


@pytest.mark.anyio
async def test_ask_openai_requires_api_key() -> None:
    settings = Settings(openai_api_key="")

    with pytest.raises(ValueError, match="OPENAI_API_KEY is not configured."):
        await ask_openai("What is 2+2?", settings)


@pytest.mark.anyio
async def test_ask_openai_builds_expected_request() -> None:
    captured_request: httpx.Request | None = None

    async def handler(request: httpx.Request) -> httpx.Response:
        nonlocal captured_request
        captured_request = request
        return httpx.Response(
            200,
            json={
                "model": "gpt-5.2",
                "output_text": "4",
            },
        )

    transport = httpx.MockTransport(handler)
    settings = Settings(openai_api_key="test-key")

    async with httpx.AsyncClient(transport=transport) as client:
        result = await ask_openai("What is 2+2?", settings, client=client)

    assert captured_request is not None
    assert str(captured_request.url) == OPENAI_RESPONSES_URL
    assert captured_request.headers["Authorization"] == "Bearer test-key"
    assert result == {"model": "gpt-5.2", "response": "4"}


@pytest.mark.anyio
async def test_ask_openai_reads_text_from_output_items() -> None:
    async def handler(_: httpx.Request) -> httpx.Response:
        return httpx.Response(
            200,
            json={
                "model": "gpt-5.2",
                "output": [
                    {
                        "type": "message",
                        "role": "assistant",
                        "content": [
                            {"type": "output_text", "text": "4"},
                        ],
                    }
                ],
            },
        )

    transport = httpx.MockTransport(handler)
    settings = Settings(openai_api_key="test-key")

    async with httpx.AsyncClient(transport=transport) as client:
        result = await ask_openai("What is 2+2?", settings, client=client)

    assert result == {"model": "gpt-5.2", "response": "4"}
