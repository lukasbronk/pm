# Questboard Mock Screen Specs

This document defines the first concept screens needed to test the `Questboard` direction described in:

- [docs/gaming/PLAN.md](/Users/lukasbronk/git/pm/docs/gaming/PLAN.md)
- [docs/gaming/ONE_PAGER.md](/Users/lukasbronk/git/pm/docs/gaming/ONE_PAGER.md)

The goal is not to produce final UI. The goal is to generate high-fidelity concept mocks that answer:

- does the product feel distinctive?
- does the retro card-game layer still feel usable?
- can users understand the product quickly?
- is the AI role more compelling in this framing?

## Design Principles

Every mock should follow these rules:

- keep the core Kanban interaction legible within 3 seconds
- make the retro layer feel intentional, not novelty pasted on top
- avoid pixel-art chaos and gamer cliché overload
- preserve clear hierarchy for titles, columns, buttons, and AI actions
- use game language sparingly and only where it increases clarity or delight
- never use game-system words for features that do not behave like those systems
- ensure the screen could plausibly become production UI

## Visual Direction

Base direction:

- retro deckbuilder meets serious planning tool

Look and feel:

- rich, arcade-inspired surfaces
- collectible-card treatment for tasks
- restrained scanline or CRT texture, not full parody
- bold typography for card names and run states
- deep navy structure with yellow, blue, and purple accents
- subtle animation cues tied to focus, AI suggestions, and progress

Avoid:

- fake fantasy lore overload
- unreadable small caps everywhere
- noisy backgrounds behind dense task content
- overusing neon
- anything that looks like a toy rather than a premium tool

## Screen 1: Landing Hero / Product Reveal

### Purpose

Show the market-facing story in one glance:

- this is project management
- this is different
- this is for people who are bored by standard boards

### What It Needs To Prove

- the concept is immediately intriguing
- the user understands "Kanban meets retro card game" fast
- the product can be marketed visually

### Core Message

Headline:

- `Plan your work like you're building a deck.`

Subhead:

- `Questboard turns sprint planning into a retro-styled card strategy board, with AI that helps your team pick the best next play.`

### Layout

Top navigation:

- logo
- Product
- Arcade Mode
- AI Game Master
- Pricing
- Join Alpha

Hero split:

- left side: headline, subhead, CTA buttons
- right side: animated product preview panel

Lower hero strip:

- social proof placeholders
- 3 benefit callouts

### Hero Preview Content

The product preview should show:

- a 5-column board in Arcade Mode
- visibly card-like tasks with priority/color accents
- an AI panel titled `Game Master`
- one highlighted recommendation like `Best Play: Finish API sync before art polish`

### CTAs

Primary:

- `Join The Alpha`

Secondary:

- `Watch The Demo Run`

### Tone

- stylish
- sharp
- mildly dramatic
- not silly

### Success Criteria

Someone seeing this screen should say:

- "I get it"
- "This looks different"
- "I want to see the product"

## Screen 2: Board In Classic Mode

### Purpose

Prove that the product still works as a serious planning tool even without the full fantasy layer.

### What It Needs To Prove

- the app remains credible for real work
- the board is not dependent on game language to function
- the transition into the product feels safe for skeptical teams

### Layout

Main app shell:

- top-left product identity
- workspace/project title
- mode switcher
- user/team area
- board actions row

Board region:

- five columns visible in one viewport
- horizontal scrolling available for additional columns
- top-level summary chips
- AI Helper launcher visible but not dominating

### Core Components

Header:

- workspace name
- sprint name
- current objective
- mode switcher:
  - Classic
  - Arcade

Board toolbar:

- Add Column
- Filter
- View Summary
- Ask AI

Column cards:

- familiar Kanban structure
- editable titles
- add-card affordance
- clean drag-and-drop treatment

### Content Example

Project:

- `Launch The Demo Build`

Columns:

- Backlog
- Ready
- In Progress
- Review
- Done

Card examples:

- Polish onboarding flow
- Fix AI timeout handling
- Record trailer voiceover
- Finalize retro theme pack

### Design Notes

- retain the brand colors, but keep visual density lower than Arcade Mode
- use this as the anchor screen for skeptical buyers
- no heavy game framing here beyond product identity

### Success Criteria

The viewer should believe:

- this is a real productivity tool
- the gamified layer is optional
- the product can be introduced to a team without embarrassment

## Screen 3: Board In Arcade Mode

### Purpose

Show the full differentiated expression of the product.

### What It Needs To Prove

- the card-game metaphor is exciting
- the board is still usable
- tasks feel more vivid and memorable

### Core Message

This is the same project board, but transformed into a retro deckbuilding interface.

### Layout

Same underlying shell as Classic Mode, but visually transformed:

- stronger board atmosphere
- more graphic card treatment
- more dramatic typography for task cards
- AI Game Master panel more integrated into the scene

### Arcade-Specific Elements

Mode label:

- `Arcade Run Active`

Board framing:

- canonical workflow titles remain primary
- optional secondary flavor labels may be added only when they map honestly to user logic

Avoid as default labels:

- Draw
- Hand
- Play
- any other deck term that implies a mechanic the user cannot actually perform

Allowed as a real control:

- a `Draw` button that pulls one recommended task from backlog into the user's next-work lane
- the button interaction should feel animated and reveal-driven, not like a plain CRUD action

Safer subtitle examples:

- Backlog / Deck
- Ready / Loadout
- In Progress / Active Run
- Review / Checkpoint
- Done / Cleared

Task cards:

- title as card name
- effort as `Cost`
- work type as `Class`
- priority as `Priority`
- details as flavor text

Micro visual cues:

- glow or border treatment for high-priority tasks
- subtle hover lift
- small iconography by class:
  - code
  - design
  - QA
  - ops

### AI Integration

Side panel title:

- `Game Master`

Suggested modules:

- Best Play
- Combo Opportunity
- Boss Fight Warning
- Heavy Card
- Why This Draw

Example recommendation:

- `Best Play: Move "Finalize API schema" ahead of "UI polish" to unblock three dependent cards.`

Draw interaction notes:

- on click, the board shows a brief anticipation cue
- one card reveals as the selected draw
- the card animates into the destination lane
- a small `Why This Draw` note appears immediately after

### Design Notes

- treat this as a premium product fantasy, not a joke
- cards should feel collectable, but not childish
- the board must still read left-to-right as workflow progression
- the metaphor should feel tactically coherent to someone who actually plays games

### Success Criteria

The viewer should say:

- "This looks fun"
- "This still makes sense"
- "I want to plan a sprint in this"

## Screen 4: AI Game Master Planning Panel

### Purpose

Show how AI becomes more than generic chat by acting like a strategic planning companion.

### What It Needs To Prove

- the AI framing is differentiated
- the AI is actionable, not decorative
- the language increases clarity instead of confusion

### Layout

Main screen split:

- left: current board snapshot or selected run plan
- right: Game Master panel

Panel structure:

- current run summary
- prompt input
- suggested actions
- accepted changes preview

### Example Prompt

- `Build me a realistic next run from this backlog and keep total cost realistic for one week.`

### Example AI Output Blocks

Run Summary:

- `This sprint is overloaded on design and underweight on QA.`

Best Play:

- `Pull "Implement auth guard" into active play first. It unlocks 4 related cards.`

Combo:

- `Pair "Design empty states" with "Write loading copy" so review can happen once.`

Boss Fight:

- `The "AI structured output refactor" card is too large. Split it before this sprint.`

Action Preview:

- move 2 cards
- split 1 card
- create 1 QA follow-up

### UI Behavior To Visualize

- suggested changes appear as staged actions
- user can accept all, accept one, or edit before applying
- AI output feels like a strategy briefing, not a chatbot ramble

### Tone

- tactical
- helpful
- slightly dramatic
- concise

### Success Criteria

The viewer should understand:

- why this AI is worth using
- how it materially improves planning
- how it differs from plain chat

## Screen 5: End-Of-Sprint Run Recap

### Purpose

Show the tasteful reward layer and the shareability of the product.

### What It Needs To Prove

- the game framing can create emotional payoff
- the product can generate moments users want to share
- progress feels satisfying without cheap points spam

### Layout

Full-screen recap panel with:

- sprint title
- completion summary
- visual card spread of completed work
- highlights
- next-run suggestions

### Core Content

Title:

- `Run Complete`

Subline:

- `Launch Week Sprint closed with 18 cards cleared, 2 blockers removed, and 1 boss fight deferred.`

Sections:

- Cards Cleared
- Biggest Combo
- Hardest Boss Fight
- MVP Shipped
- Suggested Next Run

### Shareable Element

A polished export card showing:

- sprint name
- cards completed
- most important win
- visual rank or medal

The export should be tasteful enough for:

- social posting
- team Slack sharing
- founder updates

### Design Notes

- keep it premium and editorial
- avoid casino energy
- celebrate accomplishment without infantilizing the user

### Success Criteria

The recap should feel:

- satisfying
- human
- shareable
- motivating for the next sprint

## Optional Screen 6: Pricing / Product Tier Screen

### Purpose

Show how the business model can support the product direction without looking unserious.

### What It Needs To Prove

- the pricing model feels credible
- themes/cosmetics support the core business rather than replacing it

### Structure

Plans:

- Free
- Pro
- Studio

Feature categories:

- boards
- AI planning
- collaboration
- arcade themes
- run history
- exports

### Design Note

Use a premium arcade aesthetic sparingly. This screen should close trust, not just style.

## Prototype Flow Recommendation

If only one clickable prototype is built, use this path:

1. Landing Hero
2. Classic Mode Board
3. Toggle to Arcade Mode
4. Open AI Game Master
5. View Run Recap

That flow tells the whole story:

- this is a serious product
- this is the unique mode
- this is how AI helps
- this is why users might love it

## Deliverables For The Concept Sprint

Create:

- 4 required high-fidelity mocks
- 1 optional pricing mock
- 1 mini style tile for colors, typography, card anatomy, and motion

Required mocks:

- Landing Hero
- Classic Mode Board
- Arcade Mode Board
- AI Game Master Panel

Highly recommended:

- End-Of-Sprint Run Recap

## Review Questions

When reviewing the mocks, ask:

- does the product still read as a board tool first?
- is the retro card layer desirable or distracting?
- does the AI feel more differentiated in this framing?
- would an indie studio proudly use this?
- is there enough seriousness to support paid adoption?

## Recommendation

Do not start with a broad design system.

Start with these screens and validate:

- product desirability
- visual distinctiveness
- usability confidence
- monetization credibility

If the mocks land well, then convert them into a real implementation backlog.
