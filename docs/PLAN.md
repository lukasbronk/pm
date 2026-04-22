# Project Plan

This document breaks the work into implementation parts with explicit substeps, tests, and success criteria. The project is explicitly local-only for an experimental internal MVP and is not being prepared for public deployment. Part 1 is complete when this plan and `frontend/AGENTS.md` are reviewed and approved by the user.

## Part 1: Plan

- [x] Review root [AGENTS.md](/Users/lukasbronk/git/pm/AGENTS.md) and capture implementation constraints.
- [x] Resolve open architecture decisions needed before scaffolding.
- [x] Expand this document into detailed checklists with tests and success criteria.
- [x] Create [frontend/AGENTS.md](/Users/lukasbronk/git/pm/frontend/AGENTS.md) describing the existing frontend app.
- [ ] Get explicit user approval before starting Part 2.

Tests
- Review plan for consistency with the business requirements and technical decisions.
- Review `frontend/AGENTS.md` against the current `frontend/` code structure.

Success criteria
- Each project part has a concrete checklist, test plan, and completion bar.
- Architecture defaults are documented:
  - Signed cookie auth for the MVP
  - Static client assets built from Next.js and served by FastAPI locally
  - Five initial fixed but renamable columns
  - AI can create, edit, and move cards only
  - AI chat history is session-only
  - The app runs directly on the local machine, not in Docker
- User approves the plan before implementation begins.

## Part 2: Local Scaffolding

- [x] Create `backend/` FastAPI app scaffold with dependency management via `uv`.
- [x] Add local run configuration to build the frontend, install backend dependencies, and run the combined app directly on the machine.
- [x] Add a minimal FastAPI route for `/api/health`.
- [x] Serve example static HTML from `/` first to prove the backend/local runtime path before wiring in Next.js output.
- [x] Add startup configuration for local `.env` loading.
- [x] Add cross-platform start/stop scripts in `scripts/` for macOS, Linux, and Windows.
- [x] Document the scaffold commands briefly in `README.md`.
- [x] Ensure the app binds to `127.0.0.1` by default for local-only use.

Tests
- Install dependencies and start the app locally via the provided scripts.
- Verify `/` returns the example HTML.
- Verify `/api/health` returns a successful JSON response.
- Add backend tests for the health route.

Success criteria
- The project runs locally without Docker with one documented start path.
- FastAPI serves both a page and an API route.
- Scripts exist for macOS, Linux, and Windows and are usable.
- The app is only exposed on localhost by default.

## Part 3: Add In Frontend

- [x] Configure the frontend build output so FastAPI can serve the compiled client assets.
- [x] Replace the example HTML at `/` with the current Kanban demo UI.
- [x] Ensure asset paths work correctly when served by FastAPI.
- [x] Keep the current five-column demo behavior intact after packaging.
- [x] Update test setup for the integrated app path as needed.

Tests
- Run frontend unit tests.
- Run frontend Playwright tests against the integrated app.
- Verify the built frontend loads correctly through FastAPI in the local runtime.

Success criteria
- Visiting `/` shows the existing Kanban demo, not placeholder HTML.
- The board still supports rename, add, remove, and drag-and-drop interactions.
- Frontend assets load correctly through the backend server.

## Part 4: Add A Fake User Sign In Experience

- [x] Add backend login and logout routes for the fixed credentials `user` / `password`.
- [x] Implement signed cookie session handling in FastAPI.
- [x] Add a frontend login screen shown when the session is absent.
- [x] Gate the board UI behind a valid authenticated session.
- [x] Add logout support that clears the session and returns the user to login.
- [x] Keep the UX minimal and local-only.
- [x] Keep authentication scope limited to local experimental use and avoid adding production auth complexity.

Tests
- Backend tests for successful login, failed login, authenticated access, and logout.
- Frontend unit/integration tests for login form behavior and logout behavior.
- End-to-end test covering login, page refresh with preserved session, and logout.

Success criteria
- Unauthenticated users cannot access board API routes.
- Logging in with `user` / `password` shows the board.
- Refresh preserves login via signed cookie.
- Logout reliably returns the app to the login screen.
- The auth flow remains clearly scoped to localhost-only experimental use.

## Part 5: Database Modeling

- [x] Propose a SQLite schema supporting multiple users and one board per user for the MVP.
- [x] Define how board state is stored as JSON.
- [x] Decide how seed data is created for a new user board.
- [x] Document schema, constraints, and rationale in `docs/`.
- [ ] Get explicit user sign-off on the database approach before implementation.

Tests
- Schema review for support of current MVP and future multi-user expansion.
- Validate that the schema can represent five columns and arbitrary cards without extra relational complexity.

Success criteria
- The documented schema is simple, SQLite-friendly, and supports future multi-user growth.
- The board JSON model is clearly defined and approved before backend persistence work starts.

## Part 6: Backend

- [x] Implement database initialization on startup if the SQLite file does not exist.
- [x] Add backend storage helpers for reading and updating a user’s board JSON.
- [x] Add authenticated API routes for fetching the current board.
- [x] Add authenticated API routes for saving board updates.
- [x] Ensure the first login for a user can create a default board when missing.
- [x] Keep API shapes minimal and aligned with the frontend board model.

Tests
- Backend unit tests for database initialization and board CRUD behavior.
- API tests for unauthorized access, default board creation, read, and update.
- Test that updates persist across app restarts.

Success criteria
- SQLite database file is created automatically when needed.
- Authenticated users can read and update their own board.
- Board data persists correctly between sessions and restarts.
- Board storage remains local to the machine.

## Part 7: Frontend + Backend

- [x] Replace frontend in-memory initialization with API-backed board loading.
- [x] Persist column renames, card creation, card deletion, and drag-and-drop moves through the backend.
- [x] Add loading, saving, and error states that are minimal but clear.
- [x] Keep the UI responsive while writes occur.
- [x] Ensure refresh loads the persisted board state.

Tests
- Frontend integration tests with mocked API responses.
- End-to-end tests covering load, rename, add, delete, move, refresh, and persistence.
- Regression tests for failure states such as failed save or expired session.

Success criteria
- The board state is no longer demo-only local state.
- User edits persist through the backend and survive refresh.
- Authentication and persistence work together cleanly.

## Part 8: AI Connectivity

- [ ] Add backend configuration for OpenRouter using `OPENROUTER_API_KEY` from the root `.env`.
- [ ] Implement a small backend client for OpenRouter requests.
- [ ] Use `openai/gpt-oss-120b` as the configured model.
- [ ] Add a simple backend test path or test helper that sends a `2+2` prompt.
- [ ] Handle missing API key and upstream failure with clear errors.
- [ ] Keep the OpenRouter key server-side only and never expose it to the browser bundle.

Tests
- Unit tests for request construction and error handling.
- Manual or integration connectivity check proving the `2+2` response succeeds with a real key.

Success criteria
- The backend can make a successful OpenRouter request with the configured model.
- Failures are surfaced clearly without crashing the app.
- The API key is loaded from local environment configuration and stays out of committed files.

## Part 9: AI Board-Aware Structured Output

- [ ] Define the structured output schema for AI chat responses.
- [ ] Include the current board JSON, the user message, and session chat history in each AI request.
- [ ] Restrict AI-generated board changes to card create, edit, move, and delete operations only.
- [ ] Validate and normalize AI responses before applying them.
- [ ] Apply valid board mutations through the same persistence path as manual frontend edits.
- [ ] Return both assistant text and optional board updates to the frontend.

Tests
- Unit tests for schema validation and malformed AI responses.
- Unit tests for applying AI-generated card operations to board JSON.
- Integration tests with mocked OpenRouter responses covering:
  - Reply only
  - Create card
  - Edit card
  - Move card
  - Delete card
  - Invalid operation rejected

Success criteria
- Every AI response is schema-validated before use.
- AI can respond conversationally and optionally update cards.
- Invalid or out-of-scope AI output does not corrupt the board.

## Part 10: AI Sidebar UI

- [ ] Design and add a sidebar chat interface that fits the existing visual system.
- [ ] Support session-only conversation history in the frontend and backend request flow.
- [ ] Send user messages to the backend AI route and render assistant replies.
- [ ] Refresh or update the board automatically when AI changes are returned.
- [ ] Surface loading and error states for AI requests.
- [ ] Keep the sidebar usable on desktop and mobile layouts.

Tests
- Frontend unit tests for chat rendering and message submission.
- Integration tests for applying backend-returned board updates to the UI.
- End-to-end tests covering chat, AI-generated board changes, and automatic board refresh behavior.

Success criteria
- Users can chat with the AI from the sidebar without leaving the board.
- AI card updates appear in the Kanban UI automatically.
- The final UI remains coherent, responsive, and consistent with the project color scheme.
- The final app remains intentionally local-only and not hardened as a public deployment target.
