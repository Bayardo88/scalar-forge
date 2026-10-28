---
name: scalar-forge
description: "Build real, clickable prototypes of the Scalar product — new pages, edits to existing pages, new features, standalone screens — using only Scalar design tokens, the coded design-system components (latest Prism-v1 main) and their Storybook stories, and the product's documented screen logic. Reuse-first: never hard-codes values or invents components or layouts unless the feature itself requires it. Use whenever someone asks to add, change, extend, mock up, prototype or explore any Scalar screen, flow, modal, state or feature (Home, Intelligence, Valuations, Waterfalls, Documents, Reports, Workboard, Company pages, Account, User Management, Comp Groups, Audit Logs, Firm Settings), asks for a one-off screen, or pastes a Scalar Figma link — and to push a built screen back into Figma. Replaces the retired scalar-product and scalar-screen skills."
---

# Scalar Forge

Turns "I need a page" or "I want to explore this feature" into a working React
prototype of the **real Scalar product**. It builds only from what already exists,
**on the latest design system, which is Prism-v1 `main`**:

- **Tokens and components:** `@scalar/design-system` (Prism-v1 `src/`): 491 tokens (including the Workflow, Deal and Gradient/AI families) and the 168 Figma components, plus the code-layer and Workboard families (the Valuation modal among them) and `AiOutline`, the "AI is working" animation.
- **Usage:** the Storybook built from `main`, https://scalar-ds-storybook.netlify.app (50 groups, 442 stories, plus MDX spec pages such as *Prism Table spec*, *Valuation Modal spec* and *AiOutline spec*). See [references/storybook.md](references/storybook.md).
- **Screen base:** `PageTemplate` (`docs/page-template.md`) and the 3-tier navigation spec (`docs/navigation-3-tier-system.md`).
- **Platform chrome and coded screens:** Prism-v1 `apps/product/`, which has 37 screens covering all 103 frames of Figma file `cZktZhD0ssL5lRVOvSqmOV`, plus prototypes.
- **Logic and documentation:** `AI-GUIDE.md`, `docs/`, `docs/product/pages/*.md`, and the product-logic contract `docs/product/domain-logic.md` (AI-GUIDE §11).

The skill's value is discipline: **reuse first, add something new only when the
feature demands it, and prove it.**

## Non-negotiables

1. **Build on the latest `main`.** Never build on a stale branch or approximate from memory (Step 0).
2. No raw hex/rgb, no raw px in spacing or sizing, no hand-set font sizes, no `--primitive-*` tokens (R1), and nothing under 12px (R10; `heading.xs` is allowed only for data-grid chrome). `npm run lint:tokens` enforces this.
3. No new component, token, layout pattern or chrome unless it passes the **reuse ladder**, and even then you ask first.
4. **Use components the way their stories do.** Take props and composition from the story source and AI-GUIDE §7, not from taste or an old screen.
5. **Every screen starts from `PageTemplate`.** Never hand-assemble the Primary Menu, company header or drawer. **The three navigation tiers are sticky:** the frame is one viewport tall, the document never scrolls, and tables and content scroll *under* Tier 1–3 while the drawer stays docked. The shell owns this (`AppFrame` + `scrollBody` on the body `<main>`; `PageBody` / `CompanyLayout` already use it). Never add `position: sticky` to a bar or wrap the page in your own scroll container; a hand-written body `<main>` spreads `scrollBody`.
6. Behaviour comes from the documented patterns and page docs, not from taste.
7. **Light mode only (R14).** Every page, prototype and Figma frame is light, even when the OS is dark. Use `ScalarProvider mode="light"` (the default). Never ship `mode="dark"`, `data-theme="dark"` or your own dark styling. Don't add theme toggles or dark previews. If someone explicitly asks for dark, point out R14 (dark is a library-only preview) before doing anything.
8. **No table shows pagination (R15).** Tables are `DataGrid` or `Table`, and they render every row. Never put a `Pagination` (or `PageItem`) under or beside a table, never `slice` a table's rows into pages, never add page or rows-per-page state to a screen. A long grid stays one grid: bound a `DataGrid` with `maxHeight` (body scrolls, header sticks) or collapse `Table` groups. If someone asks for a paginated table, point out R15 before doing anything. `npm run lint:tables` enforces it.
9. **Every table uses the one column header, `ColumnHeader` (R16).** The head of every `DataGrid` / `Table` is `ColumnHeader`, as in the Storybook *Data › Table › ColumnHeader* stories (navy `brand` by default; `tone="subtle"` for a table inside a card or modal). Never use `GridColumnHeader` or `AddColumnHeader` in a screen, even when the Figma frame draws the Grid Column Header (known gap 16). Sort is `sort` + `onSortChange`, a filter or help button goes in `actions` (icons `tone="onBrand"` on the navy band), an editable-date column is `input` + `icon`, and the trailing add-column header is the product's `AddColumn` (`apps/product/src/shell/AddColumn.tsx`). A column's kind or period ("Projection", "LTM", "NTM", "As Of") is the header's `label` tag, not a `ColumnGroupHeader` row above it, and a column menu sits in the header's `actions`. In a financial statement the only break between periods is the actuals→projections rule (`GridColumnDivider type="period"`): the trailing LTM / NTM / As Of columns follow the last projection directly, with no gutter, spacer or blank track (story *Data › GridPatterns › Statement Trailing Periods*). Never give a `ColumnHeader` a `background` through `style` (a sticky-pin style included): it loses the navy fill and its white label disappears. Grid-pattern cells (`RowLabelCell`, `GridValueCell`) stay. `npm run lint:tables` enforces the header rule.
10. **Product logic (AI-GUIDE §11, P1–P10).** Every company value is bound to its valuation context. Read it from `useValuationContext(company)`, never from local state or a hard-coded date or version. The market date is not the measurement date. Versions are scenarios, not overwrites: a Cap Table version selects its paired Fund Ownership. Empty is not zero: use `displayValue()` / `ABSENCE_LABEL`, never a placeholder `$0`. No valuation maths in UI: prototype numbers come only from `domain/illustrative-calcs.ts`. Validate, never correct: weights total 100%, breakpoints ascend, transaction date ≤ measurement. Draft is not published. Editors use `useEditor` (save state plus the unsaved-changes guard). Anything the contract marks `VERIFY` stays presentational. `npm run test:product` and `npm run lint:product-logic` enforce parts of this.
11. Nothing is "done" until it has been rendered and checked.

---

## Step 0: Get the latest design system and load the contract

1. **Locate Prism-v1:** `$PRISM_V1`, the current directory if it has `apps/product/`, or `~/Documents/GitHub/Prism-v1`. If it's missing, run `git clone https://github.com/Bayardo88/Prism-v1` and `npm install`. If it can't be obtained, **stop and say so**. Never approximate the design system from memory, an old mockup or a stale checkout.
2. **Sync to `main`:** run `git fetch origin`, then `git rev-list --count HEAD..origin/main`.
   - Behind, and the user's checkout is clean on `main`: `git pull --ff-only`.
   - On another branch, or with local changes: **don't touch their checkout.** Work in a worktree: `git worktree add -b <topic> ../Prism-v1-<topic> origin/main` (then `npm install` there).
   - Say which commit you are building on (`git log -1 --oneline origin/main`).
   - Build against a feature branch only when the user asks. Then use its Netlify deploy preview or `npm run storybook` instead of the live Storybook.
3. Read **`AI-GUIDE.md`** in full: rules R1–R16, the intent→component railroad (§5), the API (§7) and the product-logic rules P1–P10 (§11). It overrides any screenshot, story or existing screen.
   For any product screen, also read **`docs/product/domain-logic.md`**: the valuation context, the three time axes, versions and pairing, the state vocabulary, empty vs zero, validation, workflow status and the open questions you must not implement. Its source is `docs/product/training-notes-2025/` (dated evidence; the Figma frames outrank it).
4. Read **`docs/page-template.md`** (§6 is the agent rules) and **`docs/navigation-3-tier-system.md`** §1 and §7–8 (tier scope and the per-screen configuration matrix).
5. Read [references/storybook.md](references/storybook.md), [references/app-architecture.md](references/app-architecture.md), [references/reuse-ladder.md](references/reuse-ladder.md) and [references/screen-logic.md](references/screen-logic.md). For anything that notifies the user (bell, panel, toast) or shows **AI working** or other motion, also read [references/notifications-and-ai-motion.md](references/notifications-and-ai-motion.md).
6. Skim `docs/known-gaps.md`. Gaps change what you may build (charts, dense grids, icons, unpublished `cell`/`Header`, Workflow tones (13), Deal tokens (14)).
7. See what exists: `docs/product/screen-catalog.md` / `screens.json`, `docs/product/README.md` (IA map) and the Storybook index.

## Step 1: Classify the request

| The user wants… | Mode | Go to |
|---|---|---|
| A page that doesn't exist yet | **New page** | 3A |
| A change to an existing page (layout, content, new state, modal) | **Edit page** | 3B |
| A flow to click through or an idea to explore, possibly throwaway | **Prototype** | 3C |
| A one-off screen outside the product (demo, gallery, experiment) | **Standalone** | 3D |
| A built screen pushed into Figma | **Figma push** | Step 5 |

For a Figma link or node id, look it up in `screens.json` (`states[].figmaNode`):
- **Found:** use **Edit page** on that screen and state. The frame is already coded, so read the code; don't rebuild from Figma.
- **Not found:** the frame is newer than the code. Use **New page** (or add a new state to the closest screen) and add the frame to `apps/product/figma-frames.json`.

A link to the components file (`Z4MtKOfkNEzhMYJzN1q3kR`) is a component. Find its story; don't treat it as a screen.

A link to the **workboard file** (`tuFpgEHX8w3BDI40U0FUwV`) is usually already coded. The "Assign users form Modal" section (532:16434) is `ValuationModal` and its parts, and every frame has a story. `docs/components.md` › Workboard maps each Figma node to its component. Compose from those; don't rebuild the modal from Figma.

Before writing code, state in one line the mode, the existing screen(s) you start from, and the `main` commit you build on.

## Step 2: Reuse check → screen brief → ladder (mandatory, before any JSX)

1. Run `node <skill-dir>/scripts/reuse-check.mjs <2–4 keywords + synonyms>`. It searches:
   - screens and states
   - **Storybook stories** (live index, with docs URLs and source paths)
   - the Figma→React map and the AI-GUIDE intent table and API
   - the PageTemplate and navigation specs
   - page docs, tokens and known gaps

   It also warns when the checkout is behind `origin/main`. Try synonyms before concluding something doesn't exist.
2. **Open the story** of every component you plan to use (docs URL or `*.stories.tsx` source). Note the props and wiring you will copy.
3. Write the **screen brief** (screen-logic.md §1): job · chrome (PageTemplate slots and nav tiers) · archetype · route and entry point · data · inputs vs calculated · states · actions and outcomes · rules · reuse verdict, with the stories used.
4. Walk the **reuse ladder**. Everything must land on rungs 1–5:
   1. an existing screen
   2. composed pieces of existing screens
   3. a PageTemplate or chrome slot
   4. a DS component and its props, as shown in its story
   5. a composition of DS parts

   Something new is allowed **only when the feature needs behaviour nothing existing provides**. Then run the rung-7 protocol: state the gap → ask → build the smallest thing (with a story and a test) → log it. Never for looks, and never to match a pasted screenshot.

## Step 3: Build

### 3A · New page
1. **Wrap it in `PageTemplate`** from `apps/product/src/shell/PageTemplate.js`. Your content is its `children` (the body slot). Choose `area`, `company`/`section`, `subNav` and `dock` from the ticket and the navigation spec's screen matrix. Add no outer padding, `max-width` or scroll wrapper, and leave no `BodySlot`.
2. Base it on the **nearest existing screen** (same archetype and nav configuration). Copy its structure, not its data.
3. Put it in the `screens/<page>/` folder of its Figma page, or in a new `screens/p17-<area>/` (add that to `registry.ts` and give it a Figma page name).
4. Add the route in `apps/product/src/routes.ts`. Company pages go under `company:` and use `companyPattern(...)`.
5. **Wire a way in and out:** a Tier 1/2/3 menu item, tab, row link (`RowHeader href`) or menu entry. An unreachable page isn't done. Editing chrome in `shell/` is fine when the IA really changes; say so.
6. Register a `ScreenDef` with at least one state. A real state needs a Figma frame id; until it has one, the page is a prototype (3C).

### 3B · Edit page
1. Find it: catalog → `component` + `id` → `screens/<page>/<Component>.tsx`. Read the whole file and its `index.ts` first.
2. A new visual variant is a **new state**, not a new screen: `{ key, label, figmaNode, section }`. Derive the UI from `state` and keep it interactive (`useState(initialFromState)`).
3. Older screens still use `CompanyLayout`. That's fine. Don't migrate a screen to `PageTemplate` unless asked; if you do, it's a straight wrapper and prop-name swap.
4. Keep shared names and figures in sync in `data/fixtures.ts` / `db`. "ABC Co" is the same company everywhere.
5. Re-open every state of the screen afterwards.

### 3C · Prototype
1. Put it in `apps/product/src/screens/prototypes/<name>/`, with its own `index.ts` exporting `screens`, and register it in `registry.ts` after the real pages. Routes go under `/prototypes/<name>/…`. Existing examples to copy: `company-overview-v2`, `company-valuations-v2`, `reports`.
2. **Compose from real screens.** Import existing screens and pieces, `PageTemplate`, the shell and the fixtures. A prototype that redraws the Cap Table will drift on day one.
3. Make it clickable end to end with `href(...)`/`navigate(...)`. Use one screen with states, or several screens if the URL changes.
4. Mark it with `figmaPage: 'Prototype · <name>'` and give its states `figmaNode: 'proto:<name>:<n>'`. The coverage check accepts that prefix and lists prototypes separately. Once accepted, promote it via 3A with real frame ids.

### 3D · Standalone screen (outside the product app)
1. Put it in `examples/screens/<Name>.tsx`, with an `examples/<name>-entry.tsx` and an `.html` like the existing ones, and build with `npm run build && npm run build:examples`.
2. Start from **`examples/screens/PageTemplate.tsx`** (the design-system `PageTemplate` with its slots filled). Put your content in its `children`.
3. Pick an archetype from [references/screen-recipes.md](references/screen-recipes.md) (`data-sheet` · `spreadsheet` · `dashboard` · `detail` · `form` · `list-search` · `workboard` · `empty-or-error`). Say which one and why, then compose it from the listed components, using their stories.
4. If the screen belongs in the product at all, use 3A/3C instead. Standalone is for screens that intentionally live outside it.

**Composition limits for every mode:**
- Colour from `color.*`, gaps and padding from `space.*`, widths and heights from `size.*` (never crossed, R2), type from `Typography` or `type.style()`.
- Icons from Material Symbols (`<Icon><icons.Name /></Icon>`). For a missing one, add it to `material-icons.json`, run `npm run gen:icons`, and rebuild.
- Layout ratios (`fr`, `%`, `flex`) and 1px borders are fine.
- Companies, users and funds come from `db`/`fixtures.ts`, never hard-coded lists.
- Use realistic finance copy, never lorem ipsum.
- Chart.js configs take values from `useChartTokens`, never `var(--…)`.
- A deal's card is `DealCard tone="deal"` (or `color.deal.*`). Never `bg.positive`, because a deal is not a status, and never white text on the Deal fill, which is 2.25:1.
- **AI is working on an item** → `AiOutline` (2px `color.gradient.ai.*` outline that orbits every 6s while `active`), plus words or a `Spinner`. Never a hand-made gradient border, and never PRISM tokens for it (R11). See [references/notifications-and-ai-motion.md](references/notifications-and-ai-motion.md).
- **Motion** uses `motion.*` durations and easings as transitions (which `base.css` reduced motion covers). A looping animation is a DS keyframe with its own `prefers-reduced-motion` stop, never screen code. Verify motion in the browser (computed styles over time or `el.getAnimations()`).
- **Notifications:** the bell is `Notification` (dot only, no count) and the panel is `NotificationCenter`. The filters-above-the-list panel and the notification card are the *proposed* pattern from the Notifications Center prototype. Compose them as it does, and swap a global menu in a prototype with `GlobalMenuOverridesContext`, never by forking `AppFrame`.

## Step 4: Verify. Don't claim it works until you've looked.

```bash
npm run build            # only if src/ changed
npm run verify:product   # compile app + domain tests + token lint + no-pagination lint + product-logic lint + every-frame coverage check
npm run verify           # if src/ changed: typecheck · token lint · contrast lint · ESLint · tests
```
If you added or changed a story or a component: also run `npm run test:stories` and `npm run check:reflow`. **CI runs both and local `npm run verify` does not.** The story suite runs axe in a real browser. It catches what jsdom can't, such as visible text missing from an `aria-label` name (WCAG 2.5.3) and contrast on nested surfaces. A `Button` inside a dark or filled card needs that card's ink.

**Reuse contract:** `git diff --stat` shows **no new file under `src/components/` or `src/styles/`** unless a rung-7 request was approved, and no `style={{…}}` value that isn't a token.

**Render:** `node scripts/serve.mjs` → `http://localhost:4178/apps/product/index.html#<route>?state=<key>` (for standalone screens, the example's html). Check, in order:
1. no console errors
2. every state of the touched screen
3. links in and out navigate
4. **scroll the body to the bottom: all three nav tiers stay at the top and the document itself doesn't scroll** (`document.scrollingElement.scrollHeight === innerHeight`)
5. **light mode, even with the OS in dark** (emulate dark and confirm the page stays light, R14)
6. each component looks like its story for the same props; **no table shows pagination** (R15); **every table head is `ColumnHeader`** (R16)
7. focus is visible
8. nothing under 12px
9. charts with 3+ series have direct labels
10. at 1440px wide

Report what you checked. If you couldn't render, say so. Hidden browser panes can't take screenshots; use headless Chrome instead: `--headless=new --screenshot --window-size=1440,900`.

## Step 5: Docs and Figma

- Update `docs/product/pages/<page>.md` (purpose, how users get here, states, components, rules, **Gaps**). Run `npm run product:catalog` to regenerate the catalog.
- A new or changed DS component also updates `AI-GUIDE.md` (§5 intent row and §7 API), `docs/components.md` (with its Figma node), `CHANGELOG.md`, and its story. For a family with several parts, add an MDX spec page in `docs/storybook/` (see *Valuation Modal spec*). Pipe tables render because `remark-gfm` is wired into addon-docs.
- **A new token** follows Prism-v1 `ONBOARDING.md` › *Adding a new token*. Create the semantic variable in the tokens file (`anrnTIJKgu27zV224h7vON`, *Semantic: Color*) with the file's conventions: `Group/Name`, Light and Dark aliases to primitives, explicit scopes, `WEB` code syntax `var(--color-…)`, and a description. Give every fill an AA ink. Ask before writing to the shared library. **The user publishes it.** Then transcribe it into `tokens.css`, `index.ts`, `gen-docs.mjs` and `lint-contrast.mjs`, and regenerate. The Deal family (gap 14) is the worked example.
- Push to Figma (code → design) only after the screen renders correctly. Load `figma-generate-design` + `figma-use` and follow [references/figma-push.md](references/figma-push.md):
  - Start from the **Page Template · Body Slot** component.
  - **Assemble from published library instances; never redraw as rectangles.**
  - Bind variables, and don't push charts.
  - Ask before writing to a shared file, and name the file and page.
  - Estimate Figma MCP calls first (there's a seat cap) and batch them.
- To read Figma to ground a design, see screen-logic.md §4 (order of trust, which MCP tools to use, token mapping by name).

---

## Refuse to

- Build on a stale checkout without saying so, or against anything but `main` unless the user named the branch.
- Hand-roll a component, colour, spacing or type size the layer already has, or add a component, layout or token because it "looks better".
- Use a component in a way its story and AI-GUIDE §7 don't show (props it doesn't have, wrappers that restyle it).
- Invent behaviour the page docs or DS patterns already define (validation, empty state, confirmation).
- Write a valuation formula (Waterfall, OPM, DCF, note conversion, IRR, multiples) into a screen or a DS component, or treat a `VERIFY` item in `domain-logic.md` as decided. Ask for the finance sign-off instead.
- Show a value that doesn't exist yet as `$0`, or treat a draft valuation as published.
- Paginate a table: no `Pagination` under a `DataGrid` / `Table`, no rows split into pages (R15).
- Head a table with anything but `ColumnHeader`: no `GridColumnHeader` / `AddColumnHeader` in a screen, even to match a Figma frame (R16). Use `AddColumn` for the trailing add-column header.
- Use a token name that isn't in `AI-GUIDE.md` / `docs/tokens.md`, or copy colours and sizes from a mockup instead of the contract.
- Build a page outside `PageTemplate` (or `CompanyLayout` on a legacy screen), hand-assemble the nav chrome, or add a fourth navigation tier.
- Fork or re-skin `Table` for one product. There is one table; differences come from `columns`, `rows` and `cells`.
- Leave a new page unreachable or break a route. The catalog check catches dropped frames, not dead links, so you must check those.
- Colour a Global Search result by anything but its PRISM type, or use PRISM (or a Workflow tone, or the Deal tokens) for access, permission or status.
- Hand-build the Workboard Valuation modal or its parts (assignee cards, figure tiles, step assignment, notes). Compose `ValuationModal` from its components and their stories.
- Hand-build an animated or gradient "AI" border, paint it with PRISM tokens, or animate with raw durations. Use `AiOutline` and `motion.*`.
- Put a number on the notification bell, or add `tone="ai"` to `Toast` without the rung-7 protocol (the prototype tints it through `--toast-bg` / `--toast-ink`).
- Use `text.primary` on a filled surface or white text on `bg.warning`. Ship a chart without a legend, or a canvas chart without its data table.
- Ship dark mode on a page (R14).
- Silently "fix" something in `docs/known-gaps.md`.
