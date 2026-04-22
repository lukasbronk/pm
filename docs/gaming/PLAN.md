# Gamified Market Expansion Plan

This document explores how to evolve the current Kanban app into a marketable, game-forward product. It is intentionally separate from the core MVP plan in [docs/PLAN.md](/Users/lukasbronk/git/pm/docs/PLAN.md).

## Context

The current app is a local-only Kanban MVP with:

- one user session
- one board per user
- AI-assisted card operations
- no billing
- no collaboration
- no cloud deployment

That means it is not monetizable in its current form. To monetize it, the product needs a market-facing version with hosted accounts, durable cloud storage, collaboration, and a sharper positioning than "another Kanban tool."

The strongest differentiation idea explored here is:

- a hybrid of Kanban board management and a retro-inspired card game

Working concept name:

- `Questboard`

Tagline:

- `Plan your work like you're building a deck.`

## Workshop Team

### Product

- `Mara`, Senior Product Lead
  Practical, market-aware, pushes for a wedge that is defensible and specific.

- `Leo`, Junior Product Manager
  Brings energy, trend awareness, creator economy instincts, and lightweight experimentation ideas.

### Engineering

- `Iris`, Staff Engineer
  Focused on architecture, feasibility, migration risk, and what can ship in believable phases.

- `Noah`, Senior Full-Stack Engineer
  Strong on implementation detail, integration surfaces, and operational tradeoffs.

### Design

- `Sana`, Product Designer
  Shapes the visual system, brand feel, and the retro card game metaphor without making the app silly.

- `Vik`, UX Researcher
  Obsessed with comprehension, onboarding friction, and how to keep the product legible under novelty.

### Wildcards

- `Grandpa Hex`, Gnarly Grandpa
  Gruff, sharp, skeptical. Loves old tabletop games, hates gimmicks, immediately spots fake fun.

- `Mina`, Super Curious Student
  Asks naive but useful questions, notices delight, learning loops, and reasons someone would keep coming back.

## Three-Day Workshop Simulation

## Day 1: What Are We Actually Selling?

### Morning Prompt

How do we make this app exciting enough to stand out without destroying the usefulness of a Kanban board?

### Discussion

`Mara` opened with the central problem:

- the Kanban market is saturated
- generic productivity software is hard to differentiate
- pure "AI for task boards" is not enough because many products can add AI

`Leo` proposed leaning into a generation raised on:

- deckbuilding games
- collectible card aesthetics
- progression loops
- streaming and shareable setups

`Grandpa Hex` objected immediately:

- "If the game part makes the work harder, it's trash."

That became the first governing rule:

- the game layer must make planning feel more vivid, not more complicated

`Mina` asked a framing question that shifted the room:

- "What if the board isn't pretending to be a game? What if work cards really behave like a deck you are organizing for a run?"

That unlocked the workshop.

### Best Ideas Generated

- every work item is presented as a card with rarity, class, tags, and energy cost styling
- columns become `zones`, like stages in a run:
  - `Draw`
  - `Hand`
  - `Play`
  - `Boss`
  - `Archive`
- users can switch between:
  - `Classic Board`
  - `Arcade Board`
- the AI becomes a `Game Master` that helps rebalance the deck:
  - split overpowered tasks
  - combine weak fragmented tasks
  - suggest a "best next hand"
- planning sessions can become `runs`:
  - a sprint is a run
  - finishing cards earns streaks, badges, and visual rewards

### Conflict

`Vik` warned that:

- game terminology can confuse teams
- task boards need instant clarity
- novelty cannot replace recognizability

`Sana` proposed the compromise:

- keep the underlying Kanban model unchanged
- skin the board with card-game language and optional visual themes
- preserve plain-language mode for teams that want less flavor

### End-of-Day Decision

The product should not become a literal game.

It should become:

- a work management tool with a strong retro deckbuilding fantasy layer

That keeps the product usable while making it distinctive.

## Day 2: Who Pays, Why, and For What?

### Morning Prompt

Which users would actually pay for this, and what version of the product gives them enough value to switch?

### Candidate Audiences

- indie game studios
- creative agencies
- startup teams
- student project groups
- solo builders and streamers
- engineering teams that hate bland enterprise tools

### Discussion

`Mara` pushed for a sharp wedge:

- indie game teams and creator-led teams are the best early market
- they already understand cards, runs, classes, progression, and thematic UI
- they are more willing to adopt a weird tool if it feels good

`Grandpa Hex` translated that into a blunt rule:

- "Sell it to people who already speak the language."

`Leo` wanted a consumer-ish freemium play:

- free personal boards
- premium themes and cosmetics
- shareable board replays

`Iris` pushed back:

- cosmetics alone are weak unless there is a strong community loop
- B2B SaaS should fund the product first

`Mina` argued for a blended model:

- teams pay for collaboration
- individuals pay for identity and delight

That became the second major direction.

### Monetization Models Explored

#### Option A: Straight SaaS

- free single-player board
- paid team seats
- AI credits on higher plans

Pros:

- clear
- proven
- easy to understand

Cons:

- sounds like every other project tool

#### Option B: SaaS + Cosmetic Layer

- free personal plan
- Pro plan unlocks cloud sync, advanced AI, shared workspaces
- optional paid retro card themes, sound packs, board skins, animated finishes

Pros:

- differentiated
- supports fandom and creator culture
- turns style into revenue without locking core work features

Cons:

- only works if the product has genuine affection and identity

#### Option C: Team Battle / Seasonal Play

- orgs enter seasonal productivity leagues
- teams earn ranks from completed sprint goals
- sponsor prizes or premium events

Pros:

- highly novel
- strong shareability

Cons:

- dangerously gimmicky if introduced too early

### End-of-Day Decision

Recommended revenue model:

- `B2B SaaS first`
- `consumer-style cosmetics second`
- `seasonal play much later, only if retention justifies it`

Initial pricing direction:

- `Free`: one user, limited AI, local or lightweight cloud sync
- `Pro`: solo power users, expanded AI, premium themes, history, exports
- `Studio`: team collaboration, multiplayer boards, admin, templates, shared AI assistant

## Day 3: What Does The Product Actually Become?

### Morning Prompt

What is the smallest believable version of the retro-card concept that is exciting, useful, and buildable?

### Core Product Shape

The team aligned on a dual-mode board:

- `Classic Mode`
  Standard Kanban with the current productivity language.

- `Arcade Mode`
  Same board data model, but rendered as a retro deckbuilder interface.

### Arcade Mode Elements

- cards styled like collectible relic/action cards
- task difficulty shown as `cost`
- priority shown as `rarity`
- labels shown as `type` or `class`
- sprint summary shown as a `run screen`
- AI suggestions shown as:
  - `best play`
  - `dead weight`
  - `combo`
  - `boss fight`

### The Big Insight

`Vik` and `Grandpa Hex` found the cleanest framing:

- don't gamify completion with fake coins
- dramatize planning decisions using game grammar people already enjoy

That means:

- no shallow points spam
- no manipulative streak junk as the primary system
- yes to a stronger mental model for prioritization and momentum

### Winning Feature Set For Launch

- retro card visual theme
- classic and arcade view toggle
- AI `Game Master` assistant
- deck-style sprint planning
- end-of-sprint recap as a `run summary`
- optional cosmetic customization for boards and card frames

### End-of-Workshop Product Thesis

`Questboard` is not "Trello with skins."

It is:

- a project board that turns task planning into deckbuilding
- visually memorable enough to spread
- useful enough to justify daily use
- playful enough to make work feel lighter without reducing rigor

## Recommended Market Positioning

### Positioning Statement

For indie teams, creators, and small studios who want project planning to feel energizing instead of sterile, `Questboard` is a Kanban planning tool with a retro deckbuilding interface and AI game-master assistance that helps teams prioritize, sequence, and ship work with more momentum and more identity than generic productivity tools.

### Target Segments

Primary:

- indie game studios
- small creative software teams
- startup product teams with strong design culture

Secondary:

- student teams
- solo builders
- streamers and creators who share build-in-public workflows

### Why They Might Switch

- visual identity is distinctive
- planning feels less boring
- AI framing is more actionable than generic chat
- it is easier to pitch internally than a purely playful "gameified productivity app"

## What The Product Could Look Like

## Board Layer

- columns rendered as lanes in a pixel-art control room or card-table layout
- five default zones visible in one view
- horizontal overflow like a tabletop spread
- cards with borders, icons, rarity colors, and tiny retro stat blocks
- subtle scanline, cabinet, or CRT-inspired texture options

## Card Layer

Each task card could show:

- title as the card name
- details as flavor text
- cost as estimated effort
- class as work type:
  - design
  - code
  - QA
  - ops
- rarity as priority or strategic importance

## AI Layer

The AI assistant becomes:

- `Game Master`

Example behaviors:

- "Build me a balanced sprint hand from this backlog."
- "Which cards are too big and should be split?"
- "Move all boss-fight tasks into next sprint."
- "What combo should we finish first to unblock the team?"

## Reward Layer

Keep this tasteful and lightweight:

- run summaries
- milestone unlock art
- cosmetic board themes
- completion animations for major releases

Avoid:

- addictive dark-pattern points systems
- excessive reward spam
- mechanics that punish missed work with shame loops

## Monetization Plan

## Phase 1: Core SaaS Revenue

Sell the actual work value first.

### Free

- personal board
- limited AI suggestions
- 1 retro theme
- local export

### Pro

- cloud sync
- AI planning packs
- advanced themes
- sprint/run history
- deck templates

Potential price:

- `$10-15/user/month`

### Studio

- shared workspaces
- team permissions
- multiplayer planning sessions
- AI collaboration tools
- team template packs
- analytics

Potential price:

- `$20-30/user/month`

## Phase 2: Cosmetic Revenue

Only after product love is real.

- premium theme packs
- card frame packs
- soundtrack packs
- seasonal visual skins
- creator collaboration packs

These should never gate core collaboration or core productivity.

## Phase 3: Community Revenue

Only if the product reaches enough usage density.

- community template marketplace
- creator-made board skins
- sponsored themed events
- team challenge seasons

## Go-To-Market Plan

## Wedge

Start with:

- indie game dev teams
- creative dev agencies
- startup teams that want something less sterile than Jira/Linear/Trello

## Launch Tactics

- demo video showing a sprint planned like a deckbuilding run
- landing page contrasting `boring boards` vs `Questboard`
- invite-only alpha for indie studios
- build-in-public clips on X, TikTok, YouTube Shorts
- shareable end-of-sprint run summaries

## Content Hooks

- `I turned sprint planning into a deckbuilder`
- `Our project board feels like a retro card game now`
- `The AI GM rebuilt our sprint in 20 seconds`

## Community Strategy

- recruit 10-20 visually opinionated alpha teams
- collect screenshots and planning rituals
- feature team setups and board skins publicly
- build a small but strong subculture before broadening

## Implementation Plan

## Phase A: Concept Validation

- create clickable mockups for Classic vs Arcade modes
- test desirability with 8-12 target teams
- validate whether the game metaphor increases excitement without hurting clarity
- decide final naming direction:
  - Questboard
  - SprintDeck
  - TaskRaid
  - CardSprint

Success criteria:

- users understand the product quickly
- at least half of target interviewees say the concept is meaningfully more interesting than generic tools
- no major confusion about core board actions

## Phase B: Vertical Slice

- add theme architecture to current frontend
- implement `Classic` and `Arcade` board views on the same board data
- redesign cards with retro-card styling
- rename AI sidebar role in Arcade mode to `Game Master`
- add sprint summary screen with `run recap` language

Success criteria:

- current Kanban functionality still works
- the same board can switch views instantly
- the arcade layer feels cohesive, not pasted on

## Phase C: Marketable Product Foundations

- move from local-only to hosted accounts
- add cloud database and multi-user auth
- support team workspaces and shared boards
- add billing
- add analytics and onboarding

Success criteria:

- the app is actually sellable as a SaaS product
- team collaboration works reliably
- billing and account boundaries are clear

## Phase D: Monetization Expansion

- add premium visual packs
- add template packs for different team archetypes
- add shareable run recap exports
- test creator and affiliate partnerships

Success criteria:

- cosmetic attach rate is measurable
- premium value is visible without harming the free experience

## Phase E: Community Flywheel

- template marketplace
- creator skin program
- seasonal community challenges
- public gallery of notable boards

Success criteria:

- users share their boards voluntarily
- community content drives signups

## Product Risks

- the concept may read as gimmicky to mainstream teams
- the card metaphor may become noisy if overdesigned
- monetization through cosmetics may underperform
- the leap from local MVP to sellable SaaS is non-trivial
- AI theming may sound cute but still needs to be genuinely useful

## Risk Controls

- preserve a plain-language classic mode
- keep the underlying board model simple
- validate with real target users before building a large theme system
- monetize collaboration and AI value before cosmetics
- treat style as differentiation, not as a substitute for product quality

## Recommendation

Pursue this direction if the goal is not just "make the current app prettier," but:

- create a real market wedge
- appeal to teams with creative identity
- make project management feel memorable enough to spread

Recommended next step:

- design a `Questboard` concept sprint with 3-4 high-fidelity mock screens
- keep the current app as the functional base
- build the retro-card layer as an optional mode, not a rewrite

If this direction lands, the product can monetize as:

- a serious SaaS tool with a strong personality
- not as a toy pretending to be a business
