import json
from typing import Any

from backend.app.database import apply_card_operations
from backend.app.openai_client import ask_openai_json
from backend.app.settings import Settings

SYSTEM_PROMPT = """
You are an assistant for a single-board kanban project management app.

You must respond with JSON only. Do not include markdown fences.

You may help the user conversationally and optionally request card changes.
You may only perform card actions:
- create
- edit
- move
- delete

You must not rename columns.
You must not add or remove columns.
""".strip()


def get_ai_response_schema() -> dict[str, Any]:
    return {
        "name": "kanban_ai_response",
        "schema": {
            "type": "object",
            "additionalProperties": False,
            "properties": {
                "reply": {"type": "string"},
                "operations": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "additionalProperties": False,
                        "properties": {
                            "action": {
                                "type": "string",
                                "enum": ["create", "edit", "move", "delete"],
                            },
                            "column_id": {"type": ["string", "null"]},
                            "to_column_id": {"type": ["string", "null"]},
                            "position": {"type": ["integer", "null"]},
                            "card_id": {"type": ["string", "null"]},
                            "title": {"type": ["string", "null"]},
                            "details": {"type": ["string", "null"]},
                            "card": {
                                "type": ["object", "null"],
                                "additionalProperties": False,
                                "properties": {
                                    "id": {"type": "string"},
                                    "title": {"type": "string"},
                                    "details": {"type": "string"},
                                },
                                "required": ["id", "title", "details"],
                            },
                        },
                        "required": [
                            "action",
                            "column_id",
                            "to_column_id",
                            "position",
                            "card_id",
                            "title",
                            "details",
                            "card",
                        ],
                    },
                },
            },
            "required": ["reply", "operations"],
        },
    }


def validate_ai_operations(operations: list[dict[str, Any]]) -> None:
    for operation in operations:
        action = operation.get("action")
        if action == "create":
            if "column_id" not in operation or "card" not in operation:
                raise ValueError("Create operations require column_id and card.")
        elif action == "edit":
            if "card_id" not in operation:
                raise ValueError("Edit operations require card_id.")
            if "title" not in operation and "details" not in operation:
                raise ValueError("Edit operations require title or details.")
        elif action == "move":
            if "card_id" not in operation or "to_column_id" not in operation:
                raise ValueError("Move operations require card_id and to_column_id.")
        elif action == "delete":
            if "card_id" not in operation:
                raise ValueError("Delete operations require card_id.")
        else:
            raise ValueError(f"Unsupported card action: {action}")


async def run_board_ai(
    board: dict[str, Any],
    user_message: str,
    conversation_history: list[dict[str, str]],
    settings: Settings,
    client: Any = None,
) -> dict[str, Any]:
    schema = get_ai_response_schema()
    prompt = json.dumps(
        {
            "conversation_history": conversation_history,
            "board": board,
            "user_message": user_message,
            "rules": {
                "columns_are_fixed": True,
                "allowed_actions": ["create", "edit", "move", "delete"],
            },
        }
    )

    result = await ask_openai_json(
        system_prompt=SYSTEM_PROMPT,
        prompt=prompt,
        settings=settings,
        json_schema=schema,
        client=client,
    )

    data = result["data"]
    operations = data.get("operations", [])
    if not isinstance(operations, list):
        raise ValueError("AI response operations must be a list.")

    validate_ai_operations(operations)
    updated_board = apply_card_operations(board, operations) if operations else board

    return {
        "model": result["model"],
        "reply": data["reply"],
        "operations": operations,
        "board": updated_board,
    }
