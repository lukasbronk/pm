# Questboard Concept Vertical Slice Plan

This document is the immediate implementation checklist for the first `Questboard` build inside this repository.

It is scoped to the current stack:

- Next.js frontend
- FastAPI backend
- local SQLite persistence
- existing AI card-mutation flow

This is not the hosted product plan.

This is the first concrete build slice that should make the current app feel like `Questboard` instead of just the Kanban MVP.

Related docs:

- [docs/gaming/PRODUCT_PLAN.md](/Users/lukasbronk/git/pm/docs/gaming/PRODUCT_PLAN.md)
- [docs/gaming/MOCK_SCREEN_SPECS.md](/Users/lukasbronk/git/pm/docs/gaming/MOCK_SCREEN_SPECS.md)

## Goal

Ship a local vertical slice with:

- `Classic` mode
- `Arcade` mode
- one shared board model
- game-aware card metadata
- `Game Master` framing for AI in Arcade mode
- one run recap view

## Current Repo Reality

The current repo already has:

- a persisted board model with columns and cards
- authenticated local sessions
- board load/save APIs
- AI card operations
- a polished board shell
- horizontal board scrolling
- AI sidebar

The current repo does not yet have:

- mode state
- card metadata beyond title/details
- theme architecture
- board recap model
- `Game Master` structured planning UI
- player-role-aware draw logic

## Slice Boundaries

This slice should include:

- mode switching
- mode-aware rendering
- card metadata
- Arcade visual treatment
- Game Master naming and presentation
- one local `Draw` action in Arcade mode
- one recap screen

This slice should not include yet:

- hosted auth
- team workspaces
- billing
- premium cosmetics store
- public landing page
- deep collaboration
- fake deck-zone terminology with no real mechanic behind it

## Part 1: Lock The Vertical Slice Scope

- [ ] Keep the board model single-source for both Classic and Arcade.
- [ ] Keep Classic mode as the default mode for first launch of the slice.
- [ ] Make Arcade mode a board-level persisted preference.
- [ ] Keep AI mutations limited to card operations in this slice.
- [ ] Keep recap generation local to the current user and board.
- [ ] Keep all work within the existing frontend/backend app rather than adding separate demo routes.

Done when:

- The slice scope is constrained enough to implement without branching into hosted-product work.

## Part 2: Extend The Board Model

Files likely touched:

- [frontend/src/lib/kanban.ts](/Users/lukasbronk/git/pm/frontend/src/lib/kanban.ts)
- [backend/app/database.py](/Users/lukasbronk/git/pm/backend/app/database.py)
- [backend/app/main.py](/Users/lukasbronk/git/pm/backend/app/main.py)

- [ ] Add board-level fields for:
  - `viewMode`
  - `themeId`
  - `playerProfile`
  - `drawSettings`
- [ ] Add card-level fields for:
  - `workType`
  - `effort`
  - `priority`
  - `assigneeRole`
  - `drawState`
- [ ] Define defaults for old cards loaded from existing board JSON.
- [ ] Update board validation to accept the extended card shape.
- [ ] Keep old boards readable without migration scripts.
- [ ] Keep API payloads aligned with the frontend board model.

Done when:

- Existing saved boards still load.
- New boards can persist the new Questboard fields.

## Part 3: Add Mode State To The App Shell

Files likely touched:

- [frontend/src/components/AppShell.tsx](/Users/lukasbronk/git/pm/frontend/src/components/AppShell.tsx)
- [frontend/src/components/KanbanBoard.tsx](/Users/lukasbronk/git/pm/frontend/src/components/KanbanBoard.tsx)

- [ ] Read and write `viewMode` as part of board state.
- [ ] Add a `Classic / Arcade` mode switcher in the board header.
- [ ] Persist mode changes through the existing board save path.
- [ ] Keep mode changes optimistic and responsive.
- [ ] Ensure switching modes does not disturb open AI state or board data.

Done when:

- The user can switch between Classic and Arcade and see the board update instantly.

## Part 4: Build Theme Architecture

Files likely touched:

- [frontend/src/app/globals.css](/Users/lukasbronk/git/pm/frontend/src/app/globals.css)
- [frontend/src/components/KanbanBoard.tsx](/Users/lukasbronk/git/pm/frontend/src/components/KanbanBoard.tsx)
- [frontend/src/components/KanbanColumn.tsx](/Users/lukasbronk/git/pm/frontend/src/components/KanbanColumn.tsx)
- [frontend/src/components/KanbanCard.tsx](/Users/lukasbronk/git/pm/frontend/src/components/KanbanCard.tsx)

- [ ] Introduce shared semantic tokens for board surfaces, text, borders, and highlights.
- [ ] Add mode-specific token sets for Classic and Arcade.
- [ ] Keep Classic mode close to the current visual baseline.
- [ ] Add an Arcade atmosphere layer that feels richer without becoming noisy.
- [ ] Avoid hardcoding Arcade-only styles inline across many components.

Done when:

- Switching modes updates the visual language cleanly through reusable styling hooks.

## Part 5: Implement Classic Mode Baseline

Files likely touched:

- [frontend/src/components/KanbanBoard.tsx](/Users/lukasbronk/git/pm/frontend/src/components/KanbanBoard.tsx)
- [frontend/src/components/KanbanColumn.tsx](/Users/lukasbronk/git/pm/frontend/src/components/KanbanColumn.tsx)
- [frontend/src/components/KanbanCard.tsx](/Users/lukasbronk/git/pm/frontend/src/components/KanbanCard.tsx)

- [ ] Keep the current board shell as the basis for Classic mode.
- [ ] Add cleaner top-level board summary information:
  - board title area
  - current run/sprint label
  - mode switch
- [ ] Keep AI entry points understated in Classic mode.
- [ ] Ensure metadata does not visually overload Classic cards.
- [ ] Preserve five-column viewport behavior and horizontal overflow.

Done when:

- Classic mode still feels like a serious productivity app.

## Part 6: Implement Arcade Mode Shell

Files likely touched:

- [frontend/src/components/KanbanBoard.tsx](/Users/lukasbronk/git/pm/frontend/src/components/KanbanBoard.tsx)
- [frontend/src/components/KanbanColumn.tsx](/Users/lukasbronk/git/pm/frontend/src/components/KanbanColumn.tsx)
- [frontend/src/app/globals.css](/Users/lukasbronk/git/pm/frontend/src/app/globals.css)

- [ ] Add an `Arcade` board shell treatment.
- [ ] Keep the existing workflow titles as the primary column labels.
- [ ] If flavor subtitles are added, make them secondary and tactically honest.
- [ ] Add a real `Draw` button in Arcade mode only.
- [ ] Keep `Draw` attached to an actual backlog-pull action.
- [ ] Keep `Hand` and `Play` out of the slice unless those mechanics are explicitly built.
- [ ] Add a top strip that suggests an active run state.
- [ ] Keep the same drag-and-drop mechanics.
- [ ] Keep board scanability higher than visual spectacle.

Done when:

- Arcade mode feels like a real alternate presentation of the same board, not a disconnected mockup.
- The game flavor feels coherent to someone who actually plays deckbuilders.

## Part 6A: Add Local Draw Mechanic

Files likely touched:

- [frontend/src/components/KanbanBoard.tsx](/Users/lukasbronk/git/pm/frontend/src/components/KanbanBoard.tsx)
- [frontend/src/lib/kanban.ts](/Users/lukasbronk/git/pm/frontend/src/lib/kanban.ts)
- [backend/app/ai.py](/Users/lukasbronk/git/pm/backend/app/ai.py)
- [backend/app/main.py](/Users/lukasbronk/git/pm/backend/app/main.py)
- [backend/app/database.py](/Users/lukasbronk/git/pm/backend/app/database.py)

- [ ] Add a board-level `Draw` CTA in Arcade mode.
- [ ] Treat one backlog source as the draw pool.
- [ ] Define one destination lane for drawn work.
- [ ] Add a local `playerProfile.primaryRole` field.
- [ ] Add optional per-card `assigneeRole` override.
- [ ] Implement weighted candidate selection:
  - role fit first
  - unblocked first
  - reasonable effort first
  - some randomness
- [ ] Add a draw animation sequence:
  - press feedback
  - short anticipation cue
  - revealed card moment
  - animated travel into the destination lane
- [ ] Add reduced-motion fallback for the draw animation.
- [ ] Move the drawn card automatically into the destination lane.
- [ ] Show a short `why this card` message after draw.
- [ ] Add one `Redraw` or `Skip` path for bad fits.

Done when:

- `Draw` feels like a real mechanic rather than decorative text.
- The result is surprising but still sane for the current user.
- The animation adds delight without slowing down the workflow.

## Part 7: Add Card Metadata Editing

Files likely touched:

- [frontend/src/components/KanbanCard.tsx](/Users/lukasbronk/git/pm/frontend/src/components/KanbanCard.tsx)
- [frontend/src/components/NewCardForm.tsx](/Users/lukasbronk/git/pm/frontend/src/components/NewCardForm.tsx)
- [frontend/src/components/KanbanColumn.tsx](/Users/lukasbronk/git/pm/frontend/src/components/KanbanColumn.tsx)
- [frontend/src/lib/kanban.ts](/Users/lukasbronk/git/pm/frontend/src/lib/kanban.ts)

- [ ] Decide the simplest metadata editing UI for this slice.
- [ ] Add metadata capture for new cards:
  - work type
  - effort
  - priority
- [ ] Add metadata editing for existing cards.
- [ ] Keep metadata optional.
- [ ] Keep quick-add usable without filling every field.

Done when:

- Cards can carry enough structure for Arcade mode without making card creation annoying.

## Part 8: Redesign Arcade Cards

Files likely touched:

- [frontend/src/components/KanbanCard.tsx](/Users/lukasbronk/git/pm/frontend/src/components/KanbanCard.tsx)
- [frontend/src/components/KanbanCardPreview.tsx](/Users/lukasbronk/git/pm/frontend/src/components/KanbanCardPreview.tsx)
- [frontend/src/app/globals.css](/Users/lukasbronk/git/pm/frontend/src/app/globals.css)

- [ ] Add card anatomy for Arcade mode:
  - title as card name
  - details as flavor-text-like body
  - effort as `Cost`
  - work type as `Class`
  - priority as `Priority`
- [ ] Add compact visual markers for class and priority.
- [ ] Add premium hover/focus states.
- [ ] Keep text readable at board density.

Done when:

- Cards feel distinctly more collectible and game-like in Arcade mode while remaining readable.

## Part 9: Reframe The AI Sidebar

Files likely touched:

- [frontend/src/components/AiSidebar.tsx](/Users/lukasbronk/git/pm/frontend/src/components/AiSidebar.tsx)
- [frontend/src/components/AppShell.tsx](/Users/lukasbronk/git/pm/frontend/src/components/AppShell.tsx)
- [backend/app/ai.py](/Users/lukasbronk/git/pm/backend/app/ai.py)

- [ ] Keep `AI Helper` naming in Classic mode.
- [ ] Rename the assistant UI to `Game Master` in Arcade mode.
- [ ] Add mode-aware descriptive copy.
- [ ] Add one structured recommendation area in the panel:
  - `Best Play`
- [ ] Keep chat working alongside the structured block.
- [ ] Avoid making the AI response wall-of-text heavy.

Done when:

- The AI feels more specialized in Arcade mode even before deeper backend changes land.

## Part 10: Extend AI Response Shape For The Slice

Files likely touched:

- [backend/app/ai.py](/Users/lukasbronk/git/pm/backend/app/ai.py)
- [backend/app/main.py](/Users/lukasbronk/git/pm/backend/app/main.py)
- [backend/tests/test_ai.py](/Users/lukasbronk/git/pm/backend/tests/test_ai.py)
- [backend/tests/test_app.py](/Users/lukasbronk/git/pm/backend/tests/test_app.py)

- [ ] Extend the AI response schema to optionally return structured recommendation fields.
- [ ] Add at least one recommendation field:
  - `best_play`
- [ ] Allow the AI response to optionally return draw reasoning metadata.
- [ ] Pass card metadata and mode context into the AI prompt.
- [ ] Keep board mutation validation intact.
- [ ] Keep compatibility with responses that only return reply plus operations.

Done when:

- The backend can power a more productized Game Master panel without breaking current AI behavior.

## Part 11: Add Run State And Recap Data

Files likely touched:

- [frontend/src/lib/kanban.ts](/Users/lukasbronk/git/pm/frontend/src/lib/kanban.ts)
- [backend/app/database.py](/Users/lukasbronk/git/pm/backend/app/database.py)
- [backend/app/main.py](/Users/lukasbronk/git/pm/backend/app/main.py)

- [ ] Add a minimal `runState` object to the board model.
- [ ] Decide the minimal fields for this slice:
  - name
  - objective
  - startedAt
- [ ] Add save/load support for run state.
- [ ] Keep the model simple enough to evolve later.

Done when:

- The board can persist enough run context to support recap and Arcade framing.

## Part 12: Build A Run Recap View

Files likely touched:

- new frontend component likely under [frontend/src/components](/Users/lukasbronk/git/pm/frontend/src/components)
- [frontend/src/components/AppShell.tsx](/Users/lukasbronk/git/pm/frontend/src/components/AppShell.tsx)
- [frontend/src/app/globals.css](/Users/lukasbronk/git/pm/frontend/src/app/globals.css)

- [ ] Add a manual `View Run Recap` entry point.
- [ ] Build a recap screen or overlay that shows:
  - cards completed
  - current objective
  - highlighted achievement
  - remaining boss fight
- [ ] Generate recap content from current board state and minimal run metadata.
- [ ] Add a visually stronger Arcade recap treatment while keeping content clear.

Done when:

- The slice has one emotionally satisfying payoff screen, not just the board.

## Part 13: Copy And Terminology Pass

Files likely touched:

- [frontend/src/components/AppShell.tsx](/Users/lukasbronk/git/pm/frontend/src/components/AppShell.tsx)
- [frontend/src/components/KanbanBoard.tsx](/Users/lukasbronk/git/pm/frontend/src/components/KanbanBoard.tsx)
- [frontend/src/components/AiSidebar.tsx](/Users/lukasbronk/git/pm/frontend/src/components/AiSidebar.tsx)
- [backend/app/ai.py](/Users/lukasbronk/git/pm/backend/app/ai.py)

- [ ] Make all Classic copy plain and professional.
- [ ] Make all Arcade copy thematic but restrained.
- [ ] Keep terms like `Boss Fight` and `Best Play` limited to clear contexts.
- [ ] Remove anything that feels corny or fake-epic.

Done when:

- The product sounds intentional in both modes.

## Part 14: Accessibility And Performance Pass

Files likely touched:

- frontend components and styles across the slice

- [ ] Ensure mode switching does not break focus flow.
- [ ] Ensure Arcade mode colors still read clearly.
- [ ] Keep motion subtle and add reduced-motion handling if needed.
- [ ] Ensure horizontal board scrolling still behaves well after Arcade styling.
- [ ] Keep dense boards performant.

Done when:

- The richer presentation does not make the app harder to use.

## Part 15: Repo Cleanup For The Slice

- [ ] Update any affected docs after the slice lands.
- [ ] Keep tests aligned with the new board model and mode-aware UI.
- [ ] Remove dead copy and stale assumptions once Questboard naming enters the app.

Done when:

- The repo reflects the new direction coherently.

## Recommended Build Order

1. Extend board and card schema
2. Add mode state and switcher
3. Add theme architecture
4. Harden Classic mode
5. Build Arcade shell
6. Add metadata editing
7. Redesign Arcade cards
8. Reframe AI as Game Master
9. Extend AI response shape
10. Add run state
11. Build run recap
12. Copy pass
13. Accessibility/performance pass
14. Repo cleanup

## Definition Of Done For This Slice

- The app supports Classic and Arcade mode on the same board.
- Cards carry enough metadata to support the deckbuilder metaphor.
- Arcade mode looks and feels intentional.
- The AI feels more like a `Game Master` in Arcade mode.
- The app includes one run recap view.
- The existing app still works as a real board tool underneath the new layer.
