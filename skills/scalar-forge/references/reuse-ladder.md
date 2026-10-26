# Reuse ladder — the gate before anything new

Every visual or structural decision goes down this ladder. **Stop at the first
rung that works.** You may only go to the next rung by writing down, in one line,
why the rung above cannot do it. "It would look nicer" is not a reason;
"the feature needs X and rung N has no X" is.

Run `node <skill-dir>/scripts/reuse-check.mjs <keywords>` first.
Try 2–3 synonyms before concluding something doesn't exist.

| # | Rung | Test | Where to look |
|---|---|---|---|
| 1 | **An existing screen/state already does it** | Same job, different data? | `docs/product/screens.json`, `screen-catalog.md` |
| 2 | **Compose existing screens' inner pieces** | Import them; don't redraw | the screen's folder in `apps/product/src/screens/` |
| 3 | **A `PageTemplate` / chrome slot** (`area`, `company`/`section`, `subNav`/`subNavEnd`, `headerEnd`, `dock`, `overlay`, `openMenu`, `Toolbar*`) | Is it a page frame, a nav tier, a menu, a modal or a drawer? | `shell/`, `docs/page-template.md`, `docs/navigation-3-tier-system.md` §7–8 |
| 4 | **An existing DS component, its props/variants — as its story shows** | Intent → component table, then the story | `AI-GUIDE.md` §5, §7; Storybook (`references/storybook.md`); `docs/components.md` |
| 5 | **A composition of existing DS components** | Layout out of DS parts + `space`/`size` tokens only; check the stories for a composition already shown | `AI-GUIDE.md` §3 (space/size) |
| 6 | **A new screen-local layout** (a `<div>` arrangement of DS parts, tokens only) | Only if 1–5 fail; lives in the screen folder | — |
| 7 | **A new DS component / token / chrome pattern** | Only if the *feature* requires behaviour no composition gives | **Propose, don't build** (below) |

## What counts as "the feature requests it"

New layout / component is justified **only** when at least one is true:
- The feature has an interaction with no equivalent (e.g. drag-to-reorder, a board/kanban) — confirmed by `reuse-check`, the Storybook index and AI-GUIDE §5. (Calendars, timelines, step pills, deal cards, the Valuation modal, assignee cards, step assignment and notes already exist — Workboard family.)
- The information architecture genuinely changes (a new top-level area, a new scope).
- The requested data shape doesn't fit any grid/list/form archetype.

These are **not** reasons: matching a competitor's look, a screenshot the user
pasted that uses different styling (the DS wins — AI-GUIDE overrides screenshots),
"a slightly different padding", "a custom card", one-off colours.

## Never, at any rung

- A raw hex, rgb, px in spacing/sizing, or hand-set font size — `npm run lint:tokens` fails them. Use `color.*`, `space.*`, `size.*`, `type.style()`.
- A `--primitive-*` token in product code (R1). Only semantic tokens.
- Dark mode on a page (R14), a hand-assembled nav bar, a fourth nav tier, or extra padding/scroll wrappers in the `PageTemplate` body.
- A fork or product-specific re-skin of `Table`.
- Text below 12px (R10). PRISM colours for anything but entity type (R11).
- An HTML `<table>` (use `DataGrid` / `Table`), a `Pagination` under a table or a table with its pagination bar hidden (the table pages itself, R15), a `Link` in a row's first cell (use `RowHeader href`), a `Button` that navigates (use `Link`), `window.confirm` (use `ConfirmationDialog`).
- A hard-coded company/user list — use `db`, `fixtures.ts`.
- Silently "fixing" something in `docs/known-gaps.md` — those are deliberate.

## Rung 7 protocol — when something new IS needed

1. **State the gap** in ≤3 lines: what the feature needs, which rungs 1–6 you tried, why each failed.
2. **Ask the user** before building it (it changes the shared design system, not just a screen).
3. If approved, build the *smallest* thing:
   - **Screen-local first** (rung 6) — a tokens-only composition inside the screen folder, named for what it is. Promote to `src/components/` only if a second screen needs it.
   - **New token**: token values come **from Figma**, never from code. Propose it to design; once it is in the published library, transcribe it into `src/styles/tokens.css` → `npm run gen:tokens` → `node scripts/gen-docs.mjs` → `npm run verify` (the generated `tokens.json`, `generated.ts`, `docs/tokens.md` are never hand-edited). Semantic, never primitive; Light and Dark values; a new `bg.*` re-runs the contrast gate (R13, `npm run lint:contrast`). Follow Prism-v1 `ONBOARDING.md` › *Adding a new token*. The Deal family (gap 14) is the worked example: the variable was created in the tokens file with the file's conventions (ask first, it's a shared library), the user published it, then it was transcribed. Every fill gets an AA ink. The Workflow tones (gap 13) remain the only code-first family — don't add to it.
   - **New DS component**: `src/components/<family>/`, following `docs/component-contract.md` (`forwardRef`, native props + `...rest`, merged `className`, exported props type, `asChild` on triggers, the APG keyboard model for any role). Ship it with a **story** (`<Name>.stories.tsx`, `tags: ['autodocs']`) and a **test** (axe + keyboard + ref/className passthrough); export from the family `index.ts`; add a row to `docs/components.md` marked **＋**; document props in `AI-GUIDE.md` §7 (and §5 if it answers a new intent). `npm run verify` and `npm run test:stories` must pass.
4. **Log it**: add the gap and your choice to the screen's `docs/product/pages/NN-*.md` "Gaps" section so design can adopt it in Figma (Figma is the source; code-only additions are debt until then).
5. `npm run verify:product` (and `npm run verify` if `src/` changed) must stay green.

## Quick anti-drift table

| Temptation | Do instead |
|---|---|
| Copy the Cap Table grid and tweak | import/compose its cells; use `DataGrid` + grid-pattern cells |
| A spreadsheet with its own selection/resize logic | `Table` (`columns` / `rows` / `cells`) |
| Hand-build the page top (menus, company bar, drawer) | `PageTemplate` props |
| A custom calendar, Gantt or status pill | `WorkCalendar`, `WorkTimeline`, `ActionPill` / `ActionTag` / `DueDatePill` |
| Make a "stat card" | `SummaryCard` family (`docs/components.md` §13) |
| An animated / gradient "AI is working" border | `AiOutline` (`color.gradient.ai.*`, orbit in CSS) |
| A custom notification popover or toast animation | `NotificationCenter` surface + `Toast`; motion from `motion.*` (references/notifications-and-ai-motion.md) |
| Build a custom empty/loading/error block | `EmptyState`, `Skeleton`, `Alert`/`Banner`, feedback patterns (§14, §24) |
| Custom filter bar | `FilterDropdown`, `Chip`, `ViewTabBar` |
| A bespoke side panel | `Drawer` / Workspace Drawer / overlays (§25) |
| Invent a settings form | Form Patterns (§21) + Settings & Admin (§26) |
