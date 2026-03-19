# Personal site redesign — design (dkribeiro.com)

**Date:** 2026-03-18  
**Status:** Validated (brainstorming session)  
**Stack:** Astro + content collections (MD/MDX), deploy Vercel or Cloudflare Pages.

---

## Goals

- **Primary:** Strong first screen for hiring (recruiters / hiring managers): role, credibility, CTAs.
- **Secondary:** Depth via **timeline** (expandable roles + metrics) for interviewers and peers.
- **Tone:** Senior, good taste, **bold creative** (typography, layout, subtle art/music accent)—not generic SaaS portfolio.

---

## Decisions (locked)

| Topic | Choice |
|-------|--------|
| Optimization | Hire-first hero + optional depth |
| Depth pattern | Reverse-chronological **timeline**, expandable cards, metrics from dossier only |
| Visual | Bold creative type/layout + one accent + light texture; headshot with designed frame |
| Hero visual | Professional **headshot** in non-default framing |
| Build | **Astro**, timeline as repo content (collections / MDX) |

---

## 1. Information architecture & first screen

- **Shape:** Single long page with anchor nav (e.g. Work, Contact). Optional later: `/resume.pdf` or static PDF path.
- **Hero:** Name, one-line role, short subline (years + domains), headshot (creative frame), CTAs: LinkedIn, GitHub, email, résumé PDF; secondary scroll to timeline.
- **Timeline:** Collapsed default (company, title, dates, hook); expand → bullets, stack tags, **verified metrics** (45%, 99.99%, 20M+, 1→50+, etc.—no invented numbers).
- **Footer:** Contact, year, optional line on remote focus (US / Canada / Europe).

---

## 2. Visual system

- **Type:** Max two families—distinctive display for hero; readable body (17–19px). Timeline: clear hierarchy for titles vs dates (muted or tabular).
- **Color:** One dominant base (dark **or** light for v1); **one accent** (art-biased hue); optional `prefers-color-scheme` later.
- **Texture:** Very subtle grain/noise on hero or page—disciplined use.
- **Layout:** Strong grid; asymmetry **only** in hero. Headshot: offset frame, rules, or cut-out + color block—not default circle-on-gray.
- **Motion:** Respect `prefers-reduced-motion`. Else: short scroll reveals; timeline expand via height/opacity—no distracting loops.

---

## 3. Components & content model

- **Shell:** Skip link, anchor nav, footer.
- **Hero:** Headshot, H1, subline, CTA group.
- **Timeline:** Role cards; expand/collapse (`<details>`/`<summary>` or minimal island). Optional: single-open vs multi-open at implementation.
- **Contact:** Repeated links (+ optional copy-email).

**Astro content collection (example):** `src/content/roles/*.md` with frontmatter: `company`, `title`, `start`, `end` | `present`, `location`, `summary`, `order`, optional `bullets[]`, `stack[]`, `metrics[]`. Central `site` config for socials and résumé path.

**Progressive enhancement:** Timeline readable without JS (choose pattern: e.g. details/summary or full list fallback).

**Edge cases:** Headshot placeholder if missing; hide or mailto résumé if PDF absent; schema-validated dates; simple 404 for future routes.

---

## 4. SEO, performance, testing

- **SEO:** Unique `<title>` and meta description; Open Graph / Twitter cards (name, role, OG image when headshot/asset ready); semantic headings (single H1).
- **Performance:** Optimized hero image (formats, dimensions, `loading`/`fetchpriority`); minimal JS; font subsetting or system stack if preferred for speed.
- **Accessibility:** Contrast checks; focus states; keyboard timeline; skip link.
- **Testing (light):** Lighthouse (perf, a11y, SEO); manual keyboard pass; spot-check on mobile.

---

## 5. Out of scope (v1)

- Blog / long-form as primary depth (can be phase 2).
- Headless CMS.
- Separate “Lab” page (dossier creative story can be one short hero blurb or footer line if desired later).

---

## 6. Next steps (implementation)

1. `npm create astro@latest` (minimal + content collections).
2. Define role schema + seed entries from dossier (Conduit → … → Doutor).
3. Implement hero + timeline + visual tokens.
4. Add résumé PDF to `public/` when ready.
5. Deploy; verify Lighthouse and a11y.

**Optional:** Ask “Ready to set up for implementation?” then use git worktree + detailed implementation plan if branching from a larger repo.
