# Wow Factor Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the static portfolio into a technically impressive, interactive experience with a particle constellation hero, scroll-triggered reveals, animated metric counters, and a scroll-driven timeline pipeline.

**Architecture:** All animations are vanilla JS + CSS — zero new npm dependencies. A shared `IntersectionObserver` utility handles scroll reveals. The particle system runs on Canvas2D with `requestAnimationFrame`. Scroll-linked timeline uses a throttled scroll listener. Everything respects `prefers-reduced-motion`.

**Tech Stack:** Astro 6, vanilla TypeScript/JS, Canvas2D, CSS transitions/animations

---

## Task 1: Scroll Reveal Foundation

This utility is used by Tasks 3 and 4. Build it first.

**Files:**
- Modify: `src/styles/global.css` (append at end, before the `/* 404 */` section)
- Modify: `src/layouts/BaseLayout.astro` (add script before closing `</body>`)
- Modify: `src/components/About.astro` (add `data-reveal` attributes)
- Modify: `src/components/Footer.astro` (add `data-reveal` attributes)

### Step 1: Add reveal CSS to global.css

Insert the following CSS in `src/styles/global.css` **immediately before** the `/* 404 */` comment (line 506):

```css
/* Scroll reveal */
[data-reveal] {
	opacity: 0;
	transform: translateY(30px);
	transition: opacity 0.6s ease-out, transform 0.6s ease-out;
	transition-delay: var(--reveal-delay, 0ms);
}
[data-reveal].revealed {
	opacity: 1;
	transform: translateY(0);
}
@media (prefers-reduced-motion: reduce) {
	[data-reveal] {
		opacity: 1;
		transform: none;
		transition: none;
	}
}
```

### Step 2: Add reveal JS to BaseLayout.astro

In `src/layouts/BaseLayout.astro`, add this `<script>` block right before the closing `</body>` tag:

```html
<script>
	const revealEls = document.querySelectorAll<HTMLElement>("[data-reveal]");
	if (revealEls.length > 0) {
		const ro = new IntersectionObserver(
			(entries) => {
				entries.forEach((e) => {
					if (e.isIntersecting) {
						(e.target as HTMLElement).classList.add("revealed");
						ro.unobserve(e.target);
					}
				});
			},
			{ threshold: 0.15 },
		);
		revealEls.forEach((el) => ro.observe(el));
	}
</script>
```

### Step 3: Add data-reveal to About section

In `src/components/About.astro`, make these changes:

On the `<section>` tag (line 4), add `data-reveal`:
```html
<section id="about" class="about" aria-labelledby="about-heading" data-reveal>
```

On the `<div class="about-left">` (line 6), add `data-reveal` with delay:
```html
<div class="about-left" data-reveal style="--reveal-delay: 100ms">
```

On the `<div class="about-right">` (line 19), add `data-reveal` with delay:
```html
<div class="about-right" aria-label="Impact metrics" data-reveal style="--reveal-delay: 200ms">
```

### Step 4: Add data-reveal to Footer/Contact section

In `src/components/Footer.astro`, add `data-reveal` to the contact section (line 7):
```html
<section id="contact" aria-labelledby="contact-heading" data-reveal>
```

### Step 5: Verify reveals work

Run: `npm run dev`
Expected: Open `http://localhost:4321`. Scroll down — About and Contact sections should fade in and slide up as they enter the viewport. If `prefers-reduced-motion` is on, they appear instantly.

### Step 6: Commit

```bash
git add src/styles/global.css src/layouts/BaseLayout.astro src/components/About.astro src/components/Footer.astro
git commit -m "feat: add scroll-triggered reveal animation system"
```

---

## Task 2: Hero Particle Constellation Canvas

**Files:**
- Modify: `src/components/Hero.astro` (restructure to full-viewport + canvas)
- Modify: `src/styles/global.css` (replace hero CSS + add entrance animation)

### Step 1: Replace Hero.astro with full-viewport particle canvas hero

Replace the entire contents of `src/components/Hero.astro` with:

```astro
---
import { site } from "../site.config";

const resumeHref = site.resumePath;
---

<section id="hero" class="hero" aria-labelledby="hero-heading">
	<canvas id="particle-canvas" aria-hidden="true"></canvas>
	<div class="hero-content">
		<div class="hero-visual" data-hero-entrance style="--hero-delay: 0ms">
			<div class="hero-frame">
				<img
					src="/images/headshot.JPG"
					alt="André Ribeiro"
					width="200"
					height="200"
					fetchpriority="high"
				/>
			</div>
		</div>
		<div class="hero-copy">
			<p class="hero-role" data-hero-entrance style="--hero-delay: 150ms">{site.title}</p>
			<h1 id="hero-heading" data-hero-entrance style="--hero-delay: 300ms">{site.name}</h1>
			<p class="hero-tagline" data-hero-entrance style="--hero-delay: 450ms">
				{site.tagline}
			</p>
			<ul class="ctas" data-hero-entrance style="--hero-delay: 600ms">
				<li>
					<a class="primary" href={site.linkedin} target="_blank" rel="noopener noreferrer"
						>LinkedIn</a
					>
				</li>
				<li>
					<a href={site.github} target="_blank" rel="noopener noreferrer">GitHub</a>
				</li>
				<li>
					<a href={`mailto:${site.email}`}>Email</a>
				</li>
				<li>
					<a href={resumeHref}>Résumé PDF</a>
				</li>
				<li>
					<a href="#work">View work ↓</a>
				</li>
			</ul>
		</div>
	</div>

	<script>
		(() => {
			const canvas = document.getElementById("particle-canvas") as HTMLCanvasElement | null;
			if (!canvas) return;
			const ctx = canvas.getContext("2d");
			if (!ctx) return;

			const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
			const dpr = window.devicePixelRatio || 1;
			const isMobile = window.innerWidth < 768;
			const PARTICLE_COUNT = isMobile ? 60 : 120;
			const CONNECTION_DIST = isMobile ? 120 : 150;
			const MOUSE_RADIUS = 200;
			const ACCENT = { r: 232, g: 165, b: 75 };

			let width = 0;
			let height = 0;
			let isVisible = true;
			let rafId = 0;
			const mouse = { x: -9999, y: -9999 };

			interface Particle {
				x: number;
				y: number;
				vx: number;
				vy: number;
				size: number;
				opacity: number;
			}

			let particles: Particle[] = [];

			function resize() {
				const rect = canvas!.parentElement!.getBoundingClientRect();
				width = rect.width;
				height = rect.height;
				canvas!.width = width * dpr;
				canvas!.height = height * dpr;
				canvas!.style.width = width + "px";
				canvas!.style.height = height + "px";
				ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
			}

			function createParticles() {
				particles = [];
				for (let i = 0; i < PARTICLE_COUNT; i++) {
					particles.push({
						x: Math.random() * width,
						y: Math.random() * height,
						vx: (Math.random() - 0.5) * 0.4,
						vy: (Math.random() - 0.5) * 0.4,
						size: Math.random() * 1.5 + 0.8,
						opacity: Math.random() * 0.4 + 0.2,
					});
				}
			}

			function update() {
				for (const p of particles) {
					const dx = mouse.x - p.x;
					const dy = mouse.y - p.y;
					const dist = Math.sqrt(dx * dx + dy * dy);
					if (dist < MOUSE_RADIUS && dist > 0) {
						const force = ((MOUSE_RADIUS - dist) / MOUSE_RADIUS) * 0.015;
						p.vx += (dx / dist) * force;
						p.vy += (dy / dist) * force;
					}

					p.vx *= 0.99;
					p.vy *= 0.99;
					p.x += p.vx;
					p.y += p.vy;

					if (p.x < 0) p.x = width;
					if (p.x > width) p.x = 0;
					if (p.y < 0) p.y = height;
					if (p.y > height) p.y = 0;
				}
			}

			function draw() {
				ctx!.clearRect(0, 0, width, height);
				const { r, g, b } = ACCENT;

				for (let i = 0; i < particles.length; i++) {
					for (let j = i + 1; j < particles.length; j++) {
						const dx = particles[i].x - particles[j].x;
						const dy = particles[i].y - particles[j].y;
						const dist = Math.sqrt(dx * dx + dy * dy);
						if (dist < CONNECTION_DIST) {
							const alpha = (1 - dist / CONNECTION_DIST) * 0.25;
							ctx!.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
							ctx!.lineWidth = 0.8;
							ctx!.beginPath();
							ctx!.moveTo(particles[i].x, particles[i].y);
							ctx!.lineTo(particles[j].x, particles[j].y);
							ctx!.stroke();
						}
					}
				}

				for (const p of particles) {
					const dx = mouse.x - p.x;
					const dy = mouse.y - p.y;
					const dist = Math.sqrt(dx * dx + dy * dy);
					if (dist < MOUSE_RADIUS) {
						const alpha = (1 - dist / MOUSE_RADIUS) * 0.35;
						ctx!.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
						ctx!.lineWidth = 0.6;
						ctx!.beginPath();
						ctx!.moveTo(mouse.x, mouse.y);
						ctx!.lineTo(p.x, p.y);
						ctx!.stroke();
					}
				}

				for (const p of particles) {
					ctx!.fillStyle = `rgba(${r},${g},${b},${p.opacity})`;
					ctx!.beginPath();
					ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2);
					ctx!.fill();
				}
			}

			function animate() {
				if (!isVisible) return;
				update();
				draw();
				rafId = requestAnimationFrame(animate);
			}

			if (prefersReduced) {
				resize();
				createParticles();
				draw();
			} else {
				resize();
				createParticles();
				animate();

				canvas.addEventListener("mousemove", (e: MouseEvent) => {
					const rect = canvas!.getBoundingClientRect();
					mouse.x = e.clientX - rect.left;
					mouse.y = e.clientY - rect.top;
				});

				canvas.addEventListener("mouseleave", () => {
					mouse.x = -9999;
					mouse.y = -9999;
				});

				window.addEventListener("resize", () => {
					resize();
					createParticles();
				});

				new IntersectionObserver(
					([entry]) => {
						isVisible = entry.isIntersecting;
						if (isVisible) {
							cancelAnimationFrame(rafId);
							animate();
						}
					},
					{ threshold: 0 },
				).observe(canvas);
			}
		})();
	</script>
</section>
```

### Step 2: Replace hero CSS in global.css

In `src/styles/global.css`, replace the entire `/* Hero */` section (lines 118–215) with:

```css
/* Hero */
.hero {
	position: relative;
	min-height: 100dvh;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 6rem var(--space) 4rem;
	border-bottom: 1px solid var(--border);
	overflow: hidden;
}

#particle-canvas {
	position: absolute;
	inset: 0;
	width: 100%;
	height: 100%;
	z-index: 0;
}

.hero-content {
	position: relative;
	z-index: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	text-align: center;
	gap: 1.5rem;
	max-width: 48rem;
}

.hero-visual {
	position: relative;
}
.hero-frame {
	position: relative;
	border: 3px solid var(--accent);
	border-radius: 50%;
	padding: 0;
	background: var(--bg-elevated);
	overflow: hidden;
	box-shadow:
		0 0 30px rgba(232, 165, 75, 0.15),
		0 0 60px rgba(232, 165, 75, 0.05);
}
.hero-frame img {
	display: block;
	width: 200px;
	height: 200px;
	object-fit: cover;
}

.hero-copy {
	display: flex;
	flex-direction: column;
	align-items: center;
}
.hero-copy h1 {
	font-family: var(--font-display);
	font-size: clamp(2.5rem, 6vw, 3.75rem);
	font-weight: 400;
	line-height: 1.1;
	margin: 0 0 0.5rem;
	letter-spacing: -0.02em;
}
.hero-role {
	font-size: 0.9rem;
	font-weight: 600;
	color: var(--accent);
	margin: 0 0 0.75rem;
	text-transform: uppercase;
	letter-spacing: 0.14em;
}
.hero-tagline {
	color: var(--muted);
	margin: 0 0 1.75rem;
	max-width: var(--max);
}

.ctas {
	list-style: none;
	margin: 0;
	padding: 0;
	display: flex;
	flex-wrap: wrap;
	justify-content: center;
	gap: 0.75rem;
}
.ctas a {
	display: inline-flex;
	align-items: center;
	padding: 0.6rem 1.1rem;
	font-size: 0.9rem;
	font-weight: 600;
	text-decoration: none;
	border-radius: var(--radius);
	border: 1px solid var(--border);
	color: var(--fg);
	background: color-mix(in srgb, var(--bg) 70%, transparent);
	backdrop-filter: blur(8px);
	transition: border-color 0.15s, color 0.15s, background 0.15s;
}
.ctas a:hover,
.ctas a:focus-visible {
	border-color: var(--accent);
	color: var(--accent);
}
.ctas a.primary {
	background: var(--accent);
	color: var(--bg);
	border-color: var(--accent);
}
.ctas a.primary:hover,
.ctas a.primary:focus-visible {
	background: var(--accent-dim);
	border-color: var(--accent-dim);
	color: var(--bg);
}
.ctas a:focus-visible {
	outline: 2px solid var(--accent);
	outline-offset: 2px;
}

/* Hero entrance animation */
@keyframes heroFadeIn {
	from {
		opacity: 0;
		transform: translateY(24px);
		filter: blur(6px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
		filter: blur(0);
	}
}
[data-hero-entrance] {
	opacity: 0;
	animation: heroFadeIn 0.8s ease-out both;
	animation-delay: var(--hero-delay, 0ms);
}
@media (prefers-reduced-motion: reduce) {
	[data-hero-entrance] {
		opacity: 1;
		animation: none;
		filter: none;
		transform: none;
	}
}
```

### Step 3: Verify particle canvas hero

Run: `npm run dev`
Expected: Full-viewport hero with floating accent-colored particles and connection lines. Mouse interaction creates attraction + extra connection lines. Content fades in with staggered blur animation. On mobile-width viewport, fewer particles.

### Step 4: Commit

```bash
git add src/components/Hero.astro src/styles/global.css
git commit -m "feat: add interactive particle constellation hero with entrance animations"
```

---

## Task 3: Animated Metrics Counter

**Files:**
- Modify: `src/components/About.astro` (add counter data attributes + script)
- Modify: `src/styles/global.css` (add metric landing animation)

### Step 1: Replace About.astro with counter-enabled version

Replace the entire contents of `src/components/About.astro` with:

```astro
---
---

<section id="about" class="about" aria-labelledby="about-heading" data-reveal>
	<div class="about-inner">
		<div class="about-left" data-reveal style="--reveal-delay: 100ms">
			<h2 id="about-heading">What I optimize for</h2>
			<p class="about-lead">
				I build backend systems that stay correct under load and survive failure.
			</p>
			<p class="about-body">
				I also scale engineering orgs through SDLC standards, technical roadmaps, and
				ownership-driven execution.
			</p>
			<blockquote class="about-quote">
				<p>Observability is the mix that keeps every service in sync.</p>
			</blockquote>
		</div>

		<div class="about-right" aria-label="Impact metrics" data-reveal style="--reveal-delay: 200ms">
			<div class="about-metrics">
				<div class="metric" data-reveal style="--reveal-delay: 300ms">
					<div class="metric-value" data-count-to="20" data-count-suffix="M+" data-count-decimals="0">
						0
					</div>
					<div class="metric-label">active users supported in production</div>
				</div>
				<div class="metric" data-reveal style="--reveal-delay: 400ms">
					<div
						class="metric-value"
						data-count-to="99.99"
						data-count-suffix="%"
						data-count-decimals="2"
					>
						0
					</div>
					<div class="metric-label">uptime on critical backend systems</div>
				</div>
				<div class="metric" data-reveal style="--reveal-delay: 500ms">
					<div class="metric-value metric-scale">
						<span class="metric-scale-from">1</span>
						<span class="metric-scale-arrow">&nbsp;→&nbsp;</span>
						<span data-count-to="50" data-count-suffix="+" data-count-decimals="0">0</span>
					</div>
					<div class="metric-label">engineers scaled across teams</div>
				</div>
			</div>

			<p class="about-right-sub">
				Durable workflows, observability-first engineering, and measurable SDLC standards.
			</p>
		</div>
	</div>

	<script>
		(() => {
			function easeOutCubic(t: number): number {
				return 1 - Math.pow(1 - t, 3);
			}

			function animateValue(el: HTMLElement) {
				const target = parseFloat(el.dataset.countTo || "0");
				const suffix = el.dataset.countSuffix || "";
				const decimals = parseInt(el.dataset.countDecimals || "0", 10);
				const duration = 2000;
				const start = performance.now();

				function tick(now: number) {
					const elapsed = now - start;
					const progress = Math.min(elapsed / duration, 1);
					const value = target * easeOutCubic(progress);
					el.textContent = value.toFixed(decimals) + suffix;
					if (progress < 1) {
						requestAnimationFrame(tick);
					} else {
						el.textContent = target.toFixed(decimals) + suffix;
						el.closest(".metric")?.classList.add("metric-landed");
					}
				}

				requestAnimationFrame(tick);
			}

			const counters = document.querySelectorAll<HTMLElement>("[data-count-to]");
			const observer = new IntersectionObserver(
				(entries) => {
					entries.forEach((entry) => {
						if (entry.isIntersecting) {
							animateValue(entry.target as HTMLElement);
							observer.unobserve(entry.target);
						}
					});
				},
				{ threshold: 0.5 },
			);
			counters.forEach((el) => observer.observe(el));
		})();
	</script>
</section>
```

### Step 2: Add metric landing animation CSS

In `src/styles/global.css`, add the following right after the existing `.about-right-sub` rule (after line 308):

```css
.metric-landed {
	animation: metricLand 0.3s ease-out;
}
@keyframes metricLand {
	0% { transform: scale(1); }
	50% { transform: scale(1.05); }
	100% { transform: scale(1); }
}
.metric-scale-arrow {
	display: inline-block;
	color: var(--muted);
}
```

### Step 3: Verify counters

Run: `npm run dev`
Expected: Scroll to About section. Metrics fade in (via reveal), then numbers count up from 0 to their targets over ~2 seconds with an ease-out curve. The "1 → 50+" metric shows 1 and arrow statically, while 50+ counts up. Each metric gets a subtle scale bump when counting finishes.

### Step 4: Commit

```bash
git add src/components/About.astro src/styles/global.css
git commit -m "feat: add animated metric counters with ease-out counting"
```

---

## Task 4: Timeline Pipeline Animation

**Files:**
- Modify: `src/components/Timeline.astro` (add pipeline track, wrap entries with nodes)
- Modify: `src/styles/global.css` (add pipeline CSS, smooth details)

### Step 1: Replace Timeline.astro with pipeline version

Replace the entire contents of `src/components/Timeline.astro` with:

```astro
---
import { getCollection } from "astro:content";
import RoleCard from "./RoleCard.astro";

const roles = (await getCollection("roles")).sort(
	(a, b) => a.data.order - b.data.order,
);
---

<section id="work" aria-labelledby="work-heading" data-reveal>
	<div class="work-top">
		<h2 id="work-heading" data-reveal style="--reveal-delay: 100ms">Work</h2>
		<div id="work-now" class="work-now" aria-live="polite" data-reveal style="--reveal-delay: 200ms">
			<div class="work-now-label">Highlights</div>
			<div class="work-now-text">Expand a role to preview key outcomes.</div>
		</div>
	</div>
	<div class="timeline" id="timeline">
		<div class="pipeline-track" aria-hidden="true">
			<div class="pipeline-fill" id="pipeline-fill"></div>
		</div>
		{
			roles.map((entry) => (
				<div
					class="timeline-entry"
					data-current={entry.data.present ? "true" : undefined}
				>
					<div class="pipeline-node" aria-hidden="true" />
					<RoleCard entry={entry} />
				</div>
			))
		}
	</div>

	<script>
		(() => {
			/* --- Highlights panel (existing logic) --- */
			const now = document.getElementById("work-now");
			if (!now) return;
			const textEl = now.querySelector<HTMLElement>(".work-now-text");
			if (!textEl) return;
			const detailsList = Array.from(
				document.querySelectorAll<HTMLDetailsElement>("#work details"),
			);

			const updateFromDetails = (d: HTMLDetailsElement) => {
				const summary = d.querySelector<HTMLElement>("summary");
				if (!summary) return;
				const company =
					summary.querySelector<HTMLElement>(".company")?.textContent?.trim() ?? "";
				const title =
					summary.querySelector<HTMLElement>(".title")?.textContent?.trim() ?? "";
				const meta =
					summary.querySelector<HTMLElement>(".meta")?.textContent?.trim() ?? "";
				const hook =
					summary.querySelector<HTMLElement>(".hook")?.textContent?.trim() ?? "";
				const metric =
					d.querySelector<HTMLElement>(".metrics li")?.textContent?.trim() ?? "";
				const heading = [company, title].filter(Boolean).join(" — ");
				const outcome = metric || hook || meta;
				if (heading || outcome) {
					now.classList.add("is-active");
					textEl.textContent = [heading, outcome].filter(Boolean).join(": ");
				}
			};

			const reset = () => {
				now.classList.remove("is-active");
				textEl.textContent = "Expand a role to preview key outcomes.";
			};

			detailsList.forEach((d) => {
				d.addEventListener("toggle", () => {
					if (d.open) updateFromDetails(d);
					else {
						const anyOpen = detailsList.some((x) => x.open);
						if (!anyOpen) reset();
					}
				});
			});

			/* --- Pipeline scroll animation --- */
			const timeline = document.getElementById("timeline");
			const fill = document.getElementById("pipeline-fill");
			const nodes = document.querySelectorAll<HTMLElement>(".pipeline-node");

			if (!timeline || !fill) return;

			const updatePipeline = () => {
				const rect = timeline.getBoundingClientRect();
				const trigger = window.innerHeight * 0.65;
				const progress = Math.max(0, Math.min(1, (trigger - rect.top) / rect.height));
				fill.style.transform = `scaleY(${progress})`;

				nodes.forEach((node) => {
					const nodeRect = node.getBoundingClientRect();
					if (nodeRect.top < trigger) {
						node.classList.add("active");
					}
				});
			};

			let ticking = false;
			const onScroll = () => {
				if (!ticking) {
					requestAnimationFrame(() => {
						updatePipeline();
						ticking = false;
					});
					ticking = true;
				}
			};

			window.addEventListener("scroll", onScroll, { passive: true });
			updatePipeline();

			/* --- Smooth details expansion --- */
			document.querySelectorAll<HTMLDetailsElement>(".role-card details").forEach((details) => {
				const summary = details.querySelector("summary");
				const body = details.querySelector<HTMLElement>(".role-body");
				if (!summary || !body) return;

				summary.addEventListener("click", (e) => {
					e.preventDefault();
					if (details.open) {
						body.style.height = body.scrollHeight + "px";
						body.offsetHeight; // force reflow
						body.style.height = "0";
						body.style.overflow = "hidden";
						body.addEventListener(
							"transitionend",
							() => {
								details.open = false;
								body.style.height = "";
								body.style.overflow = "";
							},
							{ once: true },
						);
					} else {
						details.open = true;
						const h = body.scrollHeight;
						body.style.height = "0";
						body.style.overflow = "hidden";
						body.offsetHeight; // force reflow
						body.style.height = h + "px";
						body.addEventListener(
							"transitionend",
							() => {
								body.style.height = "";
								body.style.overflow = "";
							},
							{ once: true },
						);
					}
				});
			});
		})();
	</script>
</section>
```

### Step 2: Update timeline CSS in global.css

In `src/styles/global.css`, replace the existing `.timeline` rule (around line 357–361):

```css
.timeline {
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
}
```

with the following:

```css
.timeline {
	position: relative;
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
	padding-left: 2.5rem;
}
.pipeline-track {
	position: absolute;
	left: 0.875rem;
	top: 0;
	bottom: 0;
	width: 2px;
	background: var(--border);
	overflow: hidden;
}
.pipeline-fill {
	width: 100%;
	height: 100%;
	background: var(--accent);
	transform-origin: top;
	transform: scaleY(0);
}
.timeline-entry {
	position: relative;
}
.pipeline-node {
	position: absolute;
	left: calc(-2.5rem + 0.875rem - 5px);
	top: 1.5rem;
	width: 12px;
	height: 12px;
	border-radius: 50%;
	background: var(--border);
	border: 2px solid var(--bg);
	z-index: 2;
	transition: background 0.3s ease, box-shadow 0.3s ease;
}
.pipeline-node.active {
	background: var(--accent);
	box-shadow: 0 0 10px rgba(232, 165, 75, 0.5);
}
.timeline-entry[data-current] .pipeline-node.active {
	animation: nodePulse 2s ease-in-out infinite;
}
@keyframes nodePulse {
	0%,
	100% {
		box-shadow: 0 0 8px rgba(232, 165, 75, 0.4);
	}
	50% {
		box-shadow: 0 0 20px rgba(232, 165, 75, 0.8);
	}
}
```

### Step 3: Add smooth details transition CSS

In `src/styles/global.css`, add to the `.role-body` rule (around line 414):

Replace:
```css
.role-body {
	padding: 0 1.5rem 1.5rem;
	border-top: 1px solid var(--border);
}
```

With:
```css
.role-body {
	padding: 0 1.5rem 1.5rem;
	border-top: 1px solid var(--border);
	transition: height 0.3s ease-out;
}
```

### Step 4: Verify pipeline animation

Run: `npm run dev`
Expected: The Work section has a vertical line on the left that draws itself downward as you scroll. Nodes at each role glow when the line reaches them. The current role's node pulses continuously. Expanding a details card smoothly animates open. Highlights panel still works.

### Step 5: Commit

```bash
git add src/components/Timeline.astro src/styles/global.css
git commit -m "feat: add scroll-driven timeline pipeline with animated nodes"
```

---

## Task 5: Final Polish & Verification

**Files:**
- All modified files from Tasks 1–4

### Step 1: Run type check

Run: `npm run check`
Expected: No errors. If there are TypeScript issues in the inline `<script>` tags, fix them.

### Step 2: Run build

Run: `npm run build`
Expected: Clean build with no errors.

### Step 3: Run tests

Run: `npm run test`
Expected: All existing tests pass (the Zod schema tests should be unaffected).

### Step 4: Visual smoke test

Run: `npm run preview`
Test the following in the browser:
1. Hero: particles animate, mouse interaction works, entrance animations play
2. Scroll reveals: About, Work heading, Contact sections fade in on scroll
3. Metrics: numbers count up when scrolled into view
4. Timeline: pipeline line draws on scroll, nodes glow, details expand smoothly
5. Mobile: resize to mobile width — fewer particles, layout still works
6. Reduced motion: enable `prefers-reduced-motion` in dev tools — all animations disabled, content visible immediately

### Step 5: Commit any fixes

```bash
git add -A
git commit -m "chore: polish and fix any issues from visual QA"
```
