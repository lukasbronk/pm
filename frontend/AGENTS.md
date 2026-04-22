# Frontend Agent Guide

This document describes the existing `frontend/` app so future work starts from the real baseline, not assumptions.

## Purpose

`frontend/` is a standalone Next.js Kanban demo. It currently runs without a backend and keeps all board state in client memory.

## Stack

- Next.js App Router
- React 19
- TypeScript
- Tailwind CSS v4
- `@dnd-kit` for drag and drop
- Vitest + Testing Library for unit/component tests
- Playwright for end-to-end tests

## Current Behavior

- The home page at `/` renders `KanbanBoard`.
- The board starts with five columns:
  - Backlog
  - Discovery
  - In Progress
  - Review
  - Done
- Columns can be renamed inline.
- Cards can be added to a column.
- Cards can be removed.
- Cards can be dragged within a column or between columns.
- All changes are local to the browser session. Refresh resets to seeded demo data.

## Key Files

- [src/app/page.tsx](/Users/lukasbronk/git/pm/frontend/src/app/page.tsx): renders the board.
- [src/app/layout.tsx](/Users/lukasbronk/git/pm/frontend/src/app/layout.tsx): global layout, metadata, and fonts.
- [src/app/globals.css](/Users/lukasbronk/git/pm/frontend/src/app/globals.css): color variables and base styling.
- [src/components/KanbanBoard.tsx](/Users/lukasbronk/git/pm/frontend/src/components/KanbanBoard.tsx): top-level client board state and drag handling.
- [src/components/KanbanColumn.tsx](/Users/lukasbronk/git/pm/frontend/src/components/KanbanColumn.tsx): column shell, rename input, droppable area, and add-card form.
- [src/components/KanbanCard.tsx](/Users/lukasbronk/git/pm/frontend/src/components/KanbanCard.tsx): sortable card UI and delete action.
- [src/components/NewCardForm.tsx](/Users/lukasbronk/git/pm/frontend/src/components/NewCardForm.tsx): inline add-card form state.
- [src/lib/kanban.ts](/Users/lukasbronk/git/pm/frontend/src/lib/kanban.ts): board types, seeded data, drag move logic, and ID creation.

## Tests

- [src/lib/kanban.test.ts](/Users/lukasbronk/git/pm/frontend/src/lib/kanban.test.ts): unit tests for board move logic.
- [src/components/KanbanBoard.test.tsx](/Users/lukasbronk/git/pm/frontend/src/components/KanbanBoard.test.tsx): component tests for render, rename, add, and delete flows.
- [tests/kanban.spec.ts](/Users/lukasbronk/git/pm/frontend/tests/kanban.spec.ts): Playwright coverage for page load, add card, and drag-and-drop.

## Conventions To Preserve

- Keep the five-column Kanban structure for the MVP.
- Preserve the current color palette defined in `globals.css`.
- Prefer simple client components and direct state transitions over extra abstraction.
- Keep interactions testable with stable labels and `data-testid` usage where already present.
- Do not add backend assumptions directly into low-level UI components. Introduce integration at the board/container level first.

## Known Gaps Relative To The Full Project

- No authentication
- No backend API integration
- No persistence
- No AI chat sidebar
- No Docker-aware build output yet

## Expected Next Frontend Changes

- Adapt the build so FastAPI can serve the compiled frontend assets.
- Introduce authenticated app flow without throwing away the current board UI.
- Replace in-memory board state with backend-backed loading and saving.
- Add AI chat in a sidebar after backend AI routes exist.
