# Screen archetypes

Eight shapes cover nearly every Scalar screen. Pick one, then compose its body
from the listed components. **Open each component's story first** (see
`storybook.md`) and copy its props from there. Each entry ends with the traps
specific to that shape.

Every archetype lives inside `PageTemplate` (see [Composing the chrome](#composing-the-chrome)).
The archetype is only what goes in the **body slot**.

---

## `data-sheet`: a dense, read-only grid of figures

The core Scalar screen: an income statement, a cap table summary, a waterfall.

**Chrome:** company page (Tier 1 → Company info + Secondary Menu → Tertiary Menu with view tabs and tools)
**Body:** `DataGrid` with `ColumnHeader`s in `head`, then `Row` → `RowHeader` + `Cell`s
**Furniture:** `Footnote`, `ModalStatus`, `ValuationStatus`, `Ledger` — pagination is built into the grid (R15)
**Stories:** *Data/Table/DataGrid*, *Cell*, *RowHeader*, *ColumnHeader*, *Data/GridPatterns*

```tsx
<DataGrid
  label="Income statement"
  head={<>
    <ColumnHeader grow={2}>Line item</ColumnHeader>
    <ColumnHeader numeric>FY2025</ColumnHeader>
  </>}
>
  <Row><RowHeader>Revenue</RowHeader><Cell numeric type="data">4,980,000</Cell></Row>
  <Row zebra><RowHeader>Operating expenses</RowHeader><Cell numeric type="input">1,050,000</Cell></Row>
  <Row type="total"><RowHeader type="total">EBITDA</RowHeader><Cell numeric state="total">2,020,000</Cell></Row>
</DataGrid>
```

**Traps**

- **Every row starts with a `RowHeader`**, which is its name. A row that navigates
  passes `href` to the `RowHeader`. Never put a `Link` in a `Cell`.
- `Cell type` states *where the number came from*: `readable` for a plain
  figure, `input` for something editable (blue), `data` for a sourced value
  (green). Getting this wrong misreports provenance, which matters in a
  valuation product.
- Every money column takes `numeric`. It right-aligns and applies tabular
  figures; without it, digits jitter between rows.
- **The grid paginates itself and the bar is always shown (R15).** Pass every
  row; don't slice, don't add a `Pagination`, don't hide the bar. Rows from a
  server or `db` page: `pagination={{ totalRows, page, onPageChange }}`.
- `DataGrid` sizes columns from the header cells. Put widths on the
  **header only** (`grow` or a `size.*` `width`), never in per-cell width styles.
- Pick one cell model per grid: `Cell`, or the grid-pattern cells
  (`RowLabelCell` / `GridValueCell`). Don't mix them (known gap 8).
- Grid furniture is the one place `Button size="s"` and the 24px dense target
  are allowed. Never carry that exception into the rest of the page.

---

## `spreadsheet`: select, resize, edit, see formulas

A working sheet rather than a report: range selection, column resizing, a formula view, in-place editing.

**Body:** `Table` (`tableId`, `title`, `columns`, `rows`, `cells`, `footnotes`, `selection`)
**Stories:** *Data/Table/Table* (+ the *Prism Table spec* MDX page)

**Traps**

- **There is one table.** Differences between products come from `columns`,
  `rows` and `cells`, never from a variant, a fork or restyling.
- `cell.kind` (`readable` / `editable` / `sourced` / `total` / `draft`) sets the
  text colour only. The fill comes from selection and hover; never store it per cell.
- Selection is one rectangle drawn as one overlay. Don't hand-place cell borders.
- Rows are 26px and headers 40px; never auto-size them. Column widths persist
  per `tableId`. Pass `columnWidths` / `onColumnResize` only to control them.

---

## `dashboard`: an overview of many things

**Chrome:** firm page (Tier 1, optional Tier 2 title and filters)
**Body:** a grid of `Card` + `CardItem`, plus charts
**Furniture:** `Chip`, `Badge`, `Alert`, `DataFreshness`
**Stories:** *Core/Card*, *Charts/**

**Traps**

- A `Card` is a surface, not a button. If the whole card navigates, it still
  needs a named action inside it.
- `CardItem` trend direction never rests on colour alone. The arrow and the
  sign carry it.
- Charts: a legend is mandatory at 2+ series and direct labels at 3+. Every
  chart has a `title`, and the shipped charts build the hidden data table.
  Chart.js gets values from `useChartTokens`, never `var(--…)`.
- Resist filling the page. A dashboard that shows everything ranks nothing.

---

## `detail`: one object, in depth

A single valuation, company or document.

**Chrome:** company page; Tier 3 views for peer views of the object
**Body:** `KeyValueRow`s, `Accordion` for secondary detail, `Card` for a summary, `Breadcrumb` when the object sits deep in a hierarchy
**Edit:** `Drawer` (the page stays visible) or `Modal` (needs full attention)
**Stories:** *Admin/Admin* (Key Value), *Overlays/Accordion*, *Overlays/Modal*

**Traps**

- Peer views of one thing go in the Tertiary Menu or `Tabs`. Steps in a process
  use `Stepper`; a table's rows page through the table's own bar (R15);
  `Pagination` is only for paged content that is not a table.
- The last `Breadcrumb` item is where the user already is, so it's not a link.
- Never hide anything required to finish the task inside a collapsed
  `AccordionItem`.

---

## `form`: ask for input

**Body:** `FormField` wrapping `Input` / `Select` / `Textarea`, or
`FloatingLabelInput` / `FloatingLabelSelect` / `NumberField` for page and modal
forms; `Checkbox`, `Radio`, `Switch`, `DatePicker`, `SettingRow`
**Actions:** a `Button` pair, with the primary action last in the DOM
**Stories:** *Forms/Input*, *Forms/Controls*, *Forms/Patterns*, *Overlays/ConfirmationDialog* (SettingRow)

**Traps**

- Always use `FormField` (or a floating-label field), never a bare `Input`. The
  label is permanent: a placeholder standing in for one disappears exactly when
  it's needed.
- Error text says what is wrong **and how to fix it**. "Invalid" is not a
  message.
- Use `Switch` / `SettingRow` only when the change applies immediately. If it
  needs Save, it's a `Checkbox`.
- Above ~7 options use `Select`; below that, `Radio` shows every choice at
  once. If the list can exceed ~8 items, use `ComboboxPanel`.
- A far-off date is typed, not clicked to, so pair `DatePicker` with a text field.

---

## `list-search`: find something among many

**Body:** `SearchBar` or `ModalSearch`, `FilterDropdown` / `FilterBar`, `Chip` for
active filters, `DataGrid` (its built-in pagination bar, R15 — reset `page` to 1 when filters change) or a row list (`FileRow`)
**Global:** `GlobalSearch` for the cross-entity command palette
**Stories:** *Navigation/GlobalSearch*, *Header/Controls*, *Navigation/Tabs* (Pagination), *Files/Files*

**Traps**

- `GlobalSearch` is not a page filter. It crosses firms, companies, documents
  and versions; a filter narrows one list.
- In `GlobalSearch`, scope is a **stack**: Tab pushes, Backspace pops. Never
  show more than three chips.
- Result rows are coloured by **PRISM type only**, and the badge must match the
  tint. A row tinted Company carrying a Document badge states something false.
- `FilterDropdown` shows the value in force, not the filter's name.
- Empty results are an `EmptyState type="no-results"` that offers a way out.

---

## `workboard`: work items, their steps and dates

Engagements moving through workflow steps, on a list, a calendar or a timeline.

**Body:** a `DataGrid` of items with an `ActionPill` (+ `StepMenu`) and a
`DueDatePill` per row; `DealCard` for the deal behind an item; `WorkCalendar`
(with `CalendarTaskCard` as `renderEvent`) or `WorkTimeline` under a `PeriodToolbar`;
`ColorPicker` for a firm's own status colours. One item opened in full is a
**`ValuationModal`**: a `ValuationSummary` on top (tags, `StatusTrigger`, company,
folder and onboarding, five `AssigneeCard`s, `FigureList`, `DealCard tone="deal"`)
and three `ValuationPanel`s (Valued Entity · Model with `StepAssignMenu inline` · Notes
with `NoteCard` + `NoteComposer`).
**Stories:** *Workboard/Action Pill*, *Calendar*, *Timeline*, *Deal Card*, *Color Picker*,
*Step Assign Menu*, *Valuation Modal* (7 states), *Valuation Modal spec* (MDX)

**Traps**

- A `WorkflowTone` (`blue` / `pink` / `cyan` / `orange` …) **identifies the step**.
  It is never status, never permission, and never built from a `--primitive-*`
  step (known gap 13).
- Urgency comes from `dueUrgency(iso)`, not from picking a colour. Today and
  Overdue carry hidden words (R8).
- `ActionPill` clicks never bubble to the row. Use `s` in a grid and `m` in a modal header.
- Use `ActionTag` for a step that can't be acted on (calendar cards, timelines).
- `WorkCalendar` without `onShowMore` renders "+N more" as text, so pass it
  whenever a day can overflow.
- `StepMenu` ≠ `StepAssignMenu`. `StepMenu` is the `ActionPill` caret menu in a
  grid row (steps, tools, actions, no people). `StepAssignMenu` puts people on
  steps: each step ends in `AssigneeAvatars` or an assign button that opens a
  picker. `StatusTrigger` is a trigger only, so the screen owns open state and
  dismissal.
- The Deal card is `DealCard tone="deal"`, coloured by the Deal tokens
  (`color.deal.*`, gap 14). Its ink is Deal/Text, never white (2.25:1 on the fill),
  and never `bg.positive`.
- `ValuationModal` has no header, so it needs `aria-label`. It is `Modal size="2xl"`
  (1308px); don't widen it by hand.
- At the 12px floor, long role names ("Engagement Manager") truncate in a
  narrow `AssigneeCard`, with a tooltip. Don't shrink the type to fit.

---

## `empty-or-error`: nothing to show, or something broke

**Body:** `EmptyState`, `Alert`, `Banner`, `Skeleton`, `Spinner`
**Stories:** *Core/Primitives* (Empty …), *Feedback/Alert*, *Feedback/Banner*

**Traps**

- `no-data` is the first-run state and offers the action that fills it.
  `no-results` follows a search and offers the way out. `error` explains what
  failed and offers a retry.
- Write guidance, not apology. "Something went wrong" is not an error state.
- `Skeleton` must match the layout it replaces, or the page jumps when real
  content lands. Under 300ms, show nothing at all.
- An inline, persistent message is an `Alert`; a page-wide one is a `Banner`;
  a transient, floating one is a `Toast`. If the user must act, it's an `Alert`.
- The chrome around an empty or error body doesn't change.

---

## Composing the chrome

Every screen starts from `PageTemplate`. Never assemble `PrimaryMenu`,
`CompanyInfo` and `WorkspaceDrawer` yourself. Read `docs/page-template.md` §6
and the navigation spec's screen matrix (`docs/navigation-3-tier-system.md` §7).

**In `apps/product`**, use the product wrapper, which wires Tier 1's global menus,
the company header, the Secondary Menu and the dock:

```tsx
import { PageTemplate } from '../../shell/PageTemplate.js';
import { ToolbarCurrency, ToolbarSave } from '../../shell/Toolbar.js';

<PageTemplate
  area="company" company={company} section="valuations"
  subNav={<>…TertiaryMenuItems…</>} subNavEnd={<><ToolbarCurrency /><ToolbarSave /></>}
>
  {/* archetype body: the BODY-SLOT */}
</PageTemplate>
```

**Standalone (`examples/screens`)**: copy `examples/screens/PageTemplate.tsx`,
keep its five slots and replace the `children`:

```tsx
<ScalarProvider mode="light" viewport="auto">   {/* always light (R14) */}
  <PageTemplate
    navigation={<PrimaryMenu end={…}>…MainMenuItems… <Selector label="Measurement Date" value="01/17/2024" /></PrimaryMenu>}
    companyInfo={<CompanyInfo name="Apple Inc." status={<Badge>Draft</Badge>}><SecondaryMenu>…</SecondaryMenu></CompanyInfo>}
    subNavigation={<TertiaryMenu onAdd={…} end={…}>…TertiaryMenuItems…</TertiaryMenu>}
    drawer={<WorkspaceDrawer docked tabs={…} />}
  >
    {/* archetype body */}
  </PageTemplate>
</ScalarProvider>
```

- Three navigation tiers is the limit. A fourth level belongs in the body.
- To hide a tier, omit its prop. Never render an empty bar.
- No outer padding, `max-width` or scroll wrapper in the body: the slot is
  already inset 16px and scrolls on its own.
- A finished screen never ships the `BodySlot` placeholder.
