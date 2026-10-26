#!/usr/bin/env node
// reuse-check — "does the design system / product already have this?"
// Usage: node <skill>/scripts/reuse-check.mjs <keyword> [keyword…]
// Searches every source of truth and prints what already exists, so a screen is
// composed from it instead of inventing something new. Stories come from the live
// Storybook (built from Prism-v1 `main`), falling back to the local *.stories.tsx.
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { homedir } from 'node:os';
import { execFileSync } from 'node:child_process';

const STORYBOOK = 'https://scalar-ds-storybook.netlify.app';

const isRepo = (d) => d && existsSync(join(d, 'AI-GUIDE.md')) && existsSync(join(d, 'apps/product'));
const up = (d) => { while (d !== '/' && !isRepo(d)) d = dirname(d); return isRepo(d) ? d : null; };
const root = process.env.PRISM_V1 || up(process.cwd()) || [join(homedir(), 'Documents/GitHub/Prism-v1')].find(isRepo);
if (!root || !isRepo(root)) { console.error('Prism-v1 not found. cd into it, set PRISM_V1=/path/to/Prism-v1, or clone github.com/Bayardo88/Prism-v1.'); process.exit(2); }

const terms = process.argv.slice(2).map((t) => t.toLowerCase());
if (!terms.length) { console.error('Usage: reuse-check.mjs <keyword> [keyword…]'); process.exit(2); }
const hit = (s) => terms.some((t) => s.toLowerCase().includes(t));
const read = (p) => (existsSync(join(root, p)) ? readFileSync(join(root, p), 'utf8') : '');
const lines = (p) => read(p).split('\n').map((l, i) => [i + 1, l]);
const walk = (d, test, acc = []) => {
  if (!existsSync(d)) return acc;
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    if (statSync(p).isDirectory()) walk(p, test, acc); else if (test(f)) acc.push(p);
  }
  return acc;
};

const out = [];
const section = (title, rows) => { if (rows.length) out.push(`\n## ${title} (${rows.length})`, ...rows.slice(0, 25).map((r) => '  ' + r), rows.length > 25 ? `  … +${rows.length - 25} more` : ''); };

// 0. Is this checkout the latest design system? (uses the last `git fetch`)
let stale = '';
try {
  const git = (...a) => execFileSync('git', ['-C', root, ...a], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  const behind = Number(git('rev-list', '--count', 'HEAD..origin/main'));
  if (behind > 0) stale = `WARNING: ${root} is ${behind} commit(s) behind origin/main (branch ${git('rev-parse', '--abbrev-ref', 'HEAD')}). Build against main — see SKILL.md Step 0.`;
} catch { /* not a git checkout, or no origin/main */ }

// 1. Product screens + states (what page already does this?)
try {
  const screens = JSON.parse(read('docs/product/screens.json'));
  section('Screens/states that already exist', screens.flatMap((s) => {
    const rows = [];
    if (hit(`${s.title} ${s.summary} ${s.component} ${s.route}`)) rows.push(`SCREEN ${s.id}  ${s.route}  <${s.component}>  — ${s.summary}`);
    for (const st of s.states) if (hit(`${st.label} ${st.key}`)) rows.push(`  state ${s.id}?state=${st.key} — ${st.label} (Figma ${st.figmaNode})`);
    return rows;
  }));
} catch { /* catalog not generated */ }

// 2. Storybook — the canonical, rendered usage of every component
let entries = null;
let storySource = 'live';
try {
  const res = await fetch(`${STORYBOOK}/index.json`, { signal: AbortSignal.timeout(4000) });
  if (res.ok) entries = Object.values((await res.json()).entries);
} catch { /* offline */ }
if (!entries) {
  storySource = 'local';
  entries = walk(join(root, 'src'), (f) => f.endsWith('.stories.tsx')).flatMap((file) => {
    const src = readFileSync(file, 'utf8');
    const title = src.match(/const meta[\s\S]*?title:\s*'([^']+)'/)?.[1];
    if (!title) return [];
    const base = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const importPath = './' + relative(root, file);
    return [...src.matchAll(/^export const (\w+)/gm)].map(([, name]) => ({
      type: 'story', title, name, importPath,
      id: `${base}--${name.replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2').replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()}`,
    }));
  });
}
const groups = new Map();
for (const e of entries) {
  if (e.type !== 'story') continue;
  if (!groups.has(e.title)) groups.set(e.title, { file: e.importPath, docs: `${e.id.split('--')[0]}--docs`, stories: [] });
  if (hit(`${e.title} ${e.name}`) || hit(e.importPath)) groups.get(e.title).stories.push(e);
}
section(`Storybook stories (${storySource}: ${STORYBOOK}) — read the story source before using the component`,
  [...groups].filter(([title, g]) => g.stories.length || hit(title)).map(([title, g]) => {
    const names = g.stories.length ? g.stories.map((s) => s.name).join(' · ') : 'all stories';
    return `${title}  [${names}]\n      docs ${STORYBOOK}/?path=/docs/${g.docs}  ·  source ${g.file.replace(/^\.\//, '')}`;
  }));

// 2b. Storybook spec pages (MDX): anatomy, states, tokens and rules for a family of components
const specDir = join(root, 'docs/storybook');
if (existsSync(specDir)) {
  const rows = [];
  for (const f of readdirSync(specDir).filter((x) => x.endsWith('.mdx'))) {
    const src = lines(`docs/storybook/${f}`);
    const title = src.map(([, l]) => l.match(/<Meta title="([^"]+)"/)?.[1]).find(Boolean) ?? f;
    const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const hits = src.filter(([, l]) => hit(l) && /^(#|\||- )/.test(l));
    if (hits.length || hit(title)) rows.push(`${title}  ${STORYBOOK}/?path=/docs/${id}--docs\n      ${hits.slice(0, 4).map(([n, l]) => `L${n} ${l.trim().slice(0, 140)}`).join('\n      ')}`);
  }
  section('Storybook spec pages (docs/storybook/*.mdx)', rows);
}

// 3. Figma → React component map
section('Components (docs/components.md)', lines('docs/components.md').filter(([, l]) => l.startsWith('|') && !/^\|\s*(Figma|-)/.test(l) && hit(l)).map(([n, l]) => `L${n} ${l.replace(/\s+/g, ' ')}`));

// 4. AI-GUIDE: §5 intent railroad through §7 component API (located by heading, not line number)
const guide = lines('AI-GUIDE.md');
const from = guide.find(([, l]) => /^## 5\./.test(l))?.[0] ?? 1;
const to = guide.find(([, l]) => /^## 8\./.test(l))?.[0] ?? guide.length;
section('AI-GUIDE intent → component (§5) and API (§7)', guide.filter(([n, l]) => n >= from && n < to && hit(l)).map(([n, l]) => `L${n} ${l.trim().slice(0, 200)}`));

// 5. Screen chrome: PageTemplate and the 3-tier navigation spec
for (const doc of ['docs/page-template.md', 'docs/navigation-3-tier-system.md']) {
  section(`Chrome rules (${doc})`, lines(doc).filter(([, l]) => /^(#|\||- |\d+\. )/.test(l) && hit(l)).map(([n, l]) => `L${n} ${l.trim().slice(0, 180)}`));
}

// 6. Per-page behaviour docs (patterns and rules)
const pagesDir = join(root, 'docs/product/pages');
if (existsSync(pagesDir)) {
  const rows = [];
  for (const f of readdirSync(pagesDir)) for (const [n, l] of lines(`docs/product/pages/${f}`)) if (hit(l) && /^(#|- |Components used)/.test(l)) rows.push(`${f}:${n} ${l.trim().slice(0, 180)}`);
  section('Page docs — existing behaviour & rules', rows);
}

// 7. Tokens
section('Tokens (docs/tokens.md)', lines('docs/tokens.md').filter(([, l]) => hit(l)).map(([n, l]) => `L${n} ${l.trim().slice(0, 160)}`));

// 8. Known gaps — if it's listed, the gap is deliberate: do not "fix" silently
section('Known gaps (docs/known-gaps.md) — READ before proposing anything new', lines('docs/known-gaps.md').filter(([, l]) => /^#{1,3} /.test(l) && hit(l)).map(([n, l]) => `L${n} ${l}`));

console.log(`reuse-check: "${terms.join('", "')}"  (repo ${root})`);
if (stale) console.log(`\n${stale}`);
console.log(out.filter(Boolean).join('\n') || '\nNOTHING FOUND for those terms. Try synonyms (e.g. "picker" for "select", "modal" for "dialog") before concluding it does not exist.');
console.log('\nNext: if any hit fits, USE it — copy props from its story. Only if none does, see references/reuse-ladder.md in the skill.');
