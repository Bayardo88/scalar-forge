# scalar-forge

A Claude Code skill for building **real prototypes of the Scalar product** from the
[Prism-v1](https://github.com/Bayardo88/Prism-v1) design system and product app. It
always builds on Prism-v1 `main` and uses the components the way their
[Storybook](https://scalar-prism-storybook.netlify.app) stories do: tokens and coded
components only, no hard-coded values, and no invented components or layouts unless
the feature itself requires one.

## `scalar-forge`

The one Scalar build skill. It replaces `scalar-product` (pages and prototypes in
`apps/product`) and `scalar-screen` (standalone screens and Figma push), both now
retired and removed from Prism-v1, and adds a reuse-first layer:

| Piece | What it does |
|---|---|
| `SKILL.md` | Sync to `main`, then modes: new page · edit page · prototype · standalone screen · Figma push |
| `references/storybook.md` | The live Storybook: finding a story, URL patterns, story → component map, stories for new components |
| `references/reuse-ladder.md` | 7-rung gate; when (and how) something new is allowed |
| `references/screen-logic.md` | Screen brief, archetype→reference screen, state conventions, Figma grounding |
| `references/app-architecture.md` | `apps/product` model: screen × state, `PageTemplate` chrome, routes, Table / DataGrid rules |
| `references/screen-recipes.md` | Eight archetypes (incl. spreadsheet and workboard, with the Workboard Valuation modal), their stories and their traps |
| `references/figma-push.md` | Code → Figma by instancing published components, starting from Page Template · Body Slot |
| `scripts/reuse-check.mjs` | "Does this already exist?" search across screens, Storybook stories, Storybook spec pages (MDX), components, PageTemplate / nav specs, docs, tokens and known gaps, with a warning when the checkout is behind `main` |

## Install

### Option 1: as a Claude Code plugin (recommended)

In Claude Code, run:

```
/plugin marketplace add Bayardo88/scalar-forge
/plugin install scalar-forge@scalar-forge
```

Or from a terminal:

```bash
claude plugin marketplace add Bayardo88/scalar-forge && claude plugin install scalar-forge@scalar-forge
```

Get updates later with `claude plugin marketplace update scalar-forge`.

### Option 2: as a plain skill (symlink)

```bash
git clone https://github.com/Bayardo88/scalar-forge.git
cd scalar-forge && ./install.sh     # symlinks into ~/.claude/skills, removes retired scalar-product / scalar-screen links
```

Pick up changes with `git pull` in the clone; the symlink makes them live.

### Then: get Prism-v1

The skill builds inside the Prism-v1 repo, so clone it once:

```bash
git clone https://github.com/Bayardo88/Prism-v1 ~/Documents/GitHub/Prism-v1 && (cd ~/Documents/GitHub/Prism-v1 && npm install)
```

Set `PRISM_V1=/path/to/Prism-v1` if it lives elsewhere. Then start a new Claude Code
session and ask it to "add a … page to Scalar" or "prototype …", or type `/scalar-forge`.

Requires Prism-v1 (`AI-GUIDE.md`, `apps/product/`, `docs/product/`). The skill fetches
`origin/main` and works in a worktree when your checkout is on another branch. Figma
steps use the Figma MCP.
