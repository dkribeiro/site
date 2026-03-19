# Wow Factor — Interactive & Animated Redesign

**Goal:** Transform a static portfolio into a technically impressive, interactive experience that signals "this person is an elite engineer" on first visit.

**Approach:** Hero-focused big moment + 3 scroll-driven enhancements throughout. All vanilla JS/CSS — zero new dependencies.

---

## 1. Hero — Interactive Particle Constellation

Full-viewport canvas behind name, title, and CTAs.

- ~120 particles with gentle drift, wrapping at edges
- Particles within threshold distance connect with lines (opacity fades with distance) — creates a network/graph topology
- Mouse cursor acts as gravity attractor: nearby particles pull toward it, extra lines draw from cursor to nearby nodes
- Mobile fallback: no mouse interaction, gentle breathing oscillation instead
- Colors: accent `#e8a54b` particles/lines on dark `#0c0c0f` background, varying opacity for depth
- Name and tagline entrance animation: fade up + blur clear on first load
- Tech: Vanilla Canvas2D, ~150 lines JS, `requestAnimationFrame` loop, `devicePixelRatio` for crisp rendering
- Performance: pauses via `IntersectionObserver` when hero is off-screen

## 2. Scroll-Triggered Section Reveals

Each major section (About, Work, Contact) animates into view on scroll.

- Sections start invisible + shifted ~30px down
- At ~15% viewport intersection: fade in + slide up over ~600ms ease-out
- Child elements stagger ~100ms apart (heading, then description, then cards)
- One-shot animation — no re-trigger on scroll back up
- Respects `prefers-reduced-motion` (instant appearance, no motion)
- Tech: `IntersectionObserver` utility (~40 lines JS), `data-reveal` / `data-reveal-delay` attributes, CSS transitions via `.revealed` class, GPU-composited transforms

## 3. Animated Metrics Counter

About section numbers (20M+ users, 99.99% uptime, 1→50+ engineers) count up from zero.

- Count from 0 → target over ~2 seconds with ease-out cubic curve
- Suffixes (`M+`, `%`, `+`) stay fixed, only number animates
- Special "1→50+" treatment: 1 appears, arrow draws in, then 50+ counts up
- Cards stagger ~200ms left to right (via reveal system)
- Subtle scale bump (1.0 → 1.05 → 1.0) on count completion
- Tech: ~50 lines JS, `requestAnimationFrame` interpolation, easing: `1 - Math.pow(1 - t, 3)`, triggered by `IntersectionObserver`

## 4. Animated Timeline Pipeline

Work section timeline draws itself as you scroll.

- Vertical line on left side draws downward tied to scroll position
- Node dots at each role entry pulse with accent glow when line reaches them
- Role cards fade/slide in from right when their node activates
- Current/most recent role node pulses continuously (breathing glow)
- Smooth `<details>` expansion (CSS `interpolate-size` or JS height fallback)
- Tech: scroll listener (rAF-throttled) updating SVG `stroke-dashoffset` or CSS `scaleY`, nodes via `IntersectionObserver`, ~100 lines JS

---

## Technical Constraints

- Zero new npm dependencies — all vanilla JS + CSS
- Respect `prefers-reduced-motion` throughout
- Canvas pauses when off-screen for battery/performance
- All animations use GPU-composited properties (transform, opacity)
- Mobile-friendly: touch fallbacks, responsive canvas sizing

## Estimated Scope

| Component | ~Lines JS | ~Lines CSS |
|-----------|-----------|------------|
| Particle constellation | 150 | 20 |
| Scroll reveals | 40 | 30 |
| Metrics counter | 50 | 15 |
| Timeline pipeline | 100 | 40 |
| **Total** | **~340** | **~105** |
