from typing import Any

import httpx

from backend.app.settings import Settings

OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses"


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

    response.raise_for_status()
    data = response.json()
    return {
        "model": data.get("model", settings.openai_model),
        "response": extract_output_text(data),
    }
