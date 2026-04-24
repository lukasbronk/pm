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

- `Rook`, Systems-Focused Gamer
  Loves deckbuilders, tactics games, and elegant systems. Immediately rejects game language that does not map to real mechanics.

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

- every work item is presented as a card with class, tags, cost, and priority styling
- users can switch between:
  - `Classic Board`
  - `Arcade Board`
- the AI becomes a `Game Master` that helps rebalance the deck:
  - split overpowered tasks
  - combine weak fragmented tasks
  - suggest the best next run plan
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

`Rook` added a stricter rule:

- if the app says `Draw`, `Hand`, or `Play`, those words must describe real mechanics
- if the app does not actually have a draw/hand/play loop, those labels are fake and should be removed
- deckbuilder flavor should come from card anatomy, sequencing, and AI framing, not from random zone names

### End-of-Day Decision

The product should not become a literal game.

It should become:

- a work management tool with a strong retro deckbuilding fantasy layer
- a system where game terms only appear when they map to actual user logic

That keeps the product usable while making it distinctive.

## Post-Workshop Gamer Review

After the workshop, `Rook` reviewed the concept from a gamer perspective and flagged several weak spots.

### What Did Not Hold Up

- `Draw / Hand / Play / Boss / Archive` as default column relabels
- any terminology that implies deck mechanics without real deck mechanics
- reward loops that sound like RPG progression but do not change planning decisions
- AI labels that are theatrical but not strategically useful

### Gamer Review Notes

- "If there is no draw step, don't call a column Draw."
- "If cards are not entering and leaving a hand, don't call a column Hand."
- "Players accept abstraction, but not fake system language."
- "The best game metaphor here is tactical sequencing, not pretend combat."

### Adjusted Product Rule

The arcade layer should lean on:

- card identity
- deckbuilding-style prioritization
- tactical AI guidance
- run recaps

It should not lean on:

- invented board zones that do not change behavior
- pseudo-game mechanics with no user value

## Persona Follow-Up: Real Draw Mechanic

After the terminology cleanup, the persona council reviewed one path for bringing `Draw` back as a real feature.

`Mara` liked it because:

- it creates a memorable ritual around starting work
- it gives Arcade mode one ownable mechanic beyond visual treatment

`Iris` accepted it only with strict limits:

- draw must use the same board data model
- it cannot require a second hidden game board
- it must stay explainable in plain workflow terms

`Grandpa Hex` set the blunt rule:

- "Do not let designers pull backend sludge at random."

`Rook` tightened the gamer rule:

- draw should be weighted and smart, not random for its own sake
- surprise is good
- sabotage is not

### New Draw Decision

`Draw` is allowed if it becomes a real action with real logic:

- a user presses a `Draw` button
- the system selects one candidate card from a defined backlog pool
- the choice is weighted by role fit, priority, effort, and run context
- the drawn card moves into a defined next-work lane
- the UI explains why that card was drawn

## Arcade Logic In Plain English

`Rook` pushed for the game layer to be explainable in one pass to both a gamer and a normal project user.

The clean version is:

- the board is still a workflow board, not a literal deckbuilder
- a `run` is the current sprint, focus window, or work cycle
- a card `Cost` is estimated effort
- a card `Class` is the kind of work:
  - product
  - design
  - code
  - QA
  - ops
- a card `Priority` is still priority, just presented with stronger arcade styling
- `Best Play` means the highest-leverage next move
- `Combo` means two or more tasks that unlock value together
- `Boss Fight` means the largest risky blocker or ugliest hard task
- `Heavy Card` means a task that is too large or expensive for the current run

Reserved for a future real mechanic only:

- `Draw`
- `Hand`
- `Play`

Allowed current-use mechanic:

- `Draw` can exist now as a button-based action that pulls one recommended card from the backlog into the user's next-work lane

Still reserved unless explicitly implemented:

- `Hand` as a real shortlist zone
- `Play` as a real active-execution zone

If Questboard ever adds an explicit sprint drafting system, those terms can return with real behavior:

- `Draw` = candidate tasks pulled from backlog
- `Hand` = the shortlist committed for the run
- `Play` = tasks actively being worked right now

Until then, the app should keep normal workflow column names.

## Draw Logic In Plain English

If the user clicks `Draw`, the system should:

1. look at the user's role focus
2. scan the backlog for cards they can plausibly own
3. weight candidates using:
   - work-type fit
   - card priority
   - card effort relative to the run
   - whether the card is blocked
   - whether a similar card was just drawn
4. select one card with weighted randomness
5. move it into the next-work lane
6. show a short reason:
   - `Drawn because it matches your role and helps unblock the run.`

This keeps the surprise while staying professionally sane.

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
- priority shown as `priority`
- labels shown as `type` or `class`
- sprint summary shown as a `run screen`
- AI suggestions shown as:
  - `best play`
  - `heavy card`
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
- deckbuilder-flavored run planning
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
- cards with borders, icons, priority accents, and tiny retro stat blocks
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
- priority with stronger tactical emphasis

## AI Layer

The AI assistant becomes:

- `Game Master`

Example behaviors:

- "Build me a realistic next run from this backlog."
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
- fake deck terminology that does not map to real interactions

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
