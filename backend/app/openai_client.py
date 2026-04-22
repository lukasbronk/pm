import json
from typing import Any

import httpx

from backend.app.settings import Settings

OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses"


class OpenAIRequestError(Exception):
    def __init__(self, message: str, status_code: int | None = None) -> None:
        super().__init__(message)
        self.status_code = status_code


def extract_output_text(data: dict[str, Any]) -> str:
    output_text = data.get("output_text")
    if isinstance(output_text, str) and output_text.strip():
        return output_text

    output_items = data.get("output", [])
    if not isinstance(output_items, list):
        raise ValueError("OpenAI response did not contain text output.")

    text_parts: list[str] = []
    for item in output_items:
        if not isinstance(item, dict):
            continue
        for content in item.get("content", []):
            if not isinstance(content, dict):
                continue
            if content.get("type") == "output_text" and isinstance(content.get("text"), str):
                text_parts.append(content["text"])

    text = "".join(text_parts).strip()
    if not text:
        raise ValueError("OpenAI response did not contain text output.")
    return text


async def ask_openai(
    prompt: str,
    settings: Settings,
    client: httpx.AsyncClient | None = None,
) -> dict[str, Any]:
    if not settings.openai_api_key:
        raise ValueError("OPENAI_API_KEY is not configured.")

    payload = {
        "model": settings.openai_model,
        "input": prompt,
    }
    headers = {
        "Authorization": f"Bearer {settings.openai_api_key}",
        "Content-Type": "application/json",
    }

    if client is not None:
        response = await client.post(OPENAI_RESPONSES_URL, json=payload, headers=headers)
    else:
        async with httpx.AsyncClient(timeout=30.0) as async_client:
            response = await async_client.post(
                OPENAI_RESPONSES_URL,
                json=payload,
                headers=headers,
            )

    try:
        response.raise_for_status()
    except httpx.HTTPStatusError as exc:
        detail = exc.response.text
        raise OpenAIRequestError(detail, exc.response.status_code) from exc
    data = response.json()
    return {
        "model": data.get("model", settings.openai_model),
        "response": extract_output_text(data),
    }


async def ask_openai_json(
    system_prompt: str,
    prompt: str,
    settings: Settings,
    json_schema: dict[str, Any],
    client: httpx.AsyncClient | None = None,
) -> dict[str, Any]:
    if not settings.openai_api_key:
        raise ValueError("OPENAI_API_KEY is not configured.")

    payload = {
        "model": settings.openai_model,
        "input": [
            {
                "role": "system",
                "content": [{"type": "input_text", "text": system_prompt}],
            },
            {
                "role": "user",
                "content": [{"type": "input_text", "text": prompt}],
            },
        ],
        "text": {
            "format": {
                "type": "json_schema",
                "name": json_schema["name"],
                "schema": json_schema["schema"],
                "strict": True,
            }
        },
    }
    headers = {
        "Authorization": f"Bearer {settings.openai_api_key}",
        "Content-Type": "application/json",
    }

    if client is not None:
        response = await client.post(OPENAI_RESPONSES_URL, json=payload, headers=headers)
    else:
        async with httpx.AsyncClient(timeout=30.0) as async_client:
            response = await async_client.post(
                OPENAI_RESPONSES_URL,
                json=payload,
                headers=headers,
            )

    try:
        response.raise_for_status()
    except httpx.HTTPStatusError as exc:
        detail = exc.response.text
        raise OpenAIRequestError(detail, exc.response.status_code) from exc
    data = response.json()
    text = extract_output_text(data)

    return {
        "model": data.get("model", settings.openai_model),
        "data": json.loads(text),
    }
