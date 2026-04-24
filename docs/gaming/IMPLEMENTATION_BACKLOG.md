# Questboard Implementation Backlog

This document converts the `Questboard` concept into a concrete implementation backlog.

Related docs:

- [docs/gaming/PLAN.md](/Users/lukasbronk/git/pm/docs/gaming/PLAN.md)
- [docs/gaming/ONE_PAGER.md](/Users/lukasbronk/git/pm/docs/gaming/ONE_PAGER.md)
- [docs/gaming/MOCK_SCREEN_SPECS.md](/Users/lukasbronk/git/pm/docs/gaming/MOCK_SCREEN_SPECS.md)

## Goal

Add a marketable retro deckbuilder layer to the existing Kanban app without breaking the core board workflow.

The implementation strategy is:

- keep the current board model
- add an optional `Arcade Mode`
- evolve the AI into a `Game Master` experience
- build toward a future hosted SaaS version in phases

This backlog is implementation-only.

It does not assume:

- interview rounds
- formal validation studies
- staged research programs

The expectation is to build, ship, and learn from real users later.

## Delivery Strategy

Build in three layers:

1. `Concept Layer`
   Make the current app visually and behaviorally demonstrate the new direction.

2. `Product Layer`
   Turn the concept into a usable product experience with coherent flows and retained state.

3. `Business Layer`
   Add the missing foundations required for monetization.

## Phase 1: Arcade Vertical Slice

Objective:

- prove the concept inside the current app

This phase should still run on the current local architecture.

## Epic 1.1: Theme System Foundation

### Tasks

- add a board view mode model:
  - `classic`
  - `arcade`
- store the active mode in frontend state
- persist the active mode per user board
- add theme-aware CSS variables for:
  - board background
  - card surface
  - borders
  - highlight states
  - AI panel treatment
- separate semantic tokens from mode-specific visual tokens

### Acceptance Criteria

- the same board can render in Classic or Arcade mode
- switching modes does not change board data
- the styling is not hardcoded into individual components

## Epic 1.2: Mode Switcher

### Tasks

- add a visible `Classic / Arcade` toggle in the board shell
- define default mode behavior for first-time users
- animate the transition lightly without full-page churn
- ensure the mode switch remains clear on mobile

### Acceptance Criteria

- users can switch modes in one click
- the switch feels intentional, not like a debug control
- no board interaction regressions occur after switching

## Epic 1.3: Arcade Card Presentation

### Tasks

- define card metadata model additions for visual treatment:
  - `workType`
  - `effort`
  - `priority`
- map missing values to sensible defaults for old cards
- redesign card component for Arcade mode:
  - title as card name
  - details as flavor text
  - effort as `Cost`
  - workType as `Class`
  - priority as `Priority`
- add compact iconography by work type
- add hover/focus states that feel premium, not noisy

### Acceptance Criteria

- cards are still readable at board scale
- cards feel distinct from the classic UI
- missing metadata does not break rendering

## Epic 1.4: Arcade Board Framing

### Tasks

- keep canonical workflow titles as the primary labels
- only add flavor subtitles if they map honestly to user logic
- allow `Draw` only as a real button-based mechanic
- avoid `Hand` and `Play` unless the product gains real mechanics for them
- redesign board shell with a more thematic frame
- add a compact run summary strip near the top
- preserve five visible columns in standard desktop viewport
- preserve horizontal overflow for additional columns

### Acceptance Criteria

- the board reads as workflow first, fantasy second
- added atmosphere does not reduce scanability
- the current board interactions still work

## Epic 1.5: Role-Aware Draw

### Tasks

- add a `Draw` button in Arcade mode
- define a draw source pool from backlog cards
- define a draw destination lane
- add a local player-role profile
- add optional per-card intended-role metadata
- rank draw candidates by:
  - role fit
  - unblock status
  - effort fit
  - priority
  - recency
- use weighted randomness instead of deterministic top-pick only
- add a draw animation with:
  - button feedback
  - brief shuffle/reveal phase
  - movement into the target lane
  - short explanation reveal
- support reduced-motion fallback
- show a small post-draw explanation
- support skip or redraw once

### Acceptance Criteria

- draw feels exciting but not reckless
- a designer almost never draws a pure engineering card
- the mechanic remains understandable to non-gamers
- the animation feels premium and fast rather than noisy

## Phase 2: Game Master AI Experience

Objective:

- make the AI feel productized and differentiated

## Epic 2.1: AI Language Layer

### Tasks

- introduce `Game Master` naming in Arcade mode only
- preserve neutral AI language in Classic mode
- define terminology mapping:
  - sprint -> run
  - recommendation -> best play
  - blocker -> boss fight
  - related tasks -> combo
- ensure the wording remains concise and non-cringey

### Acceptance Criteria

- Arcade mode AI feels more thematic
- Classic mode stays business-safe
- language does not reduce clarity

## Epic 2.2: AI Response Presentation

### Tasks

- redesign the AI panel to support structured output blocks:
  - Best Play
  - Combo
  - Boss Fight
  - Heavy Card
  - Suggested Moves
- visually separate chat from action preview
- allow users to inspect suggested changes before applying
- improve thinking/loading states to fit the Game Master role

### Acceptance Criteria

- AI output feels like a tactical planning assistant
- users can distinguish narrative explanation from applied changes
- the panel is more than a generic chat box

## Epic 2.3: Run Builder Prompting

### Tasks

- add preset prompt shortcuts:
  - Build my next run
  - Split oversized cards
  - Find blockers
  - Suggest the best next play
- shape backend prompts to support these planning actions
- return assistant summaries that are short and operational

### Acceptance Criteria

- common planning actions take one click or one short prompt
- the AI feels specialized to the product

## Phase 3: Sprint Recap And Reward Layer

Objective:

- add tasteful payoff and shareable moments

## Epic 3.1: Run Recap Screen

### Tasks

- define recap data model:
  - cards completed
  - cards deferred
  - blockers removed
  - AI interventions
- design a run summary panel or full-screen overlay
- generate recap copy from board changes over a sprint window
- add a manual `View Run Recap` entry point

### Acceptance Criteria

- users can see a meaningful summary of completed work
- the recap feels satisfying without fake points spam

## Epic 3.2: Shareable Recap Export

### Tasks

- create a social-share export layout
- render a clean summary image/card
- support local download/export first
- test compact and large summary variants

### Acceptance Criteria

- the export is visually strong enough to share
- the content remains understandable outside the app

## Phase 4: Content And Metadata Layer

Objective:

- support the card-game metaphor with real structured task metadata

## Epic 4.1: Card Metadata Editing

### Tasks

- add editable fields for:
  - work type
  - effort
  - priority
- define defaults for old cards
- expose metadata editing in a simple card editor
- ensure metadata is optional and does not clutter the core flow

### Acceptance Criteria

- metadata can be added without slowing down casual use
- Arcade rendering has enough structure to feel intentional

## Epic 4.2: Board Defaults And Templates

### Tasks

- define default starter board themes for:
  - product team
  - indie game team
  - solo builder
- define sample card classes and priority accent mappings
- create a simple template selection flow for new boards

### Acceptance Criteria

- first-time setup feels curated
- users can understand the metaphor from examples

## Phase 5: Design System Hardening

Objective:

- prevent the Arcade layer from becoming ad hoc

## Epic 5.1: Mode-Aware Component Library

### Tasks

- audit core components:
  - board shell
  - column shell
  - task card
  - AI panel
  - recap panel
- define which components are shared and which differ by mode
- create styling rules for:
  - spacing
  - typography
  - highlights
  - animation
- reduce one-off CSS as the feature grows

### Acceptance Criteria

- new UI additions do not fork the app into two unrelated designs
- theme complexity stays manageable

## Phase 6: Hosted Product Foundations

Objective:

- make the app monetizable in reality, not just in concept

This phase goes beyond the current local-only MVP.

## Epic 6.1: Real Authentication

### Tasks

- replace hardcoded login with real hosted auth
- support passwordless or email login
- introduce secure user/account lifecycle

### Acceptance Criteria

- accounts are real and reusable across devices

## Epic 6.2: Cloud Persistence

### Tasks

- move from local SQLite-only persistence to a hosted database
- preserve board JSON compatibility where possible
- support migration from local/dev board structure

### Acceptance Criteria

- boards persist across devices and sessions
- migration path is defined

## Epic 6.3: Collaboration

### Tasks

- add shared workspaces
- add multiple users per board
- define permissions and board ownership
- add collaboration-safe AI actions

### Acceptance Criteria

- teams can use the product together
- monetizable team value exists

## Epic 6.4: Billing

### Tasks

- define plans:
  - Free
  - Pro
  - Studio
- gate cloud/team features appropriately
- gate cosmetic packs later, not before the core value

### Acceptance Criteria

- the app can actually charge for differentiated value

## Phase 7: Cosmetic Expansion

Objective:

- layer in delight once the core business product is solid

## Epic 7.1: Theme Packs

### Tasks

- build theme pack architecture
- create premium board skins
- create premium card frame styles
- allow preview before purchase

### Acceptance Criteria

- cosmetics feel premium
- cosmetics never block essential workflow

## Epic 7.2: Audio And Motion Packs

### Tasks

- test subtle sound pack support
- add motion preferences and disable options
- keep all decorative effects optional

### Acceptance Criteria

- delight increases without harming usability

## Backlog Priority

## P0

- theme system foundation
- mode switcher
- arcade card presentation
- arcade board framing
- AI language layer

## P1

- AI response presentation
- run builder shortcuts
- run recap screen
- card metadata editing

## P2

- shareable recap export
- templates
- design system hardening

## P3

- hosted auth
- cloud persistence
- collaboration
- billing

## P4

- cosmetic packs
- community/share layers

## Suggested Build Order

1. Add Classic / Arcade mode infrastructure
2. Implement arcade board and card rendering
3. Reframe AI as Game Master in Arcade mode
4. Add structured AI recommendation panels
5. Add recap screen
6. Add metadata editing
7. Validate with target users
8. Only then start hosted SaaS foundations

## Technical Notes

## Keep

- current board JSON model as the source of truth
- current board editing paths
- current AI board mutation path

## Add Carefully

- mode state
- card metadata fields
- recap data derivation
- theme token architecture

## Avoid

- a parallel second board model
- branching the app into unrelated screens for Classic and Arcade
- overcommitting to cosmetics before collaboration and hosting exist

## Definition Of Success

The first gamified release succeeds if:

- users can switch between Classic and Arcade modes cleanly
- Arcade mode feels genuinely exciting
- the AI feels more specialized and useful
- the recap flow creates emotional payoff
- the app still feels credible as a planning tool

The business expansion succeeds later if:

- teams can collaborate in the hosted product
- the pricing model maps to real value
- aesthetics drive attention, but utility drives retention

## Recommended Immediate Next Sprint

Implement only the first vertical slice:

- mode switcher
- arcade styling tokens
- arcade card anatomy
- game master naming in Arcade mode
- one structured AI recommendation view

That is the smallest realistic build that can be shown to users for feedback.
