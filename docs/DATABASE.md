# Database Approach

This document proposes the SQLite schema and persistence approach for the MVP.

## Recommendation

Use SQLite with two tables:

- `users`
- `boards`

Store the entire Kanban board as JSON in `boards.board_json`.

This is the right tradeoff for the current MVP because:

- the frontend already uses one board-shaped JSON object
- there is only one board per user
- the app is local-only
- column/card querying is not yet a backend requirement
- it avoids unnecessary relational modeling before it is needed

## Proposed Schema

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE boards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE,
  board_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## Why This Schema

### `users`

The MVP login is hardcoded, but the database should still support multiple users later. A `users` table gives us:

- a stable user identifier
- a clean future path to real authentication
- simple ownership for the board row

For the MVP we can seed or create the `user` record automatically when needed.

### `boards`

There is exactly one board per user in the MVP, so `boards.user_id` should be `UNIQUE`.

That gives us:

- one-to-one user-to-board mapping
- simple reads and writes
- a future path to multiple boards later by removing the unique constraint and adding a board name or slug

## Board JSON Shape

The JSON stored in `boards.board_json` should match the frontend board model directly.

```json
{
  "columns": [
    {
      "id": "col-backlog",
      "title": "Backlog",
      "cardIds": ["card-1", "card-2"]
    }
  ],
  "cards": {
    "card-1": {
      "id": "card-1",
      "title": "Align roadmap themes",
      "details": "Draft quarterly themes with impact statements and metrics."
    }
  }
}
```

This mirrors the current TypeScript shape in the frontend:

- `columns` is an ordered array
- each column contains ordered `cardIds`
- `cards` is a map keyed by card ID

That means the backend can persist and return the same structure without translation logic.

## Seed Data Strategy

When a user logs in and no board exists yet:

1. look up or create the user row
2. look up that user’s board
3. if none exists, insert a default board using the seeded five-column board structure

The initial board should use the same data shape and starting content as the current frontend demo:

- Backlog
- Discovery
- In Progress
- Review
- Done

This keeps the transition from demo-only frontend state to persisted backend state straightforward.

## Read/Write Model

For the MVP, treat the board as one document:

- read: fetch the full `board_json` for the logged-in user
- write: replace the full `board_json` for the logged-in user

This is intentionally simple.

It avoids:

- partial patch logic
- card-level relational joins
- synchronization complexity between ordered columns and card rows

## Validation Rules

Before saving `board_json`, the backend should validate:

- at least 1 column
- column ids are unique
- each column has `id`, `title`, and `cardIds`
- each card has `id`, `title`, and `details`
- every `cardId` referenced by a column exists in `cards`
- every card appears in at most one column

These rules are enough to prevent corrupted board state without overbuilding the model.

## Tradeoffs

### Pros

- simplest implementation for the current product shape
- aligns with the existing frontend state exactly
- easy to seed, read, overwrite, and return
- supports future multi-user use without changing the core approach

### Cons

- not ideal for querying cards independently
- not ideal for analytics or reporting at SQL level
- full-board writes are less granular than relational updates

Those tradeoffs are acceptable for the MVP because none of those missing capabilities are required yet.

## Deferred Complexity

Do not add these yet:

- separate `cards` and `columns` tables
- per-card SQL updates
- board version history
- audit logs
- migrations for multiple boards per user

If the product later needs search, analytics, or concurrent editing, we can revisit the schema then.

## Implementation Plan For Part 6

Part 6 should implement:

- SQLite database creation if the file is missing
- helper to get or create the `user` row
- helper to get or create the board row
- helper to load and save full board JSON
- validation before save

## Approval Decision

Recommended decision:

- approve the two-table SQLite schema
- approve storing the board as a single JSON document
- approve default board creation on first authenticated access
