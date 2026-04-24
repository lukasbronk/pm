# Questboard Implementation Plan

This document is the implementation-first plan for turning the current Kanban MVP into `Questboard`: a project management app with a professional core and an optional retro deckbuilder presentation layer.

This plan is intentionally build-focused.

It does not include:

- user interviews
- concept testing rounds
- formal research programs
- alpha-program planning

The working approach is:

- make strong product decisions
- build the best version we can
- hand it to real users later
- learn from actual usage rather than pre-implementation ceremony

Related docs:

- [docs/gaming/PLAN.md](/Users/lukasbronk/git/pm/docs/gaming/PLAN.md)
- [docs/gaming/ONE_PAGER.md](/Users/lukasbronk/git/pm/docs/gaming/ONE_PAGER.md)
- [docs/gaming/MOCK_SCREEN_SPECS.md](/Users/lukasbronk/git/pm/docs/gaming/MOCK_SCREEN_SPECS.md)
- [docs/gaming/IMPLEMENTATION_BACKLOG.md](/Users/lukasbronk/git/pm/docs/gaming/IMPLEMENTATION_BACKLOG.md)

## Persona Council Summary

The persona workshop still drives the shape of the implementation.

- `Mara`: the product needs a real market wedge.
- `Leo`: the product needs style, energy, and shareability.
- `Iris`: preserve one board model and avoid architectural nonsense.
- `Noah`: build in believable phases, not fantasy roadmaps.
- `Sana`: the game layer must feel premium.
- `Vik`: core actions must stay obvious.
- `Grandpa Hex`: no gimmicks that make work harder.
- `Mina`: the app should feel exciting immediately.

## Product Principles

- The app must still work as a serious planning tool.
- Arcade mode is optional, not required.
- Classic and Arcade must operate on the same underlying board.
- Game language must map to real user logic, not decorative jargon.
- AI should help with planning quality, not just roleplay.
- The reward layer should feel satisfying, not manipulative.
- Collaboration and hosted persistence matter more than cosmetics.
- If `Draw` exists, it must be a real role-aware backlog action, not just a renamed label.

## Current Decisions

- `Questboard` builds on the current app, not a rewrite.
- The product has two board modes:
  - `Classic`
  - `Arcade`
- The AI assistant is:
  - `AI Helper` in Classic mode
  - `Game Master` in Arcade mode
- The first goal is a cohesive `Concept Vertical Slice`.
- The second goal is a hosted `Marketable Alpha`.
- The current Next.js + FastAPI architecture remains the starting point.
- Near-term AI remains server-side with OpenAI and the current backend integration pattern.
- Long-term hosted persistence should move from local SQLite JSON to Postgres JSONB plus event history.

## Out Of Scope For Early Versions

- PvP features
- public rankings
- seasonal competitions
- plugin marketplace
- fake currencies
- deep enterprise workflow engines
- sound-heavy or overstimulating UX

## Part 1: Product Guardrails And Naming

- [ ] Lock the product name used in code and docs:
  - `Questboard` unless changed explicitly
- [ ] Lock the two-mode product model:
  - `Classic`
  - `Arcade`
- [ ] Lock the tone rules:
  - professional first
  - game-flavored second
- [ ] Lock the AI naming rules:
  - neutral in Classic
  - thematic in Arcade
- [ ] Lock the reward rules:
  - recaps and polish allowed
  - manipulative points/streak systems not allowed
- [ ] Add these rules to the relevant docs so later work does not drift

Completion criteria

- The product direction is explicit enough that implementation does not drift into gimmicks.
- Naming and tone decisions are stable enough to build UI copy against.

## Part 2: Technical Scaffolding

- [ ] Add feature flags for:
  - Arcade mode
  - Game Master language
  - Run recap
  - Premium themes
- [ ] Add app configuration for:
  - default mode
  - theme availability
  - future plan gating
- [ ] Add environment separation support for:
  - local
  - staging
  - production
- [ ] Add a clean app-level way to branch behavior by mode without copy-pasting components
- [ ] Add placeholders for future hosted services:
  - auth provider
  - hosted database
  - billing

Completion criteria

- The current app can evolve incrementally without branching into multiple apps.
- New product layers can be turned on gradually.

## Part 3: Schema And Data Model

- [ ] Extend the board model to support:
  - `view_mode`
  - `theme_id`
  - `run_state`
  - `player_profile`
  - `draw_settings`
- [ ] Extend card data to support:
  - `work_type`
  - `effort`
  - `priority`
  - `assignee_role`
  - `draw_state`
- [ ] Keep these additions compatible with existing boards.
- [ ] Keep draw metadata optional so older boards still load cleanly.
- [ ] Decide what remains inside board JSON vs what becomes first-class records later.
- [ ] Define the future hosted schema with these entities:
  - `users`
  - `workspaces`
  - `workspace_memberships`
  - `boards`
  - `board_snapshots`
  - `board_events`
  - `runs`
  - `ai_sessions`
  - `themes`
  - `subscriptions`
- [ ] Decide that current board state stays document-shaped for simplicity.
- [ ] Decide that event history is append-only for recap and future collaboration.
- [ ] Document migration from local SQLite JSON to hosted Postgres JSONB.

Completion criteria

- The data model supports both the concept slice and the hosted roadmap.
- Old boards can still load without manual cleanup.

## Part 4: Mode Infrastructure

- [ ] Add persistent board-level mode state.
- [ ] Add a visible mode switcher in the app shell.
- [ ] Ensure mode switching does not alter board data.
- [ ] Add semantic design tokens shared by both modes.
- [ ] Add mode-specific tokens for surfaces, cards, AI panel styling, and motion.
- [ ] Audit which components are:
  - shared
  - mode-aware
  - mode-specific

Completion criteria

- The app feels like one product with two expressions.
- Switching modes is fast and clean.

## Part 5: Classic Mode Hardening

- [ ] Polish Classic mode into the professional baseline.
- [ ] Tighten plain-language terminology throughout the board.
- [ ] Improve board header structure:
  - project/board title
  - current sprint or run label
  - summary chips
  - mode switcher
- [ ] Keep five columns visible on standard desktop widths.
- [ ] Preserve horizontal scrolling for larger boards.
- [ ] Improve loading, empty, and error states.
- [ ] Keep AI entry points visible but restrained.

Completion criteria

- Classic mode stands on its own as a credible planning product.
- Nothing in Classic mode feels dependent on the arcade fantasy.

## Part 6: Arcade Mode Visual System

- [ ] Add the Arcade board shell.
- [ ] Keep canonical workflow titles as the primary labels in Arcade mode.
- [ ] Only add flavor subtitles where they honestly map to the planning flow.
- [ ] Only use `Draw` in the UI where the actual draw mechanic exists.
- [ ] Keep `Hand` and `Play` out of the UI unless those mechanics are explicitly implemented.
- [ ] Redesign cards in Arcade mode to feel like premium deckbuilder cards.
- [ ] Add visual metadata presentation:
  - `Cost`
  - `Class`
  - `Priority`
- [ ] Add icons or badges for work type.
- [ ] Keep `Priority` named as priority even in Arcade mode; only the visual treatment should feel game-like.
- [ ] Add subtle premium motion for:
  - focus
  - hover
  - AI suggestions
  - major completion moments
- [ ] Keep the board readable and scannable.
- [ ] Build the theme architecture so future skins are additive, not hacks.

Completion criteria

- Arcade mode feels meaningfully different and more exciting.
- The mode remains usable for real work.
- A gamer would not read the interface and think the terminology is fake.

## Part 7: Card Metadata And Editing

- [ ] Add card metadata fields to the editor and storage layer:
  - work type
  - effort
  - priority
- [ ] Define defaults for cards without metadata.
- [ ] Keep metadata entry lightweight.
- [ ] Ensure metadata is optional in quick-add flows.
- [ ] Surface metadata strongly in Arcade mode and lightly in Classic mode.
- [ ] Add starter defaults for likely team types:
  - indie game studio
  - product team
  - solo builder

Completion criteria

- Cards have enough structure to support the arcade metaphor.
- Creating and editing tasks is still quick.

## Part 8: AI Helper / Game Master

- [ ] Keep the current backend AI mutation flow as the base.
- [ ] Extend AI structured output to include recommendation sections.
- [ ] Define gamer-safe meaning for each Arcade AI term:
  - `Best Play` = highest-leverage next move
  - `Combo` = tasks that unlock value together
  - `Boss Fight` = biggest blocker or riskiest hard task
  - `Heavy Card` = oversized task
- [ ] Add UI sections for:
  - Best Play
  - Combo
  - Boss Fight
  - Heavy Card
  - Suggested Moves
- [ ] Keep neutral wording in Classic mode.
- [ ] Add Game Master wording in Arcade mode.
- [ ] Add one-click AI prompt shortcuts:
  - Build my next sprint
  - Split oversized tasks
  - Find blockers
  - Suggest the best next play
- [ ] Add AI support for role-aware draw:
  - rank backlog candidates for the current player profile
  - explain why a card was drawn
  - avoid blocked or role-mismatched cards unless explicitly requested
- [ ] Add preview-before-apply for larger AI changes.
- [ ] Keep AI responses concise and operational.

Completion criteria

- AI feels like a specialized planning assistant.
- Arcade mode makes the AI more memorable without making it less useful.
- The AI terminology feels tactical rather than cosplay-heavy.

## Part 8A: Role-Aware Draw Mechanic

- [ ] Define one real `Draw` action for Arcade mode.
- [ ] Decide the draw source:
  - cards in the backlog column
  - or cards in draw-eligible columns
- [ ] Decide the draw destination:
  - the user's next-work lane
  - or a dedicated ready lane later
- [ ] Add a simple local `player_profile` model:
  - primary role
  - optional secondary role later
- [ ] Add optional per-card targeting metadata:
  - intended role
  - blocked/unblocked
  - recently drawn marker
- [ ] Define weighted draw rules:
  - strong preference for role fit
  - preference for unblocked cards
  - preference for cards that fit the run effort budget
  - lighter randomness for surprise
- [ ] Design a full draw motion sequence:
  - button press state
  - brief shuffle or charge-up cue
  - card reveal
  - animated move into the destination lane
  - short `why this draw` reveal
- [ ] Add reduced-motion fallback for the draw sequence.
- [ ] Show a short post-draw explanation in the UI.
- [ ] Add a skip or redraw rule so one bad pull does not feel punishing.
- [ ] Keep draw optional and Arcade-only in the first version.

Completion criteria

- `Draw` feels smart enough that users trust it.
- The mechanic adds energy without hurting planning quality.
- A designer is very unlikely to draw an engineering-heavy card by accident.
- The animation makes draw feel satisfying instead of abrupt.

## Part 9: Run Model And Recap

- [ ] Define the `run` concept in the data model.
- [ ] Decide whether v1 runs are:
  - explicit user-created runs
  - or inferred from board state and time range
- [ ] Add a `Run Recap` screen.
- [ ] Include recap sections such as:
  - cards completed
  - blockers cleared
  - best combo
  - remaining boss fight
- [ ] Add local export for recap sharing.
- [ ] Keep recap visually satisfying but restrained.

Completion criteria

- The app gives users a sense of progress and closure.
- Recaps feel rewarding without fake-gamification baggage.

## Part 10: Templates And Onboarding

- [ ] Add first-run template choices.
- [ ] Add seeded boards for the main target user types.
- [ ] Add lightweight onboarding hints for:
  - Classic vs Arcade
  - Game Master
  - metadata
  - recap
- [ ] Add a clean first-run empty state if no template is used.
- [ ] Ensure first-time use is understandable without external explanation.

Completion criteria

- A new user can reach a usable board quickly.
- The app teaches itself well enough for direct handoff.

## Part 11: Accessibility And Performance

- [ ] Audit keyboard navigation across board interactions.
- [ ] Ensure contrast is acceptable across both modes.
- [ ] Add reduced-motion handling.
- [ ] Keep sound disabled or nonexistent in early versions.
- [ ] Check wide-board rendering performance.
- [ ] Check mode-switch performance.
- [ ] Check dense card readability.

Completion criteria

- The product remains usable and performant despite richer visuals.
- Arcade mode does not become exhausting.

## Part 12: Hosted Foundations

- [ ] Replace hardcoded auth with hosted authentication.
- [ ] Add durable hosted persistence.
- [ ] Add secure environment secret handling.
- [ ] Add background jobs for heavier recap or AI work if needed.
- [ ] Add a staging deployment path.

Completion criteria

- The app is no longer local-only.
- The product can support real user accounts and real persistence.

## Part 13: Workspaces And Collaboration

- [ ] Add workspaces.
- [ ] Add board sharing.
- [ ] Add workspace roles:
  - owner
  - editor
  - viewer
- [ ] Add collaboration-safe board saves.
- [ ] Add permissions around AI changes.
- [ ] Add team-visible run summaries.

Completion criteria

- Teams can use the product together reliably.
- The product now has real B2B SaaS value.

## Part 14: Billing And Plans

- [ ] Add plan concepts:
  - Free
  - Pro
  - Studio
- [ ] Gate value primarily through:
  - hosted sync
  - collaboration
  - AI planning depth
  - recap history
- [ ] Add billing integration.
- [ ] Add entitlement handling in backend and frontend.
- [ ] Keep premium cosmetics as later optional add-ons, not launch-critical revenue.

Completion criteria

- The product can monetize through real utility rather than gimmicks.

## Part 15: Launch-Ready Product Polish

- [ ] Add product screenshots and seeded demo states inside the app.
- [ ] Add a polished landing experience or product reveal surface.
- [ ] Add a stable demo board for showcasing the product.
- [ ] Add durable recap export presentation.
- [ ] Add final copy pass for:
  - Classic mode
  - Arcade mode
  - Game Master
  - billing surfaces

Completion criteria

- The app is presentable enough to hand to real users directly.
- The product looks intentional, coherent, and marketable.

## Recommended Build Sequence

1. Technical scaffolding
2. Schema and data model updates
3. Mode infrastructure
4. Classic mode hardening
5. Arcade mode visual system
6. Card metadata and editing
7. AI Helper / Game Master
8. Run recap
9. Templates and onboarding
10. Accessibility and performance
11. Hosted foundations
12. Collaboration
13. Billing
14. Launch polish

## Recommended Immediate Milestone

Build the `Concept Vertical Slice` first.

That slice should include:

- Classic mode
- Arcade mode
- mode switcher
- card metadata
- Game Master framing
- one structured AI recommendation view
- one run recap view

## Definition Of Done For The First Marketable Version

- A new user can sign up and create a board.
- A serious user can stay in Classic mode and still get value.
- A curious user can switch to Arcade mode and immediately understand the appeal.
- AI can help plan and restructure work meaningfully.
- Recaps make progress feel satisfying.
- The product can be hosted, shared, and billed.

## Recommendation

Treat this document as the main execution checklist.

Build straight through the `Concept Vertical Slice` first, then continue toward the hosted `Marketable Alpha` without reopening the product thesis every few days.
