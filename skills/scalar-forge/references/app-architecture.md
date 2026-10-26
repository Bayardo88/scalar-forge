# apps/product — architecture

A dependency-free React app (React 18 + `@scalar/design-system`, compiled with
`tsc`, loaded through an import map — no bundler). It is a **prototype of the
whole product**, not production code: data is fixtures, saves are local state.

```
apps/product/
  index.html                 import map + stylesheet; loads build/main.js
  figma-frames.json          manifest of every Figma frame (the coverage contract)
  src/
    main.tsx  App.tsx        hash router → screen from the registry
    router.tsx               useLocation · href(path, state?) · navigate · match · fill
    routes.ts                EVERY route in the product (single source of the IA)
    types.ts                 ScreenDef · ScreenState · ScreenProps
    registry.ts              concatenates screens/*/index.ts in Figma page order
    Catalog.tsx              #/catalog — every screen & state, linked
    data/db.ts               the company database: db.companies.{all,byId,search,where,page}, db.funds
    data/companies.db.ts     GENERATED from db/companies.json by db/seed.mjs (200 companies) — never edit
    data/fixtures.ts         firm, firms, user, companies/companyById (from db), formatters
    shell/
      PageTemplate.tsx       START HERE for every new screen — wires the chrome into the DS PageTemplate slots
      AppFrame.tsx           ScalarProvider (light) + navy Primary Menu (Tier 1) + body; `openMenu`, `overlay`
      CompanyLayout.tsx      legacy company wrapper (header + Secondary + Tertiary + dock); existing screens only
      PageHeader.tsx         firm-level title + section tabs + actions
      Toolbar.tsx            Tier 3 right-hand tools: ToolbarAi · ToolbarCurrency · ToolbarTableTools · ToolbarKebab · ToolbarSave
      WorkspaceDock.tsx      Notes / Sheets / Documents dock → WorkspaceDrawer
      overlays/              global menus: companies, date, search, notifications, user
    screens/
      p01-home/ … p16-firm-settings/   one folder per Figma page (37 screens, 103 frames)
        index.ts             `export const screens: ScreenDef[]`
        <Screen>.tsx         `({ state, params }: ScreenProps) => JSX`
        data.ts              area-specific demo data (optional)
      prototypes/            company-overview-v2 · company-valuations-v2 · reports · notifications-center (`proto:` frame ids)
```

## The model: screen × state

- A **screen** is one route and one component (`ScreenDef`).
- A **state** is one Figma frame of that screen — default view, a menu open, a
  modal, a validation error, a scroll position. `?state=<key>` selects it; the
  first state is the default.
- `#/figma/<node-id>` resolves a Figma frame to its screen + state and redirects.
- `App` remounts the screen when the state changes (`key`), so a screen can
  initialise local UI state from `state` and stay fully interactive:

```tsx
export function IncomeStatement({ state, params }: ScreenProps) {
  const company = companyById(params.companyId);
  const [versionOpen, setVersionOpen] = useState(state === 'version-menu');
  …
}
```

## Chrome — `PageTemplate`, never re-drawn

**New screens use `PageTemplate`** (`shell/PageTemplate.js`); your content is its
`children`, the body slot. It renders the three navigation tiers of
`docs/navigation-3-tier-system.md` from props — Tier 1 Primary Menu (`area`),
Tier 2 company header + Secondary Menu (`company`, `section`, `headerEnd`),
Tier 3 Tertiary Menu (`subNav`, `subNavEnd`, `subNavAdd`) — and the docked
Workspace drawer (`dock`, `dockOpen`, `dockContent`, `dockPanels`). Omit a prop and
its tier isn't drawn; never render an empty bar, never add a fourth tier.

| Page kind | Wrap in | Example |
|---|---|---|
| Firm-level product area | `PageTemplate area="valuations"` (no `company`) | Valuations, Waterfalls, Documents, Intelligence, Reports |
| Company page | `PageTemplate area="company" company section subNav subNavEnd headerEnd` | Financials, Cap Table, Company Valuations |
| Settings / admin | `PageTemplate area="settings" dock={false}` (+ `PageHeader title tabs current actions` in the body) | Firm Settings, User Management, Account |

`area` is `home · intelligence · valuations · waterfalls · documents · reports · company · settings`;
`section` is `summary · financials · cap-table · valuations · waterfall · documents · overview`.
Tier 3 tools come from `shell/Toolbar.tsx` in the nav file's order (AI · currency ·
fit/filter · ⋮ · primary action). Existing screens on `AppFrame` + `CompanyLayout`
keep working; don't migrate them unless asked.

- `AppFrame.openMenu` opens a global menu (`'companies' | 'companies-add' | 'date' |
  'search' | 'notifications' | 'notification-settings' | 'user' | 'user-firm-settings'`).
  The menus are also live on click on every screen.
- `GlobalMenuOverridesContext` (from `shell/AppFrame.tsx`) lets a **prototype** swap a global menu's surface,
  drive the bell's unread dot and know which menu is open while composing a real screen unchanged
  (`prototypes/notifications-center`). Product screens never provide it.
- `AppFrame.overlay` (and `CompanyLayout.overlay`) draws a screen-level modal,
  drawer or popover above the body.
- `CompanyLayout.dockOpen="notes"` opens the Workspace Drawer on a tab.

## Routes

All in `routes.ts`. Firm routes are strings (`routes.valuations`); company
routes are functions (`routes.company.capTable('abc-co')`). In a `ScreenDef`,
use the pattern: `route: companyPattern(routes.company.capTable)` →
`/companies/:companyId/cap-table/securities`. Link with `href(route, state?)`.

## Rules that are easy to miss

- Only `@scalar/design-system` components and tokens. `npm run lint:tokens`
  scans `apps/product/src` and fails on raw hex, raw px in spacing/sizing, and
  hand-set font sizes. Layout ratios (`fr`, `%`, `flex`) and 1px borders are fine.
- Icons are **Google Material Symbols**: `import { icons, Icon }` →
  `<Icon><icons.AttachMoney /></Icon>` (PascalCase of the Material name). Missing
  one? Add its name to `src/components/icon/material-icons.json`, run
  `npm run gen:icons` then `npm run build`. Don't use `glyphs.*` in screens.
- Companies come from `db` — never hard-code a company list. Pickers use
  `db.companies.search`.
- **Every table paginates (R15) — built in, never optional.** `DataGrid` and
  `Table` render their own pagination bar (25 a page, Rows per page
  10 · 25 · 50 · 100) under every table, even when it has one page. Client data:
  pass every row; the grid slices it (trailing `Row type="total"` rows stay
  under every page; `Table` keeps a group with its children and total).
  Server / `db` paging: `pagination={{ totalRows: total, page, onPageChange:
  setPage, rowsPerPage, onRowsPerPageChange: setRowsPerPage }}` and only that
  page's rows. Never place `Pagination` under a table and never hide the bar;
  `npm run lint:tables` fails on either. A wrapper around `DataGrid` (like
  `PortfolioGrid`) forwards `pagination`. `ShowMoreRow` reveals more *sections*
  (e.g. more companies' grids), never more rows of one table. Re-seed with `npm run product:seed` (deterministic).
- **One table.** A spreadsheet-like grid (selection, column resize, formula view,
  editing) is `Table` — configured by `columns` / `rows` / `cells`, never forked or
  re-skinned per product (see the *Prism Table spec* in Storybook). A read-only
  figure grid is `DataGrid`.
- **Every `DataGrid` row starts with a `RowHeader`** (its name cell). A row that
  links passes `href` to the `RowHeader` — never a `Link` inside a `Cell`.
- `DataGrid` sizes columns from the header cells: each column is at least its
  header label on one line, leftover width shared by `grow` (or fixed `width`);
  rows are subgrids so cells fill the column. Put grid-pattern cells
  (`RowLabelCell`, `GridValueCell`, `InCellControl`) straight into `Row`; use
  `groupHead` for `ColumnGroupHeader`s. No per-cell width styles.
- A menu/popover inside a sideways-scrolling grid gets clipped — anchor it
  outside the grid (see `p07-company-cap-table/Anchor.tsx`).
- Grid cells: `numeric` on every number; `type="input"` = user-entered (blue),
  `type="data"` = sourced/calculated (green); totals `Row type="total"`.
  Column headers stay on one line.
- Charts remount on data change (`key=`) — ChartCanvas only redraws on theme change.
  Chart.js options take resolved values from `useChartTokens`, never `var(--…)`.
- Shared names/figures come from `data/fixtures.ts` so screens agree.

## Verification commands

```bash
npm run build             # package → dist (only when src/ changed)
npm run build:product     # app → apps/product/build
npm run lint:tokens       # token contract, incl. apps/product/src
npm run product:catalog   # coverage check + regenerate docs/product/screen-catalog.md & screens.json
npm run verify:product    # all three app checks
npm run verify            # when src/ changed: typecheck · tokens · contrast · ESLint · tests
npm run storybook         # http://localhost:6006 — stories from this checkout
node scripts/serve.mjs    # http://localhost:4178/apps/product/index.html#/catalog
```
