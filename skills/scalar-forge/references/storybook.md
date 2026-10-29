# Storybook — how every component is meant to be used

**Live:** https://scalar-ds-storybook.netlify.app. It's deployed from
Prism-v1 `main` (`npm run build:storybook`, then a Netlify deploy). The site is
not git-linked, so it can lag `main`; when in doubt, read the local
`*.stories.tsx` (the reuse check falls back to them).

A story is a **working, accessibility-tested usage** of a component, with
realistic props and the state wiring the component expects. Before you use a
component in a screen, open its story. Copy the props and composition from the
story **source**, not from memory and not from an older screen.

Order of trust for *how to use a component*:
**`AI-GUIDE.md` §7 (API + rules) > story source > `docs/components.md` > an existing screen.**
Treat a story as an example of the contract, not the contract itself. If a story
seems to break AI-GUIDE, AI-GUIDE wins, so note the conflict in your reply.

## Finding a story

1. `node <skill-dir>/scripts/reuse-check.mjs <keywords>` lists matching stories, their docs URLs and source files. It reads the live `index.json` and falls back to the local `*.stories.tsx` when offline.
2. The whole index is at `https://scalar-ds-storybook.netlify.app/index.json`, one entry per story with `id`, `title`, `name` and `importPath`. `curl -s …/index.json | jq '.entries[] | select(.type=="story") | .id'`.
3. The source is `src/components/<family>/<Name>.stories.tsx` (the `importPath`). Read it in the Prism-v1 checkout you build against (Step 0 makes sure that is `main`).

## URL patterns

| Want | URL |
|---|---|
| A component's docs page (props table, every story) | `…/?path=/docs/<title-id>--docs` (e.g. `core-pagetemplate--docs`) |
| One story in the manager UI | `…/?path=/story/<story-id>` (e.g. `workboard-deal-card--default`) |
| One story, bare, for a screenshot or side-by-side compare | `…/iframe.html?id=<story-id>&viewMode=story` |
| Locally (unreleased changes on a branch) | `npm run storybook` → http://localhost:6006 |

The `<title-id>` is the story `title` lower-cased, with every run of non-alphanumerics
turned into `-`. For example, `Data/Table/Cell` becomes `data-table-cell`. The
`<story-id>` is `<title-id>--<export name in kebab case>`.

Stories render inside `ScalarProvider mode="light"` (R14), with the a11y addon in
`error` mode. A story that renders clean is the reference look for that component
in light mode.

## What's in it (50 groups, 454 stories, plus MDX spec pages)

| Group (title) | Components it shows | Source |
|---|---|---|
| Core/Primitives · Core/Typography · Core/Icon | `Divider`, `Link`, `Tooltip`, `Scrim`, `EmptyState`, `Typography` + shorthands, `Icon` + `icons.*` | `core/`, `typography/`, `icon/` |
| Core/PageTemplate | `PageTemplate`, `BodySlot`: empty, with chrome, with drawer, placeholder | `template/` |
| Core/Button · ButtonIcon · AIButton · Avatar · Chip · Card | actions, `Avatar`, `Chip`, `Card` + `CardItem` | `button/`, `avatar/`, `chip/`, `card/` |
| Header/Chrome · Header/Menus · Header/Controls · Header/ValuationInfo | `PrimaryMenu`, `CompanyInfo`, `SecondaryMenu`, `TertiaryMenu`, `MenuPanel`, `Selector`, `ToolSwitch`, `AITool`, `InformationLabel`, `ValuationInfo`, `CurrencySelector` (currency list + Hundreds → Thousands → Millions cycle) | `header/` |
| Navigation/Tabs · Navigation/GlobalSearch | `Tabs`, `Breadcrumb`, `Pagination` (never on a table, R15), `Stepper`, `GlobalSearch` + result rows | `navigation/`, `search/` |
| Forms/Input · Checkbox · Controls · Patterns | `FormField`, `Input`, `Textarea`, `Select`, `Checkbox`, `Radio`, `Switch`, `DatePicker`, `FloatingLabel*`, `NumberField`, `TagInput`, `ComboboxPanel`, `SelectMenu`, `Dropzone`, `ImageCropField`… | `input/`, `checkbox/`, `form-controls/`, `form-patterns/` |
| Menus/Actions · Menus/ContextMenu | `SplitButton` (Button's variant × tone × size), `Fab`, `SpeedDial`, `SegmentedControl` (`variant="outline"`, `count`, `fullWidth`), `ViewTabBar`, `ContextMenu`, `MenuItem` | `actions-menus/` |
| Data/Table/Table + *Prism Table spec* (MDX) | `Table`, the one spreadsheet-like platform table: selection, resize, formula mode, editing | `table/Table.stories.tsx`, `docs/storybook/prism-table.mdx` |
| Data/Table/DataGrid (incl. *Bounded Height* for long grids) · Cell · ColumnHeader · RowHeader · Footnote · Status | `DataGrid` (never paginated, R15), `Row`, `RowHeader`, `Cell`, `ColumnHeader` (the one table header, R16), `Footnote`, `ModalStatus`, `ValuationStatus` | `table/` |
| Data/GridPatterns | `RowLabelCell`, `GridValueCell`, `InCellControl`, `ColumnGroupHeader`, `TaskPill`, `CellHistoryPopover`… (`GridColumnHeader` / `AddColumnHeader` are library-only: tables use `ColumnHeader`, R16) | `grid-patterns/` |
| Charts/* | `BarChart`, `LineChart`, `DonutChart`, `WaterfallChart`, `ChartCanvas`, `ChartLegend` | `charts/` |
| Feedback/Alert · Feedback/Banner | `Alert`, `Toast` (incl. *Toast (dismissible)*: × takes the toast ink), `ProgressBar`, `Skeleton`, `Banner`, `Spinner`, `ProgressRing`, `DataFreshness`, `SaveState`, **`AiOutline`** (the AI working outline, with a browser motion check) | `feedback/`, `feedback-patterns/` |
| Overlays/Modal · Accordion · ConfirmationDialog | `Modal` (+ column picker; `size` up to `2xl`, 1308px), `Accordion`, `Drawer`, `WorkspaceDrawer`, `DataReviewCard`, `ConfirmationDialog`, `SettingRow`, `NotificationCenter`, `RowActionToolbar` | `modals/`, `disclosure/`, `overlays/` |
| Files/Files | `FileRow`, `FileTypeBadge`, `TreeItem`, `PageStepper`, `ZoomControl`, `DocumentViewerHeader` | `files/` |
| Admin/Admin | `KeyValueRow`, `VersionHistoryItem`, `PermissionMatrixRow`, `RoleSelector`, `ProfileHeader`, `FilterBar`, `DirectoryGroup`, `ProductTile`, `FirmSwitcherTile`, `PageTaskHeader`, `CodeGrid`, `RichTextToolbar`, `AppFooter` | `admin/` |
| Workboard/* | `ActionPill`, `ActionTag`, `DueDatePill`, `StepMenu`, `DealCard` (incl. *Deal tone*), `ColorPicker`, `WorkCalendar` + `CalendarTaskCard` + `PeriodToolbar`, `WorkTimeline`; **Step Assign Menu** (`StepAssignMenu`, `StatusTrigger`, 8 dropdown states); **Valuation Modal** (`ValuationModal`, `ValuationSummary`, `ValuationPanel`, `FigureList`, `AssigneeCard`, `AssigneeAvatars`, `NoteCard`, `NoteComposer`; 7 Figma states) | `workboard/` |
| Spec pages (MDX) | *Data/Table/Prism Table spec* (`data-table-prism-table-spec--docs`), *Workboard/Valuation Modal spec* (`workboard-valuation-modal-spec--docs`), *Feedback/AiOutline spec* (`feedback-aioutline-spec--docs`): anatomy, states, tokens and the deliberate Figma differences | `docs/storybook/*.mdx` |

The table above is a map, not the list. The live `index.json` is the list, so check it
when a component isn't here.

## Using stories while you build

- **Compose:** take the story's JSX (props, children, the `useState` wiring for open/selected) into the screen. Replace its demo data with `db` / `fixtures.ts` data.
- **Check the look:** if your screen looks different from the story for the same props, your screen is wrong. Look for a stray wrapper style, a missing provider, or crossed `space`/`size` tokens.
- **Missing state:** if the story has no example of the state you need (e.g. an error variant), check the AI-GUIDE §7 props first. A prop that exists is fine to use. A state that no prop can express is a rung-7 conversation (reuse-ladder.md).
- **New or changed component (rung 7, approved):** it needs a story next to it (`<Name>.stories.tsx`, `tags: ['autodocs']`), plus a test (axe + keyboard + ref/className passthrough) per `docs/component-contract.md`. `npm run test:stories` runs every story under the a11y addon **in a real browser**. CI runs it, so run it locally before pushing; jsdom tests don't catch label/visible-text mismatches or nested-surface contrast. A family of parts gets an MDX spec page too. The new story shows up on the live Storybook once the PR merges, and in the PR's Netlify deploy preview before that.
