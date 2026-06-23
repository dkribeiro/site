# Fintech Repositioning — Design

**Date:** 2026-06-23
**Status:** Approved

## Goal

Keep the technical-engineer identity primary while adding a fintech-domain layer that makes the site obviously compelling to founders building financial products, and legible to fintech recruiters. The site should signal heavy financial-product expertise without becoming a "banking explainer."

**Audience priority:** both founders and recruiters, tilted toward early-stage fintech founders (the "I'm building a bank / financial company" buyer).

## Non-goals (deliberately out of scope)

- Interactive "banking revenue map" / anatomy-of-a-bank centerpiece.
- Hero redesign — the Three.js system map and layout stay.
- Language toggles or native-Portuguese-heavy copy. Labels are English-only.
- Touching the non-fintech roles' content beyond what's already there.

## Changes

Three changes, in priority order.

### 1. Hero + meta copy

`src/site.config.ts`:

- **`tagline`** → `18+ years · Scalable systems · Technical leadership · Fintech`
  ("Fintech" placed last as the anchoring specialty.)
- **`description`** → lead with fintech for SEO + OG social previews. Target copy:
  > "Staff Engineer with 18+ years building fintech infrastructure — cards, lending, cross-border, and core banking. Technical leadership at scale. Remote — US, Canada, Europe."
- **`title`** stays `Staff Software Engineer` (identity unchanged); the fintech signal rides in tagline + description.

No structural/layout change to `Hero.astro`.

### 2. New `DomainExpertise` section

The single new visible element.

- **Component:** `src/components/DomainExpertise.astro`.
- **Placement:** in `src/pages/index.astro`, immediately after `<Hero />` and before `<About />`. It's the differentiator, so it surfaces early.
- **Heading:** "Fintech domain expertise."
- **Framer line:** "Most of what a financial company needs to build, I've already shipped."
- **Body:** responsive grid of 6 buckets. Each bucket = bold label + one-line descriptor + small company chips tying the bucket to real shipped work. **Language: English-only.** Descriptors are in English; instrument proper-names (CCB, debentures, FIDC, CRI/CRA, commercial notes) are retained because they are product names with no plain-English substitute — they are the domain signal, not Portuguese copy.

Buckets:

| Label | Descriptor | Chips |
| --- | --- | --- |
| Cards & Issuing | Credit cards, issuers, card networks, interchange | PicPay |
| Receivables & Payroll | Receivables financing, registries, payroll, salary advance | PicPay |
| Lending & Capital Markets | CCB, commercial notes, debentures, FIDCs, securitization | Kanastra |
| Cross-border & Stablecoins | Multi-bank orchestration, FX, stablecoin rails | Conduit |
| Core Banking & Ledger | Double-entry ledger, BaaS, money movement | Kanastra · Conduit |
| Payments & Integrations | Payment methods, acquiring, banking integrations | PicPay · Conduit |

- **Data:** a typed const array `src/data/domains.ts` (label, descriptor, chips[]). No content-collection schema needed — this is static presentational data.
- **Styling:** match existing editorial CSS. Reuse `global.css` tokens and a card treatment echoing `RoleCard.astro`. Static and scannable in ~3 seconds; subtle hover only (no heavy interaction, no JS dependency).

### 3. Role-card content enrichment

`src/content/roles/*.md` — rewrite summaries + bullets for the three fintech roles to speak fluent fintech, naming instruments and rails precisely. Keep all existing metrics, frontmatter, and the zod schema intact (no schema changes).

- **PicPay** — receivables-backed credit card, corporate credit card, payroll, salary advance (antecipação salarial); reference issuing/registradora context.
- **Kanastra** — lending platform issuing CCB, nota comercial, debêntures; FIDC work; durable financial workflows.
- **Conduit** — cross-border money-movement orchestrator across multiple banking integrations with stablecoin settlement; ledger/data-integrity work.

Leave dreamlabs, alokium, doutor, matiplus, mtv as-is.

## Verification

- `npm run check` — types + content-collection schema stay green.
- `npm run test` — role schema tests stay green.
- Visual smoke-check the new `DomainExpertise` section at mobile and desktop widths.

## Architecture notes

- New units are isolated: `domains.ts` (data) and `DomainExpertise.astro` (presentation) have one clear purpose each and no dependency beyond `global.css` tokens. The component reads the const array and renders; it can be understood and changed without touching anything else.
- The role-content changes are confined to markdown bodies/summaries; no code or schema changes, so the build contract is unchanged.
