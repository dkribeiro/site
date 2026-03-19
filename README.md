# dkribeiro.com

Personal site: **Astro** static site with hire-first hero, expandable work timeline (content collections), and editorial styling.

## Commands

| Command           | Action                          |
| ----------------- | ------------------------------- |
| `npm install`     | Install dependencies            |
| `npm run dev`     | Dev server → `localhost:4321`   |
| `npm run build`   | Output to `dist/`               |
| `npm run preview` | Preview production build        |
| `npm run test`    | Vitest (role schema)            |
| `npm run check`   | `astro check` (types + content) |

## Content

- **Roles:** `src/content/roles/*.md` — frontmatter must match `src/schemas/role.ts` (validated at build).
- **Site copy / links:** `src/site.config.ts`.

## Assets to add locally

1. **`public/resume.pdf`** — Résumé PDF (links 404 until present).
2. **`public/images/headshot.jpg`** (or replace hero `src` in `src/components/Hero.astro`) — Swap placeholder SVG for a real photo.
3. **`public/og-image.svg`** — Optional: replace with a 1200×630 raster for richer social previews.

## Deploy

Build output is static (`dist/`). Works on **Vercel**, **Cloudflare Pages**, **Netlify**, etc. Set the production URL in `astro.config.mjs` (`site`) and `src/site.config.ts` (`url`) if the domain changes.

## Design

See `docs/plans/2026-03-18-personal-site-redesign-design.md`.
