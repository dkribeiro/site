# Personal site (dkribeiro.com) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Ship a single-page Astro site with hire-first hero (headshot, CTAs), expandable work timeline from content collections, bold editorial styling, and deploy-ready static output.

**Architecture:** Astro SSG with `src/content/roles` as the source of truth (YAML frontmatter + markdown body for bullets). UI is Astro components + global CSS tokens; timeline uses native `<details>`/`<summary>` for progressive enhancement. Shared Zod schema validates role shape in tests and in the content layer. Design reference: `docs/plans/2026-03-18-personal-site-redesign-design.md`.

**Tech Stack:** Astro 5.x, TypeScript, Zod, Vitest (schema/unit only), CSS (no Tailwind required for v1—plain CSS variables); deploy Vercel or Cloudflare Pages.

---

## Prerequisites

- Node.js 20+ and npm.
- Repo root: `/Users/dkribeiro/Workspace/dkribeiro.com` (already contains `docs/` and git).
- Design decisions locked in the design doc (timeline, metrics from dossier only, headshot in hero).

---

### Task 1: Scaffold Astro in repo root

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `src/pages/index.astro`, etc. (scaffold output)
- Modify: `.gitignore` (if scaffold adds `dist/`, `node_modules/`)

**Step 1:** From repo root, run non-interactive scaffold (directory has `docs/` only):

```bash
cd /Users/dkribeiro/Workspace/dkribeiro.com
npm create astro@latest . -- --template minimal --typescript strict --install --no-git --yes
```

**Step 2:** If the CLI refuses overlapping files, scaffold into `_site` then move `package.json`, `astro.config.mjs`, `src/`, `public/`, `tsconfig.json` to root and remove `_site`.

**Step 3:** Enable content collections in `astro.config.mjs` if not already (Astro 5 uses `src/content.config.ts`; ensure `@astrojs/mdx` is optional—plain `.md` is enough).

**Step 4:** Verify:

```bash
npm run build
```

Expected: exit code 0, `dist/index.html` exists.

**Step 5: Commit**

```bash
git add package.json package-lock.json astro.config.mjs tsconfig.json src public .gitignore
git commit -m "chore: scaffold Astro minimal site"
```

---

### Task 2: Add Vitest and role schema module (failing test first)

**Files:**
- Create: `src/schemas/role.ts`
- Create: `src/schemas/role.test.ts`
- Modify: `package.json` (scripts + devDependencies)
- Modify: `vitest.config.ts` or `astro.config` integration—use standalone Vitest for Node.

**Step 1:** Install Vitest:

```bash
npm install -D vitest
```

Add to `package.json`:

```json
"scripts": {
  "test": "vitest run",
  "test:watch": "vitest"
}
```

**Step 2:** Create `src/schemas/role.ts`:

```ts
import { z } from "zod";

export const roleSchema = z.object({
  company: z.string().min(1),
  title: z.string().min(1),
  start: z.string().regex(/^\d{4}-\d{2}$/),
  end: z.string().regex(/^\d{4}-\d{2}$/).optional(),
  present: z.boolean().optional(),
  location: z.string().min(1),
  summary: z.string().min(1),
  order: z.number().int(),
  stack: z.array(z.string()).optional(),
  metrics: z.array(z.string()).optional(),
}).refine((d) => d.present === true || (d.end && d.end.length > 0), {
  message: "Either present: true or end date required",
});

export type RoleFrontmatter = z.infer<typeof roleSchema>;
```

**Step 3:** Write failing test `src/schemas/role.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { roleSchema } from "./role";

describe("roleSchema", () => {
  it("rejects missing company", () => {
    const r = roleSchema.safeParse({
      title: "Eng",
      start: "2025-10",
      present: true,
      location: "Remote",
      summary: "x",
      order: 1,
    });
    expect(r.success).toBe(false);
  });
});
```

**Step 4:** Run test (expect FAIL—company missing but we didn't add zod to project yet):

```bash
npm install zod
npm run test
```

Expected: FAIL until `company` is required—actually the test expects `success` false; if schema requires company, parse without company → fail. **PASS** means test is wrong. Adjust: use invalid `start: "Oct 2025"` to force failure first:

```ts
it("rejects bad start date", () => {
  expect(roleSchema.safeParse({
    company: "X", title: "Y", start: "bad", present: true,
    location: "Z", summary: "s", order: 1,
  }).success).toBe(false);
});
```

Run `npm run test` → Expected: **PASS**.

**Step 5: Commit**

```bash
git add package.json package-lock.json src/schemas/role.ts src/schemas/role.test.ts vitest.config.ts
git commit -m "test: add role Zod schema and Vitest"
```

(Add minimal `vitest.config.ts` with `test: { include: ["src/**/*.test.ts"] }` if needed.)

---

### Task 3: Register `roles` content collection

**Files:**
- Create: `src/content.config.ts` (Astro 5) **or** `src/content/config.ts` (legacy—use whichever `npm create` generated)
- Create: `src/content/roles/.gitkeep`

**Step 1:** In `src/content.config.ts`:

```ts
import { defineCollection, z } from "astro:content";
import { roleSchema } from "../schemas/role";

const roles = defineCollection({
  type: "content",
  schema: roleSchema,
});

export const collections = { roles };
```

Note: Astro’s `z` from `astro:content` must match field types—if Astro expects `z.coerce` etc., mirror `roleSchema` fields with the same constraints or use `roleSchema` via `z.custom`—simplest path: **duplicate** schema with `astro:content`’s `z` to avoid import friction:

```ts
import { defineCollection, z } from "astro:content";

const roles = defineCollection({
  type: "content",
  schema: z.object({
    company: z.string(),
    title: z.string(),
    start: z.string(),
    end: z.string().optional(),
    present: z.boolean().optional(),
    location: z.string(),
    summary: z.string(),
    order: z.number(),
    stack: z.array(z.string()).optional(),
    metrics: z.array(z.string()).optional(),
  }),
});
export const collections = { roles };
```

Keep `src/schemas/role.ts` in sync with this object (tests stay the source of truth for shape).

**Step 2:** Add one fixture `src/content/roles/conduit.md`:

```md
---
company: Conduit
title: Senior Software Engineer
start: 2025-10
present: true
location: USA, Remote
summary: Core backend modernization, observability, and technical standards.
order: 1
stack:
  - AWS
  - Kubernetes
  - Node.js
metrics:
  - "45% improvement in stability and data integrity (first six months)"
---

- Led refactoring and architectural improvements on core services.
- Established observability standards (Datadog, MTTR/MTTD).
```

**Step 3:** Run:

```bash
npm run build
```

Expected: **PASS** (collection validates).

**Step 4:** Extend Vitest with a test that reads all `src/content/roles/*.md` frontmatter—optional; skip if heavy. Minimum: `npm run build` is the gate.

**Step 5: Commit**

```bash
git add src/content.config.ts src/content/roles/conduit.md
git commit -m "feat(content): roles collection + Conduit entry"
```

---

### Task 4: Seed remaining role entries

**Files:**
- Create: `src/content/roles/kanastra.md`, `picpay.md`, `dreamlabs.md`, `alokium.md`, `matiplus.md`, `mtv.md`, `doutor.md` (filenames arbitrary; **order** field controls display)

**Step 1:** For each role, copy bullets/metrics **only** from `docs/plans/2026-03-18-personal-site-redesign-design.md` / dossier (no new metrics). Set `order`: 1 Conduit, 2 Kanastra, 3 PicPay, 4 DreamLabs, 5 Alokium, 6 Matiplus, 7 MTV, 8 Doutor (adjust if you merge Alokium note into DreamLabs card—YAGNI: separate files OK).

**Step 2:** Run `npm run build` after each batch or once at end.

**Step 3:** On failure, fix YAML (indentation, dates `YYYY-MM`).

**Step 4:** Run `npm run test` (schema tests still pass with valid fixtures).

**Step 5: Commit**

```bash
git add src/content/roles/
git commit -m "feat(content): full career timeline entries"
```

---

### Task 5: Site config and constants

**Files:**
- Create: `src/site.config.ts`
- Modify: `astro.config.mjs` (`site: 'https://dkribeiro.com'` placeholder)

**Step 1:** `src/site.config.ts`:

```ts
export const site = {
  name: "André (Dk) Ribeiro",
  title: "Staff Software Engineer",
  tagline: "18+ years · Distributed systems · Fintech · Technical leadership",
  description: "Staff Software Engineer architecting scalable, low-latency backends and high-performing engineering orgs.",
  url: "https://dkribeiro.com",
  email: "dk@dkribeiro.com",
  linkedin: "https://www.linkedin.com/in/dkribeiro/",
  github: "https://github.com/dkribeiro",
  resumePath: "/resume.pdf",
  ogImage: "/og-image.jpg",
};
```

**Step 2:** Set `site` in `astro.config.mjs` to match `site.url`.

**Step 3:** Add `public/resume.pdf` **or** leave absent and document “hide résumé button if missing”—implement hide in Task 8.

**Step 4:** `npm run build` — PASS.

**Step 5: Commit**

```bash
git add src/site.config.ts astro.config.mjs
git commit -m "feat: central site config"
```

---

### Task 6: Global CSS design tokens

**Files:**
- Create: `src/styles/global.css`
- Modify: `src/layouts/Layout.astro` or base layout to import CSS

**Step 1:** Define CSS variables:

```css
:root {
  --bg: #0c0c0f;
  --fg: #e8e6e3;
  --muted: #8a8780;
  --accent: #e8a54b;
  --font-display: "DM Serif Display", Georgia, serif;
  --font-body: "DM Sans", system-ui, sans-serif;
  --space: clamp(1rem, 4vw, 2rem);
  --max: 72ch;
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
```

**Step 2:** Add Google Fonts link in layout `<head>` or `@fontsource` packages.

**Step 3:** Subtle noise: `body::before` with low-opacity PNG or CSS `filter`—keep under 5% opacity.

**Step 4:** Manual: open dev server, contrast check accent on `--bg`.

**Step 5: Commit**

```bash
git add src/styles/global.css
git commit -m "feat(styles): global tokens and reduced-motion"
```

---

### Task 7: Base layout — skip link, nav, footer slot

**Files:**
- Create: `src/layouts/BaseLayout.astro`
- Modify: `src/pages/index.astro` to use it

**Step 1:** `BaseLayout.astro` skeleton:

```astro
---
import "../styles/global.css";
import { site } from "../site.config";
interface Props { title?: string; description?: string; }
const { title = site.name, description = site.description } = Astro.props;
---
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={site.url} />
  </head>
  <body>
    <a href="#main" class="skip">Skip to content</a>
    <header>
      <nav aria-label="Primary">
        <a href="#hero">Top</a>
        <a href="#work">Work</a>
        <a href="#contact">Contact</a>
      </nav>
    </header>
    <main id="main">
      <slot />
    </main>
  </body>
</html>
```

**Step 2:** Style `.skip` off-screen until `:focus`.

**Step 3:** `npm run dev` — tab to skip link, verify focus visible.

**Step 4:** `npm run build` — PASS.

**Step 5: Commit**

```bash
git add src/layouts/BaseLayout.astro src/pages/index.astro
git commit -m "feat(layout): BaseLayout with skip link and anchor nav"
```

---

### Task 8: Hero — headshot, H1, CTAs

**Files:**
- Create: `src/components/Hero.astro`
- Create: `public/images/headshot.jpg` (placeholder SVG or real asset—user supplies photo)
- Modify: `index.astro`

**Step 1:** Placeholder: `public/images/headshot-placeholder.svg` if no photo yet.

**Step 2:** Hero markup: framed image (border + offset box with `accent`), `h1`, `p` tagline, links:

```astro
---
import { site } from "../site.config";
const hasResume = true; // TODO: import fs.existsSync in build step or use env — simpler: always show; 404 handled by host or use try/catch in getStaticPaths not available. Use client-visible: check via Astro.url.origin — YAGNI: show button linking to /resume.pdf; add file later.
---
<section id="hero" aria-labelledby="hero-heading">
  <img src="/images/headshot.jpg" alt="" width="320" height="320" fetchpriority="high" />
  <!-- decorative: alt empty if redundant with h1 -->
  <h1 id="hero-heading">{site.name}</h1>
  <p>{site.title} — {site.tagline}</p>
  <ul class="ctas">...</ul>
</section>
```

Use meaningful `alt` if photo is content: `alt="André Ribeiro"`.

**Step 3:** Add LinkedIn, GitHub, `mailto:`, résumé link.

**Step 4:** Lighthouse quick check on hero LCP.

**Step 5: Commit**

```bash
git add src/components/Hero.astro public/images/
git commit -m "feat: hero with headshot frame and CTAs"
```

---

### Task 9: Timeline — RoleCard with details/summary

**Files:**
- Create: `src/components/Timeline.astro`
- Create: `src/components/RoleCard.astro`

**Step 1:** In `Timeline.astro`:

```astro
---
import { getCollection } from "astro:content";
import RoleCard from "./RoleCard.astro";
const roles = (await getCollection("roles")).sort((a, b) => a.data.order - b.data.order);
---
<section id="work" aria-labelledby="work-heading">
  <h2 id="work-heading">Work</h2>
  {roles.map((entry) => <RoleCard entry={entry} />)}
</section>
```

**Step 2:** `RoleCard.astro`:

```astro
---
import type { CollectionEntry } from "astro:content";
interface Props { entry: CollectionEntry<"roles">; }
const { entry } = Astro.props;
const { company, title, start, end, present, location, summary, stack, metrics } = entry.data;
const period = present ? `${start} — Present` : `${start} — ${end}`;
---
<article class="role-card">
  <details>
    <summary>
      <span class="company">{company}</span>
      <span class="title">{title}</span>
      <span class="meta">{period} · {location}</span>
      <span class="hook">{summary}</span>
    </summary>
    <div class="details-body">
      <div class="content"><slot /></div>
      {metrics?.length ? <ul class="metrics">{metrics.map((m) => <li>{m}</li>)}</ul> : null}
      {stack?.length ? <ul class="stack">{stack.map((t) => <li>{t}</li>)}</ul> : null}
    </div>
  </details>
</article>
```

Render `entry.body` via `<Fragment set:html={...} />` or `Content` component from `render(entry)` in Astro 5:

```astro
---
const { Content } = await entry.render();
---
<Content />
```

**Step 3:** Keyboard: focus summary, Enter toggles.

**Step 4:** `npm run build` — PASS.

**Step 5: Commit**

```bash
git add src/components/Timeline.astro src/components/RoleCard.astro src/pages/index.astro
git commit -m "feat: expandable work timeline"
```

---

### Task 10: Footer and contact section

**Files:**
- Create: `src/components/Footer.astro`
- Modify: `index.astro`

**Step 1:** `#contact` with mailto, LinkedIn, GitHub; optional line “Open to Staff/Principal roles, remote (US, Canada, Europe).”

**Step 2:** Footer year `new Date().getFullYear()`.

**Step 3:** Focus styles on all links.

**Step 4:** `npm run build`.

**Step 5: Commit**

```bash
git add src/components/Footer.astro
git commit -m "feat: footer and contact section"
```

---

### Task 11: SEO and Open Graph

**Files:**
- Modify: `BaseLayout.astro`

**Step 1:** Add meta:

```html
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta property="og:url" content={site.url} />
<meta property="og:type" content="website" />
<meta property="og:image" content={`${site.url}${site.ogImage}`} />
<meta name="twitter:card" content="summary_large_image" />
```

**Step 2:** Add `public/og-image.jpg` (1200×630) or generate placeholder.

**Step 3:** Validate with opengraph.xyz or similar.

**Step 4:** `npm run build`.

**Step 5: Commit**

```bash
git add src/layouts/BaseLayout.astro public/og-image.jpg
git commit -m "feat(seo): Open Graph and Twitter cards"
```

---

### Task 12: 404 page

**Files:**
- Create: `src/pages/404.astro`

**Step 1:** Minimal branded 404 + link to `/`.

**Step 2:** For static hosts, configure SPA fallback if needed—Cloudflare/Vercel default 404 to `404.html` when built.

**Step 3:** `npm run build` — confirm `dist/404.html`.

**Step 4:** Manual hit `/nope` on preview.

**Step 5: Commit**

```bash
git add src/pages/404.astro
git commit -m "feat: 404 page"
```

---

### Task 13: Astro check and README

**Files:**
- Modify: `package.json` scripts
- Create/update: `README.md`

**Step 1:**

```bash
npx astro add --yes  # only if using strict check
npm run astro check
```

Add script: `"check": "astro check"`.

**Step 2:** README: how to `npm install`, `npm run dev`, `npm run build`, where to put `resume.pdf`, deploy buttons.

**Step 3:** Run `npm run build && npm run test`.

**Step 4:** Expected: all green.

**Step 5: Commit**

```bash
git add README.md package.json
git commit -m "docs: README and astro check script"
```

---

### Task 14: Final verification (manual)

**Files:** None (checklist only)

**Step 1:** `npm run build` — zero errors.

**Step 2:** `npx serve dist` (or `npm run preview`) — click every CTA, expand every timeline card.

**Step 3:** Lighthouse (Chrome DevTools): Performance ≥ 90, Accessibility ≥ 90, SEO ≥ 90 on a throttled run.

**Step 4:** `prefers-reduced-motion`: OS setting on—confirm no jarring motion.

**Step 5: Commit** (only if fixes applied)

```bash
git commit -am "fix: a11y and lighthouse tweaks"
```

---

## Summary task order

| # | Task |
|---|------|
| 1 | Scaffold Astro |
| 2 | Vitest + Zod role schema + tests |
| 3 | Content collection + first role |
| 4 | All role MD files |
| 5 | site.config + astro site URL |
| 6 | Global CSS tokens |
| 7 | BaseLayout + nav |
| 8 | Hero + headshot |
| 9 | Timeline + RoleCard |
| 10 | Footer / contact |
| 11 | OG / Twitter meta |
| 12 | 404 |
| 13 | README + astro check |
| 14 | Manual Lighthouse + motion |

---

**Plan complete and saved to `docs/plans/2026-03-18-personal-site-implementation.md`. Two execution options:**

1. **Subagent-Driven (this session)** — Dispatch a fresh subagent per task, review between tasks, fast iteration (**@superpowers:subagent-driven-development**).

2. **Parallel Session (separate)** — New session with **@superpowers:executing-plans**, batch execution with checkpoints.

**Which approach do you want?**
