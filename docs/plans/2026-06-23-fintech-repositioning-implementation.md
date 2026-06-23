# Fintech Repositioning Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reposition dkribeiro.com so its fintech-domain expertise is unmistakable to founders and recruiters, without changing the technical-engineer identity or the site's layout.

**Architecture:** Three additive changes — (1) hero/meta copy in `site.config.ts`, (2) a new static `DomainExpertise` section fed by a typed data file, inserted after the hero, and (3) richer fintech vocabulary in the three fintech role markdown files. No schema changes, no new dependencies, no JS for the new section.

**Tech Stack:** Astro 6, TypeScript, plain CSS (design tokens in `src/styles/global.css`). Package manager: pnpm.

## Global Constraints

- Language for all new visible copy: **English-only.** Instrument proper-names (CCB, commercial notes, debentures, CRI/CRA, FIDC, BaaS) are allowed — they are product names, not Portuguese copy.
- Do **not** modify `Hero.astro` layout, the Three.js system map, or the role zod schema (`src/schemas/role.ts`).
- New CSS must reuse existing design tokens from `src/styles/global.css` (`--bg`, `--bg-elevated`, `--fg`, `--muted`, `--accent`, `--accent-dim`, `--border`, `--radius`, `--font-display`, `--font-body`, `--space`).
- Role markdown edits must keep all existing frontmatter (metrics, projects, stack, order, dates) intact and schema-valid.
- Verification commands: `pnpm run check` (types + content schema) and `pnpm run test` (vitest). Both must stay green.
- Commit after each task.

---

### Task 1: Hero + meta copy

**Files:**
- Modify: `src/site.config.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: updated `site.tagline` and `site.description` strings consumed by `Hero.astro` (tagline) and `BaseLayout.astro` (description). Field names unchanged.

- [ ] **Step 1: Update tagline and description**

In `src/site.config.ts`, replace the `title`/`tagline`/`description` block's `tagline` and `description` values (leave `title`, `url`, `email`, `linkedin`, `github`, `resumePath`, `ogImage` untouched):

```ts
	title: "Staff Software Engineer",
	tagline: "18+ years · Scalable systems · Technical leadership · Fintech",
	description:
		"Staff Engineer with 18+ years building fintech infrastructure — cards, lending, cross-border, and core banking. Technical leadership at scale. Remote — US, Canada, Europe.",
```

- [ ] **Step 2: Verify types and content still check**

Run: `pnpm run check`
Expected: PASS (no type or content errors).

- [ ] **Step 3: Commit**

```bash
git add src/site.config.ts
git commit -m "feat: fintech-forward hero tagline and meta description"
```

---

### Task 2: Domain data file

**Files:**
- Create: `src/data/domains.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `export interface Domain { label: string; descriptor: string; chips: string[]; }`
  - `export const domains: Domain[]` — array of 6 `Domain` objects, consumed by `DomainExpertise.astro` in Task 3.

- [ ] **Step 1: Create the data file**

Create `src/data/domains.ts` with exactly this content:

```ts
export interface Domain {
	label: string;
	descriptor: string;
	chips: string[];
}

export const domains: Domain[] = [
	{
		label: "Cards & Issuing",
		descriptor: "Credit cards, issuers, card networks, interchange",
		chips: ["PicPay", "Conduit"],
	},
	{
		label: "Receivables & Payroll",
		descriptor: "Receivables financing, registries, payroll, salary advance",
		chips: ["PicPay"],
	},
	{
		label: "Lending & Capital Markets",
		descriptor: "CCB, commercial notes, debentures, CRI/CRA, FIDCs",
		chips: ["Kanastra"],
	},
	{
		label: "Cross-border & Stablecoins",
		descriptor: "Multi-bank orchestration, FX, stablecoin rails",
		chips: ["Conduit"],
	},
	{
		label: "Core Banking & Ledger",
		descriptor: "Double-entry ledger, BaaS, money movement",
		chips: ["Kanastra", "Conduit"],
	},
	{
		label: "Payments & Integrations",
		descriptor: "Payment methods, acquiring, banking integrations",
		chips: ["PicPay", "Conduit"],
	},
];
```

- [ ] **Step 2: Verify it type-checks**

Run: `pnpm run check`
Expected: PASS (the file is not yet imported anywhere, but must compile).

- [ ] **Step 3: Commit**

```bash
git add src/data/domains.ts
git commit -m "feat: add fintech domain expertise data"
```

---

### Task 3: DomainExpertise component + wire into homepage

**Files:**
- Create: `src/components/DomainExpertise.astro`
- Modify: `src/pages/index.astro`
- Modify: `src/styles/global.css` (append a new section block)

**Interfaces:**
- Consumes: `domains` and `Domain` from `src/data/domains.ts` (Task 2).
- Produces: `<DomainExpertise />` component rendering `<section id="expertise">`, inserted between `<Hero />` and `<About />` in `index.astro`.

- [ ] **Step 1: Create the component**

Create `src/components/DomainExpertise.astro` with exactly this content. It follows the existing `data-reveal` progressive-enhancement pattern (already wired globally — no per-component script needed), uses semantic markup, and needs no JavaScript:

```astro
---
import { domains } from "../data/domains.ts";
---

<section id="expertise" class="expertise" aria-labelledby="expertise-heading" data-reveal>
	<div class="expertise-inner">
		<h2 id="expertise-heading" data-reveal style="--reveal-delay: 100ms">
			Fintech domain expertise
		</h2>
		<p class="expertise-lead" data-reveal style="--reveal-delay: 160ms">
			Most of what a financial company needs to build, I've already shipped.
		</p>
		<ul class="expertise-grid" data-reveal style="--reveal-delay: 220ms">
			{
				domains.map((domain) => (
					<li class="expertise-card">
						<h3 class="expertise-label">{domain.label}</h3>
						<p class="expertise-descriptor">{domain.descriptor}</p>
						<ul class="expertise-chips" aria-label="Where I built it">
							{domain.chips.map((chip) => (
								<li>{chip}</li>
							))}
						</ul>
					</li>
				))
			}
		</ul>
	</div>
</section>
```

- [ ] **Step 2: Append component styles to global.css**

Append this block to the end of `src/styles/global.css` (after the `/* 404 */` block). It mirrors the `.about` / `.role-card` / `.stack` token usage already in the file:

```css
/* Domain expertise */
.expertise {
	padding: 2.75rem 0 2.25rem;
	border-bottom: 1px solid var(--border);
}
.expertise-inner {
	display: grid;
	gap: 1.5rem;
}
.expertise h2 {
	font-family: var(--font-display);
	font-size: clamp(1.6rem, 3vw, 2.05rem);
	font-weight: 400;
	margin: 0;
}
.expertise-lead {
	margin: 0;
	color: var(--muted);
	max-width: 42rem;
}
.expertise-grid {
	list-style: none;
	margin: 0;
	padding: 0;
	display: grid;
	grid-template-columns: 1fr;
	gap: 0.75rem;
}
@media (min-width: 640px) {
	.expertise-grid {
		grid-template-columns: repeat(2, 1fr);
	}
}
@media (min-width: 960px) {
	.expertise-grid {
		grid-template-columns: repeat(3, 1fr);
	}
}
.expertise-card {
	border: 1px solid var(--border);
	border-left: 3px solid var(--accent);
	border-radius: var(--radius);
	background: var(--bg-elevated);
	padding: 1.1rem 1.2rem;
	transition: border-color 0.15s ease, background 0.15s ease;
}
.expertise-card:hover {
	border-color: var(--accent);
	background: color-mix(in srgb, var(--accent) 8%, var(--bg-elevated));
}
.expertise-label {
	margin: 0;
	font-family: var(--font-body);
	font-size: 1.02rem;
	font-weight: 700;
	color: var(--fg);
}
.expertise-descriptor {
	margin: 0.4rem 0 0.75rem;
	color: var(--muted);
	font-size: 0.9rem;
	line-height: 1.45;
}
.expertise-chips {
	list-style: none;
	margin: 0;
	padding: 0;
	display: flex;
	flex-wrap: wrap;
	gap: 0.35rem;
}
.expertise-chips li {
	font-size: 0.72rem;
	font-weight: 600;
	letter-spacing: 0.02em;
	padding: 0.2rem 0.5rem;
	border: 1px solid var(--accent-dim);
	color: var(--accent);
	border-radius: var(--radius);
}
```

- [ ] **Step 3: Wire the component into the homepage**

In `src/pages/index.astro`, add the import and place `<DomainExpertise />` between `<Hero />` and `<About />`:

```astro
---
import BaseLayout from "../layouts/BaseLayout.astro";
import Hero from "../components/Hero.astro";
import DomainExpertise from "../components/DomainExpertise.astro";
import About from "../components/About.astro";
import Timeline from "../components/Timeline.astro";
import Footer from "../components/Footer.astro";
import { site } from "../site.config";
---

<BaseLayout title={`${site.name} - ${site.title}`} description={site.description}>
	<Hero />
	<DomainExpertise />
	<About />
	<Timeline />
	<Footer />
</BaseLayout>
```

- [ ] **Step 4: Verify build + types**

Run: `pnpm run check`
Expected: PASS.

Run: `pnpm run build`
Expected: build succeeds; `dist/index.html` contains the text "Fintech domain expertise" and "Cross-border & Stablecoins".

- [ ] **Step 5: Visual smoke-check**

Run: `pnpm run dev` and open `http://localhost:4321`.
Expected: a "Fintech domain expertise" section appears directly under the hero, showing 6 cards in a responsive grid (1 column on mobile, 3 on desktop), each with a label, descriptor, and accent-colored company chips. Confirm at a narrow (~375px) and wide (~1280px) viewport.

- [ ] **Step 6: Commit**

```bash
git add src/components/DomainExpertise.astro src/pages/index.astro src/styles/global.css
git commit -m "feat: add fintech domain expertise section"
```

---

### Task 4: Enrich fintech role content

**Files:**
- Modify: `src/content/roles/picpay.md` (body + `summary` only)
- Modify: `src/content/roles/kanastra.md` (body + `summary` only)
- Modify: `src/content/roles/conduit.md` (body + `summary` only)

**Interfaces:**
- Consumes: nothing new.
- Produces: nothing new — same frontmatter shape, richer prose. Validated by the existing `roles` collection schema.

Do NOT touch `metrics`, `projects`, `stack`, `order`, `start`, `end`, `present`, `location`, `company`, or `title`. Only the `summary` field and the markdown body (the bullet list after the `---`) change.

- [ ] **Step 1: PicPay — update summary and body**

In `src/content/roles/picpay.md`, change the `summary` line to:

```yaml
summary: Led benefits & credit fintech products — receivables-backed and corporate cards, payroll, salary advance — and scaled backend orgs for 20M+ users.
```

Replace the three body bullets (lines after the closing `---`) with:

```markdown
- Architected a receivables-backed Flexible Benefits credit card and a Corporate credit card, integrating issuer, card-network, and registradora (receivables registry) flows.
- Built Payroll and Salary Advance (antecipação salarial) products on top of the benefits rails.
- Defined architectural roadmaps and led Backend Chapters across 50+ engineers; delivered card products on PostgreSQL, Redis, Kafka, and Kubernetes.
```

- [ ] **Step 2: Kanastra — update summary and body**

In `src/content/roles/kanastra.md`, change the `summary` line to:

```yaml
summary: Banking-as-a-Service; architected the core lending platform issuing CCB, commercial notes, and debentures, with durable financial workflows and FIDC operations.
```

Replace the three body bullets with:

```markdown
- Architected the firm's core lending platform from the ground up to originate and issue multiple credit instruments — CCB, commercial notes (nota comercial), and debentures.
- Worked across FIDC structures and capital-markets operations; pioneered Temporal.io for durable, fully auditable long-running financial workflows.
- Introduced formal SDLC, Jira metrics, and performance benchmarks in the Definition of Done.
```

- [ ] **Step 3: Conduit — update summary and body**

In `src/content/roles/conduit.md`, change the `summary` line to:

```yaml
summary: Built a cross-border money-movement orchestrator across multiple banking integrations and stablecoin settlement; core backend modernization and observability.
```

Replace the three body bullets with:

```markdown
- Built an orchestrator that moves money across borders through multiple banking integrations and stablecoin rails, with a focus on ledger integrity and reliable settlement.
- Refactored and modernized core backend services for data integrity and service-to-service communication.
- Established Datadog dashboards, alerting, and logging standards across critical applications.
```

- [ ] **Step 4: Verify content schema**

Run: `pnpm run check`
Expected: PASS (all role frontmatter still valid).

Run: `pnpm run test`
Expected: PASS (role schema vitest suite green).

- [ ] **Step 5: Commit**

```bash
git add src/content/roles/picpay.md src/content/roles/kanastra.md src/content/roles/conduit.md
git commit -m "feat: enrich fintech role content with precise instrument vocabulary"
```

---

## Self-Review

**Spec coverage:**
- Spec change 1 (hero + meta copy) → Task 1. ✓
- Spec change 2 (DomainExpertise section, data file, placement after hero, 6 buckets, chips, English-only) → Tasks 2 + 3. ✓
- Spec change 3 (role enrichment, schema intact, fintech roles only) → Task 4. ✓
- Verification (`check`, `test`, visual smoke-check) → present in Tasks 1–4. ✓
- Non-goals respected: no Hero layout change, no schema change, no language toggle, no anatomy map. ✓

**Placeholder scan:** No TBD/TODO/"add error handling" placeholders — all copy and CSS is literal and complete.

**Type consistency:** `Domain` interface (`label`, `descriptor`, `chips`) defined in Task 2 and consumed identically in Task 3's component (`domain.label`, `domain.descriptor`, `domain.chips`). Import path `../data/domains.ts` matches the created file path. `<DomainExpertise />` import in Task 3 matches the created component path. CSS class names in the component (`expertise`, `expertise-inner`, `expertise-card`, `expertise-label`, `expertise-descriptor`, `expertise-chips`) all have matching rules in the appended global.css block.
