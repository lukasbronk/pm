import json
import sqlite3
from pathlib import Path
from typing import Any

from backend.app.settings import Settings

DEFAULT_BOARD: dict[str, Any] = {
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
        },
        "card-2": {
            "id": "card-2",
            "title": "Gather customer signals",
            "details": "Review support tags, sales notes, and churn feedback.",
        },
        "card-3": {
            "id": "card-3",
            "title": "Prototype analytics view",
            "details": "Sketch initial dashboard layout and key drill-downs.",
        },
        "card-4": {
            "id": "card-4",
            "title": "Refine status language",
            "details": "Standardize column labels and tone across the board.",
        },
        "card-5": {
            "id": "card-5",
            "title": "Design card layout",
            "details": "Add hierarchy and spacing for scanning dense lists.",
        },
        "card-6": {
            "id": "card-6",
            "title": "QA micro-interactions",
            "details": "Verify hover, focus, and loading states.",
        },
        "card-7": {
            "id": "card-7",
            "title": "Ship marketing page",
            "details": "Final copy approved and asset pack delivered.",
        },
        "card-8": {
            "id": "card-8",
            "title": "Close onboarding sprint",
            "details": "Document release notes and share internally.",
        },
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
    initialize_database(settings)
    connection = sqlite3.connect(settings.db_path)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    return connection


def get_or_create_user_id(username: str, settings: Settings) -> int:
    with get_connection(settings) as connection:
        existing = connection.execute(
            "SELECT id FROM users WHERE username = ?",
            (username,),
        ).fetchone()
        if existing:
            return int(existing["id"])

        cursor = connection.execute(
            "INSERT INTO users (username) VALUES (?)",
            (username,),
        )
        connection.commit()
        return int(cursor.lastrowid)


def get_or_create_board(username: str, settings: Settings) -> dict[str, Any]:
    user_id = get_or_create_user_id(username, settings)

    with get_connection(settings) as connection:
        row = connection.execute(
            "SELECT board_json FROM boards WHERE user_id = ?",
            (user_id,),
        ).fetchone()
        if row:
            return json.loads(str(row["board_json"]))

        board_json = json.dumps(DEFAULT_BOARD)
        connection.execute(
            "INSERT INTO boards (user_id, board_json) VALUES (?, ?)",
            (user_id, board_json),
        )
        connection.commit()
        return json.loads(board_json)


def validate_board_payload(board: dict[str, Any]) -> None:
    columns = board.get("columns")
    cards = board.get("cards")

    if not isinstance(columns, list) or len(columns) != 5:
        raise ValueError("Board must contain exactly 5 columns.")
    if not isinstance(cards, dict):
        raise ValueError("Board cards must be an object.")

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

        for card_id in column["cardIds"]:
            if not isinstance(card_id, str):
                raise ValueError("Card ids must be strings.")
            if card_id not in cards:
                raise ValueError("Every referenced card must exist in cards.")
            if card_id in seen_card_ids:
                raise ValueError("A card may only appear in one column.")
            seen_card_ids.add(card_id)

    for card_id, card in cards.items():
        if not isinstance(card_id, str) or not isinstance(card, dict):
            raise ValueError("Cards must be keyed by string ids.")
        if not {"id", "title", "details"} <= set(card):
            raise ValueError("Each card must include id, title, and details.")
        if card["id"] != card_id:
            raise ValueError("Card id must match the object key.")
        if not isinstance(card["title"], str) or not isinstance(card["details"], str):
            raise ValueError("Card title and details must be strings.")


def save_board(username: str, board: dict[str, Any], settings: Settings) -> dict[str, Any]:
    validate_board_payload(board)
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
            (user_id, json.dumps(board)),
        )
        connection.commit()
        return board


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
    next_board = json.loads(json.dumps(board))

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

            if "title" in operation:
                card["title"] = operation["title"]
            if "details" in operation:
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

    validate_board_payload(next_board)
    return next_board
