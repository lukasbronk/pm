import copy
import json
import sqlite3
from pathlib import Path
from typing import Any

from backend.app.settings import Settings

DEFAULT_VIEW_MODE = "classic"
DEFAULT_THEME_ID = "core"
DEFAULT_WORK_TYPE = "product"
DEFAULT_PRIORITY = "medium"
DEFAULT_REDRAWS_REMAINING = 1

DEFAULT_BOARD: dict[str, Any] = {
    "viewMode": DEFAULT_VIEW_MODE,
    "themeId": DEFAULT_THEME_ID,
    "playerProfile": {"primaryRole": DEFAULT_WORK_TYPE},
    "drawSettings": {
        "sourceColumnId": "col-backlog",
        "targetColumnId": "col-discovery",
    },
    "runState": {"redrawsRemaining": DEFAULT_REDRAWS_REMAINING},
    "columns": [
        {"id": "col-backlog", "title": "Backlog", "cardIds": ["card-1", "card-2"]},
        {"id": "col-discovery", "title": "Discovery", "cardIds": ["card-3"]},
        {
            "id": "col-progress",
            "title": "In Progress",
            "cardIds": ["card-4", "card-5"],
        },
        {"id": "col-review", "title": "Review", "cardIds": ["card-6"]},
        {"id": "col-done", "title": "Done", "cardIds": ["card-7", "card-8"]},
    ],
    "cards": {
        "card-1": {
            "id": "card-1",
            "title": "Align roadmap themes",
            "details": "Draft quarterly themes with impact statements and metrics.",
            "workType": "product",
            "effort": 3,
            "priority": "high",
            "assigneeRole": None,
            "blocked": False,
            "drawState": {"lastDrawnAt": None},
        },
        "card-2": {
            "id": "card-2",
            "title": "Gather customer signals",
            "details": "Review support tags, sales notes, and churn feedback.",
            "workType": "product",
            "effort": 2,
            "priority": "medium",
            "assigneeRole": None,
            "blocked": False,
            "drawState": {"lastDrawnAt": None},
        },
        "card-3": {
            "id": "card-3",
            "title": "Prototype analytics view",
            "details": "Sketch initial dashboard layout and key drill-downs.",
            "workType": "design",
            "effort": 3,
            "priority": "medium",
            "assigneeRole": None,
            "blocked": False,
            "drawState": {"lastDrawnAt": None},
        },
        "card-4": {
            "id": "card-4",
            "title": "Refine status language",
            "details": "Standardize column labels and tone across the board.",
            "workType": "product",
            "effort": 1,
            "priority": "medium",
            "assigneeRole": None,
            "blocked": False,
            "drawState": {"lastDrawnAt": None},
        },
        "card-5": {
            "id": "card-5",
            "title": "Design card layout",
            "details": "Add hierarchy and spacing for scanning dense lists.",
            "workType": "design",
            "effort": 2,
            "priority": "medium",
            "assigneeRole": None,
            "blocked": False,
            "drawState": {"lastDrawnAt": None},
        },
        "card-6": {
            "id": "card-6",
            "title": "QA micro-interactions",
            "details": "Verify hover, focus, and loading states.",
            "workType": "qa",
            "effort": 1,
            "priority": "low",
            "assigneeRole": None,
            "blocked": False,
            "drawState": {"lastDrawnAt": None},
        },
        "card-7": {
            "id": "card-7",
            "title": "Ship marketing page",
            "details": "Final copy approved and asset pack delivered.",
            "workType": "ops",
            "effort": 2,
            "priority": "medium",
            "assigneeRole": None,
            "blocked": False,
            "drawState": {"lastDrawnAt": None},
        },
        "card-8": {
            "id": "card-8",
            "title": "Close onboarding sprint",
            "details": "Document release notes and share internally.",
            "workType": "ops",
            "effort": 1,
            "priority": "low",
            "assigneeRole": None,
            "blocked": False,
            "drawState": {"lastDrawnAt": None},
        },
    },
}


def get_default_source_column_id(columns: list[dict[str, Any]]) -> str:
    if not columns:
        return "col-backlog"

    for column in columns:
        if column.get("id") == "col-backlog":
            return str(column["id"])

    for column in columns:
        if isinstance(column.get("title"), str) and column["title"].strip().lower() == "backlog":
            return str(column["id"])

    return str(columns[0]["id"])


def get_default_target_column_id(columns: list[dict[str, Any]], source_column_id: str) -> str:
    if not columns:
        return source_column_id

    source_index = next(
        (index for index, column in enumerate(columns) if column.get("id") == source_column_id),
        -1,
    )
    if source_index >= 0 and source_index + 1 < len(columns):
        return str(columns[source_index + 1]["id"])

    for column in columns:
        if column.get("id") != source_column_id:
            return str(column["id"])

    return source_column_id


def normalize_last_drawn_at(value: Any) -> str | None:
    return value if isinstance(value, str) and value else None


def normalize_card(card_id: str, card: dict[str, Any]) -> dict[str, Any]:
    effort = card.get("effort")
    work_type = card.get("workType")
    priority = card.get("priority")
    assignee_role = card.get("assigneeRole")
    draw_state = card.get("drawState")
    return {
        "id": card.get("id", card_id),
        "title": card.get("title", "Untitled card"),
        "details": card.get("details", ""),
        "workType": (
            work_type
            if work_type in {"product", "design", "code", "qa", "ops"}
            else DEFAULT_WORK_TYPE
        ),
        "effort": effort if isinstance(effort, int) and 1 <= effort <= 5 else None,
        "priority": (
            priority if priority in {"low", "medium", "high"} else DEFAULT_PRIORITY
        ),
        "assigneeRole": (
            assignee_role
            if assignee_role in {"product", "design", "code", "qa", "ops"}
            else None
        ),
        "blocked": card.get("blocked") is True,
        "drawState": {
            "lastDrawnAt": normalize_last_drawn_at(
                draw_state.get("lastDrawnAt") if isinstance(draw_state, dict) else None
            )
        },
    }


def normalize_board_payload(board: dict[str, Any]) -> dict[str, Any]:
    columns = board.get("columns")
    cards = board.get("cards")

    if not isinstance(columns, list):
        columns = []
    if not isinstance(cards, dict):
        cards = {}

    fallback_source_column_id = get_default_source_column_id(columns)
    player_profile = board.get("playerProfile")
    draw_settings = board.get("drawSettings")
    run_state = board.get("runState")
    source_column_id = (
        draw_settings.get("sourceColumnId")
        if isinstance(draw_settings, dict)
        and isinstance(draw_settings.get("sourceColumnId"), str)
        and any(column.get("id") == draw_settings.get("sourceColumnId") for column in columns)
        else fallback_source_column_id
    )
    normalized_target_column_id = (
        draw_settings.get("targetColumnId")
        if isinstance(draw_settings, dict)
        and isinstance(draw_settings.get("targetColumnId"), str)
        and draw_settings.get("targetColumnId") != source_column_id
        and any(column.get("id") == draw_settings.get("targetColumnId") for column in columns)
        else get_default_target_column_id(columns, source_column_id)
    )

    return {
        "viewMode": (
            board.get("viewMode")
            if board.get("viewMode") in {"classic", "arcade"}
            else DEFAULT_VIEW_MODE
        ),
        "themeId": (
            board.get("themeId")
            if isinstance(board.get("themeId"), str) and board.get("themeId")
            else DEFAULT_THEME_ID
        ),
        "playerProfile": {
            "primaryRole": (
                player_profile.get("primaryRole")
                if isinstance(player_profile, dict)
                and player_profile.get("primaryRole")
                in {"product", "design", "code", "qa", "ops"}
                else DEFAULT_WORK_TYPE
            )
        },
        "drawSettings": {
            "sourceColumnId": source_column_id,
            "targetColumnId": normalized_target_column_id,
        },
        "runState": {
            "redrawsRemaining": (
                run_state.get("redrawsRemaining")
                if isinstance(run_state, dict)
                and isinstance(run_state.get("redrawsRemaining"), int)
                and run_state.get("redrawsRemaining") >= 0
                else DEFAULT_REDRAWS_REMAINING
            )
        },
        "columns": columns,
        "cards": {
            str(card_id): normalize_card(str(card_id), card)
            for card_id, card in cards.items()
            if isinstance(card, dict)
        },
    }


def initialize_database(settings: Settings) -> None:
    db_path = Path(settings.db_path)
    db_path.parent.mkdir(parents=True, exist_ok=True)

    with sqlite3.connect(db_path) as connection:
        connection.execute("PRAGMA foreign_keys = ON")
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              username TEXT NOT NULL UNIQUE,
              created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS boards (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              user_id INTEGER NOT NULL UNIQUE,
              board_json TEXT NOT NULL,
              created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
              updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (user_id) REFERENCES users(id)
            )
            """
        )
        connection.commit()


def get_connection(settings: Settings) -> sqlite3.Connection:
    connection = sqlite3.connect(settings.db_path)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    return connection


def get_or_create_user_id(username: str, settings: Settings) -> int:
    with get_connection(settings) as connection:
        connection.execute(
            "INSERT INTO users (username) VALUES (?) ON CONFLICT(username) DO NOTHING",
            (username,),
        )
        connection.commit()
        row = connection.execute(
            "SELECT id FROM users WHERE username = ?",
            (username,),
        ).fetchone()
        return int(row["id"])


def get_or_create_board(username: str, settings: Settings) -> dict[str, Any]:
    user_id = get_or_create_user_id(username, settings)

    with get_connection(settings) as connection:
        row = connection.execute(
            "SELECT board_json FROM boards WHERE user_id = ?",
            (user_id,),
        ).fetchone()
        if row:
            return normalize_board_payload(json.loads(str(row["board_json"])))

        board_json = json.dumps(DEFAULT_BOARD)
        connection.execute(
            "INSERT INTO boards (user_id, board_json) VALUES (?, ?)",
            (user_id, board_json),
        )
        connection.commit()
        return json.loads(board_json)


def validate_board_payload(board: dict[str, Any]) -> None:
    if board.get("viewMode") not in {"classic", "arcade"}:
        raise ValueError("Board viewMode must be classic or arcade.")
    if not isinstance(board.get("themeId"), str):
        raise ValueError("Board themeId must be a string.")
    if (
        not isinstance(board.get("playerProfile"), dict)
        or board["playerProfile"].get("primaryRole")
        not in {"product", "design", "code", "qa", "ops"}
    ):
        raise ValueError("Board playerProfile.primaryRole must be product, design, code, qa, or ops.")
    if not isinstance(board.get("drawSettings"), dict):
        raise ValueError("Board drawSettings must be an object.")
    if (
        not isinstance(board.get("runState"), dict)
        or not isinstance(board["runState"].get("redrawsRemaining"), int)
        or board["runState"]["redrawsRemaining"] < 0
    ):
        raise ValueError("Board runState.redrawsRemaining must be a non-negative integer.")

    columns = board.get("columns")
    cards = board.get("cards")

    if not isinstance(columns, list) or len(columns) == 0:
        raise ValueError("Board must contain at least 1 column.")
    if not isinstance(cards, dict):
        raise ValueError("Board cards must be an object.")

    seen_column_ids: set[str] = set()
    seen_card_ids: set[str] = set()

    for column in columns:
        if not isinstance(column, dict):
            raise ValueError("Each column must be an object.")
        if not {"id", "title", "cardIds"} <= set(column):
            raise ValueError("Each column must include id, title, and cardIds.")
        if not isinstance(column["id"], str) or not isinstance(column["title"], str):
            raise ValueError("Column id and title must be strings.")
        if not isinstance(column["cardIds"], list):
            raise ValueError("Column cardIds must be an array.")
        if column["id"] in seen_column_ids:
            raise ValueError("Column ids must be unique.")
        seen_column_ids.add(column["id"])

        for card_id in column["cardIds"]:
            if not isinstance(card_id, str):
                raise ValueError("Card ids must be strings.")
            if card_id not in cards:
                raise ValueError("Every referenced card must exist in cards.")
            if card_id in seen_card_ids:
                raise ValueError("A card may only appear in one column.")
            seen_card_ids.add(card_id)

    source_column_id = board["drawSettings"].get("sourceColumnId")
    target_column_id = board["drawSettings"].get("targetColumnId")
    if source_column_id not in seen_column_ids:
        raise ValueError("Board drawSettings.sourceColumnId must reference a valid column.")
    if target_column_id not in seen_column_ids:
        raise ValueError("Board drawSettings.targetColumnId must reference a valid column.")
    if source_column_id == target_column_id and len(columns) > 1:
        raise ValueError("Board drawSettings target column must differ from the source column.")

    for card_id, card in cards.items():
        if not isinstance(card_id, str) or not isinstance(card, dict):
            raise ValueError("Cards must be keyed by string ids.")
        if not {
            "id",
            "title",
            "details",
            "workType",
            "effort",
            "priority",
            "assigneeRole",
            "blocked",
            "drawState",
        } <= set(card):
            raise ValueError(
                "Each card must include id, title, details, workType, effort, priority, assigneeRole, blocked, and drawState."
            )
        if card["id"] != card_id:
            raise ValueError("Card id must match the object key.")
        if not isinstance(card["title"], str) or not isinstance(card["details"], str):
            raise ValueError("Card title and details must be strings.")
        if card["workType"] not in {"product", "design", "code", "qa", "ops"}:
            raise ValueError("Card workType must be product, design, code, qa, or ops.")
        if card["priority"] not in {"low", "medium", "high"}:
            raise ValueError("Card priority must be low, medium, or high.")
        if card["assigneeRole"] is not None and card["assigneeRole"] not in {
            "product",
            "design",
            "code",
            "qa",
            "ops",
        }:
            raise ValueError("Card assigneeRole must be null or product, design, code, qa, or ops.")
        if not isinstance(card["blocked"], bool):
            raise ValueError("Card blocked must be a boolean.")
        if not isinstance(card["drawState"], dict):
            raise ValueError("Card drawState must be an object.")
        last_drawn_at = card["drawState"].get("lastDrawnAt")
        if last_drawn_at is not None and not isinstance(last_drawn_at, str):
            raise ValueError("Card drawState.lastDrawnAt must be null or a string.")
        if card["effort"] is not None and (
            not isinstance(card["effort"], int) or not 1 <= card["effort"] <= 5
        ):
            raise ValueError("Card effort must be null or an integer from 1 to 5.")


def save_board(username: str, board: dict[str, Any], settings: Settings) -> dict[str, Any]:
    normalized_board = normalize_board_payload(board)
    validate_board_payload(normalized_board)
    user_id = get_or_create_user_id(username, settings)

    with get_connection(settings) as connection:
        connection.execute(
            """
            INSERT INTO boards (user_id, board_json)
            VALUES (?, ?)
            ON CONFLICT(user_id) DO UPDATE SET
              board_json = excluded.board_json,
              updated_at = CURRENT_TIMESTAMP
            """,
            (user_id, json.dumps(normalized_board)),
        )
        connection.commit()
        return normalized_board


def get_column_by_id(board: dict[str, Any], column_id: str) -> dict[str, Any]:
    for column in board["columns"]:
        if column["id"] == column_id:
            return column
    raise ValueError(f"Column not found: {column_id}")


def find_card_column(board: dict[str, Any], card_id: str) -> dict[str, Any]:
    for column in board["columns"]:
        if card_id in column["cardIds"]:
            return column
    raise ValueError(f"Card not found in any column: {card_id}")


def apply_card_operations(board: dict[str, Any], operations: list[dict[str, Any]]) -> dict[str, Any]:
    next_board = copy.deepcopy(normalize_board_payload(board))

    for operation in operations:
        action = operation.get("action")

        if action == "create":
            card_id = operation["card"]["id"]
            if card_id in next_board["cards"]:
                raise ValueError(f"Card already exists: {card_id}")

            column = get_column_by_id(next_board, operation["column_id"])
            next_board["cards"][card_id] = operation["card"]
            column["cardIds"].append(card_id)
            continue

        if action == "edit":
            card_id = operation["card_id"]
            card = next_board["cards"].get(card_id)
            if not card:
                raise ValueError(f"Card not found: {card_id}")

            if isinstance(operation.get("title"), str):
                card["title"] = operation["title"]
            if isinstance(operation.get("details"), str):
                card["details"] = operation["details"]
            continue

        if action == "move":
            card_id = operation["card_id"]
            target_column = get_column_by_id(next_board, operation["to_column_id"])
            source_column = find_card_column(next_board, card_id)

            source_column["cardIds"] = [
                existing_card_id
                for existing_card_id in source_column["cardIds"]
                if existing_card_id != card_id
            ]

            insert_index = operation.get("position")
            if isinstance(insert_index, int) and 0 <= insert_index <= len(target_column["cardIds"]):
                target_column["cardIds"].insert(insert_index, card_id)
            else:
                target_column["cardIds"].append(card_id)
            continue

        if action == "delete":
            card_id = operation["card_id"]
            if card_id not in next_board["cards"]:
                raise ValueError(f"Card not found: {card_id}")

            column = find_card_column(next_board, card_id)
            column["cardIds"] = [
                existing_card_id
                for existing_card_id in column["cardIds"]
                if existing_card_id != card_id
            ]
            del next_board["cards"][card_id]
            continue

        raise ValueError(f"Unsupported card action: {action}")

    next_board = normalize_board_payload(next_board)
    validate_board_payload(next_board)
    return next_board
