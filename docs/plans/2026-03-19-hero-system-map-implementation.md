# Hero System Map Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the current plain Canvas particle hero with a high-energy, evolving, mouse-reactive WebGL system map, and update hero positioning copy to be cross-industry.

**Architecture:** Keep Astro page structure intact, but extract hero animation into a dedicated client module (`src/scripts/hero-system-map.ts`) powered by Three.js. `Hero.astro` mounts/disposes the scene and preserves semantic content/CTAs. `global.css` adds readability overlays and scene layering. Reduced-motion and WebGL fallback paths are mandatory.

**Tech Stack:** Astro 6, TypeScript, Three.js, vanilla CSS, `@superpowers:test-driven-development`

---

### Task 1: Add Three.js Dependency and Create Animation Module Skeleton

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `src/scripts/hero-system-map.ts`

**Step 1: Add Three.js dependency**

Run: `npm install three`
Expected: `package.json` includes `three` in dependencies and lockfile updates.

**Step 2: Create module skeleton**

Create `src/scripts/hero-system-map.ts` with this baseline API:

```ts
export interface HeroSystemMapOptions {
  container: HTMLElement;
  reducedMotion: boolean;
}

export interface HeroSystemMapController {
  start: () => void;
  stop: () => void;
  resize: () => void;
  dispose: () => void;
}

export function createHeroSystemMap(
  options: HeroSystemMapOptions
): HeroSystemMapController {
  // Temporary stub, implementation in Task 3.
  return {
    start() {},
    stop() {},
    resize() {},
    dispose() {},
  };
}
```

**Step 3: Verify type safety**

Run: `npm run check`
Expected: PASS, no type errors.

**Step 4: Commit**

```bash
git add package.json package-lock.json src/scripts/hero-system-map.ts
git commit -m "feat: add three.js and hero system map module scaffold"
```

---

### Task 2: Update Tagline and Prepare Hero Mount Structure

**Files:**
- Modify: `src/site.config.ts`
- Modify: `src/components/Hero.astro`

**Step 1: Update tagline copy**

In `src/site.config.ts`, change:

```ts
tagline: "18+ years · Distributed systems · Fintech · Technical leadership",
```

to:

```ts
tagline: "18+ years · Scalable systems · Technical leadership",
```

**Step 2: Replace old canvas id and add scene mount wrapper**

In `src/components/Hero.astro`:
- Replace `id="particle-canvas"` with a new mount element id (for example `id="hero-system-map"`).
- Keep hero copy and image structure unchanged.
- Remove old inline particle implementation block (large script), and prepare for module-based initialization.

**Step 3: Add minimal initialization script hook**

In `Hero.astro`, add a lightweight script that:
- selects `#hero` and `#hero-system-map`
- detects `prefers-reduced-motion`
- defers detailed logic to module integration in Task 3

Expected temporary script shape:

```html
<script>
  (() => {
    const hero = document.getElementById("hero");
    const mount = document.getElementById("hero-system-map");
    if (!hero || !mount) return;
  })();
</script>
```

**Step 4: Verify**

Run: `npm run check`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/site.config.ts src/components/Hero.astro
git commit -m "feat: update hero positioning copy and mount structure"
```

---

### Task 3: Implement Evolving WebGL System Map (Core Animation)

**Files:**
- Modify: `src/scripts/hero-system-map.ts`
- Modify: `src/components/Hero.astro`

**Step 1: Build core scene**

In `src/scripts/hero-system-map.ts`, implement:
- Three.js renderer, scene, camera
- node points geometry/material
- edge lines geometry/material
- animation loop (`requestAnimationFrame`)
- adaptive quality:
  - desktop higher node/edge count
  - mobile lower count

**Step 2: Add evolving topology logic**

Implement:
- cluster center drift over time
- smooth node target interpolation
- dynamic edge activation/opacity
- "flow pulse" effect (edge brightness modulation or traveling pulse state)

**Step 3: Add mouse reactivity**

Implement pointer interaction:
- local force/influence around cursor
- temporary node energy boost
- visible edge activity increase near interaction zone

**Step 4: Add lifecycle controls**

Ensure exported controller methods work:
- `start`: begin animation
- `stop`: pause animation
- `resize`: update camera/renderer sizes
- `dispose`: remove listeners, dispose materials/geometries, cancel RAF

**Step 5: Wire module in Hero.astro**

In `Hero.astro`, import and initialize module in inline script using dynamic import:

```ts
const { createHeroSystemMap } = await import("../scripts/hero-system-map");
```

Hook:
- IntersectionObserver on hero visibility (`start/stop`)
- resize listener (`resize`)
- cleanup on pagehide (`dispose`)

**Step 6: Verify**

Run: `npm run check`
Expected: PASS with no TS/Astro diagnostics.

**Step 7: Commit**

```bash
git add src/scripts/hero-system-map.ts src/components/Hero.astro
git commit -m "feat: add evolving mouse-reactive webgl hero system map"
```

---

### Task 4: Add Hero Readability and Motion/Fallback Guards

**Files:**
- Modify: `src/styles/global.css`
- Modify: `src/components/Hero.astro`

**Step 1: Add readability overlay styles**

In `src/styles/global.css`, update hero styles:
- replace/augment old `#particle-canvas` styles with `#hero-system-map`
- add pseudo-overlay or dedicated overlay element behind text to protect contrast
- keep hero content z-index above scene

Add rules for:
- `.hero-scene` / `#hero-system-map`
- `.hero-overlay` (vignette/gradient)
- optional glow constraints through opacity variables

**Step 2: Preserve reduced-motion behavior**

In `Hero.astro` init logic:
- if reduced motion is true, initialize static/low-motion mode
- or skip animation and render minimal static frame

In CSS:
- ensure entrance animations remain reduced-motion safe.

**Step 3: Add WebGL fallback path**

In `Hero.astro`:
- detect WebGL support or catch initialization failure
- fallback to simple static hero background class (no crash)

**Step 4: Verify**

Run: `npm run check`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/styles/global.css src/components/Hero.astro
git commit -m "feat: add hero readability overlays and motion fallback guards"
```

---

### Task 5: End-to-End Validation and Regression Check

**Files:**
- Verify all modified files from Tasks 1-4

**Step 1: Run validation commands**

Run: `npm run check`
Expected: PASS.

Run: `npm run test`
Expected: PASS (existing tests unaffected).

Run: `npm run build`
Expected: PASS, static pages generated in `dist`.

**Step 2: Manual QA checklist**

Run: `npm run dev` and verify:
- Hero background is visibly richer and evolves continuously.
- Mouse interaction produces clear local response.
- Tagline displays exactly: `18+ years · Scalable systems · Technical leadership`.
- Text/CTA readability remains strong at all times.
- Existing timeline, metrics, and section reveals still work.
- Mobile viewport shows reduced complexity but still polished.
- `prefers-reduced-motion` disables aggressive motion.
- No console errors during resize, tab switch, or navigation refresh.

**Step 3: Commit polish fixes**

```bash
git add -A
git commit -m "chore: polish hero system map performance and regressions"
```

