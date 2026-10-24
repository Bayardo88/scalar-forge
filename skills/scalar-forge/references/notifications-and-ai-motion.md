# Notifications and AI motion

Read this before building anything that **notifies** the user (the bell, a panel, a toast) or shows that
**AI is working** on something. It covers the components, the logic the Notifications Center prototype
settled on, and the one sanctioned AI animation. Source of truth: Prism-v1 `docs/ai-outline.md`,
`docs/product/pages/prototype-notifications-center.md`, and the prototype at
`#/prototypes/notifications-center/abc-co` (`apps/product/src/screens/prototypes/notifications-center/`).

> Landed in Prism-v1 PR #20 (`proto/notifications-center`). If `main` does not have `AiOutline` yet, the
> PR is not merged: say so and build against the branch only if the user asks (SKILL.md Step 0).

## 1. Pick the component

| Intent | Use | Not this |
|---|---|---|
| The bell in the Primary Menu | `Notification` (dot = unread, **no count**) | a numeric badge (AI-GUIDE §7) |
| The panel under the bell, as shipped | `NotificationCenter` (gear swaps inbox ↔ settings, body max 480px) | a hand-built popover |
| A panel with the **filters above the list** and a viewport-tall list | Compose it on the `NotificationCenter` surface classes (see the prototype's `NotificationsPanel.tsx`). This is a **proposed** pattern: Figma *Notification Panel* `1754:502` | changing `NotificationCenter` for one screen |
| One notification in a list | Screen-local card from DS parts (`Icon`, `Typography`, `Chip`, `Spinner`, `Link`, `ButtonIcon`), as in `NotificationCard`. **Proposed**: Figma *Notification Item* `1751:267` | a new DS component without the rung-7 protocol |
| Something that already happened, transient | `Toast` in a `ToastViewport` (bottom-right) | `Alert` |
| Something the user must act on | `Alert` (inline) | `Toast` |
| **AI is working on this item** | `AiOutline` + words or a `Spinner` | a hand-made gradient border, `Stroke/AI` "pulsing", PRISM colours |
| AI-made, finished | `AiOutline active={false}` (still outline) | a status colour |

## 2. Notification logic (from the prototype)

1. An event has `type`, `priority` (`normal` | `high`) and optional `actor`, `context`, `link` and `display`
   (`alert` = a job result you can dismiss; `activity` = someone's change, kept as a log).
2. **Filters:** the four checkboxes from Figma 131:4940 (All Firms · All Companies · Only Current viewed company ·
   Only My changes). Scopes nest, so the widest ticked one applies. *Only My changes* keeps `actor.isYou`. System
   announcements always pass. Failing items are hidden, not deleted, and come back when the filters widen.
3. **Bell:** the unread dot shows while any visible item is unread.
4. **Delivery:** with the panel closed, a toast. With it open, the item lands on top with a *New* chip. The open
   panel hides the toast.
5. **Closing the panel marks what was seen as read.** A running job stays live.
6. **Actions:** dismiss (×) removes an alert. An activity item can't be dismissed. The `Link` navigates
   (*View results* / *View change*). Never a `Button` that navigates.
7. **AI job:** "AI processing · Reading documents" (`AiOutline` + AI `Chip` + `Spinner`) becomes
   "AI processing complete" (New, `Stroke/AI` outline). The prototype runs it for 15s, then shows an 8s toast
   that pauses on hover.
8. **States to register:** `default` · `ai-processing` · `inbox` · `filters` · `empty`.

## 3. `AiOutline`: the AI working animation

```tsx
<AiOutline asChild active={job.running}>
  <article aria-labelledby={id} style={{ padding: space.m }}>…</article>
</AiOutline>
```

- 2px outline, `color.gradient.ai.{violet,blue,teal,pink}` (`--color-gradient-ai-*`). Figma: *Semantic: Color ›
  Gradient/AI/\**. They share values with `bg.ai` and Global Search's Company, Measurement Date and Page
  primaries, but they are **not PRISM** (R11). Never paint the gradient from PRISM tokens.
- `active` → the colours **orbit the outline once every 6s, linear, infinite**: a conic gradient whose
  `@property --scalar-ai-outline-angle` turns 0° → 360°, so the colour follows the corners and the loop has no seam.
  `active={false}` holds it still. `prefers-reduced-motion` stops it.
- Don't set `background`/`border` on it. Change the inner fill with `--ai-outline-fill`. Radius defaults to `radius.m`.
- Decorative: always pair it with words or a `Spinner` (R8). Remove it, or set `active={false}`, when the work ends.
- Storybook: *Feedback › AiOutline* (with a browser motion check) and *Feedback › AiOutline spec*.
- Figma: **AI Outline** (components file `Z4MtKOfkNEzhMYJzN1q3kR`, page 24, `1753:95`). It shows one frame of the orbit.

## 4. Other motion, on tokens

| Motion | How | Tokens |
|---|---|---|
| A toast entering | fade + `translateY(space.l)` → none, as a **transition** (so `base.css` reduced-motion covers it) | `motion.moderate` + `motion.decelerate` |
| A popover entering | fade + `translateY(-space.s)` → none, as a transition | `motion.moderate` + `motion.decelerate` |
| Indeterminate work in a toast or card | `Spinner` / `ProgressBar` (no `value`) | built in |

Rules: only `motion.*` durations and easings for transitions. A loop (like the orbit) is a DS keyframe, not
screen code. **Transitions** are covered by `base.css` reduced motion, but **animations need their own
`@media (prefers-reduced-motion: reduce)`** (or a `matchMedia` check for the Web Animations API). Verify motion in
the browser: sample computed `opacity`/`transform` over time, or read `el.getAnimations()`.

## 5. The AI-tinted toast (prototype pattern)

`Toast` has no AI tone. The prototype sets its own fill and ink hooks to the AI pair (R3):
`style={{ '--toast-bg': color.bg.ai, '--toast-ink': color.text.onAi } as CSSProperties}`, with `glyphs.AiMark`
as the icon. Since PR #20 the × takes `--toast-ink`, so it stays visible on any fill. A real `tone="ai"` is a
rung-7 proposal. Say so, and don't add it silently.

## 6. Swapping a global menu in a prototype

To change what the bell (or any global menu) opens while still composing a **real** screen unchanged, provide
`GlobalMenuOverridesContext` from `shell/AppFrame.tsx`:

```tsx
<GlobalMenuOverridesContext.Provider value={{ menus: { notifications: MyPanel }, unread, openMenu, onMenuChange }}>
  <CapTable state="default" params={params} />
</GlobalMenuOverridesContext.Provider>
```

Product screens never provide it, so their menus are untouched. Keep `value` memoised.

## 7. Icons

AI items use the **Scalar AI mark**, `glyphs.AiMark` (the circled sparkle; Figma "Union"), not a Material star.
In Figma the components use SDS_Main `Ai/outline`. Match by meaning, not shape (known gap 4).
