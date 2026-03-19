# Hero Microservices Cluster Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the current hero particle-like background with a 2D cinematic, evolving microservices cluster visualization (mixed node types, status colors, rerouting, replication) that reacts to mouse interactions.

**Architecture:** Keep Astro hero structure intact and evolve `src/scripts/hero-system-map.ts` into a deterministic state-driven visualization module. Use Three.js rendering primitives in orthographic style for a crisp 2D dashboard look. Preserve accessibility/performance safeguards and existing hero text readability.

**Tech Stack:** Astro 6, TypeScript, Three.js, vanilla CSS, Vitest (for non-visual logic units where practical)

---

### Task 1: Define Cluster State Model and Deterministic Initialization

**Files:**
- Modify: `src/scripts/hero-system-map.ts`
- (Optional) Create: `src/scripts/hero-system-map-state.test.ts`

**Step 1: Add explicit simulation types**

In `src/scripts/hero-system-map.ts`, define:
- `NodeType = "service" | "gateway" | "queue" | "datastore"`
- `NodeStatus = "healthy" | "warning" | "critical" | "recovering"`
- `SimulationMode = "healthy" | "load_spike" | "degradation" | "healing"`

Add node/edge interfaces with fields:
- node: `id`, `type`, `status`, `basePos`, `pos`, `velocity`, `capacity`, `load`, `spawnLevel`, `clusterId`
- edge: `from`, `to`, `flowRate`, `health`, `rerouteFlag`, `pulsePhase`

**Step 2: Create deterministic seed helpers**

Implement a tiny seeded random helper inside module so initial topology is stable across reloads.

**Step 3: Create initial mixed topology**

Initialize clusters with:
- mostly `service` nodes
- a smaller set of `gateway`, `queue`, `datastore`
- rule-based baseline connections (e.g., gateway -> service -> queue/datastore)

**Step 4: Verify initialization works**

Run: `npm run check`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/scripts/hero-system-map.ts
git commit -m "feat: define deterministic microservices cluster simulation model"
```

---

### Task 2: Implement 2D Cinematic Rendering Primitives (No Particle Cloud)

**Files:**
- Modify: `src/scripts/hero-system-map.ts`

**Step 1: Replace particle point rendering**

Remove/retire particle cloud assumptions. Render:
- service nodes as small rectangular quads/sprites
- infra nodes as circles/point glyphs with distinct size
- edges as line segments with per-edge color and alpha

**Step 2: Use orthographic visual framing**

Keep 2D dashboard style:
- disable dramatic camera depth movement
- use subtle parallax only if needed
- preserve readable, crisp lines and box silhouettes

**Step 3: Add status-based color mapping**

Map statuses:
- healthy -> green
- warning -> amber
- critical -> red
- recovering -> cyan/teal transition

Edge colors derive from endpoint status and health.

**Step 4: Verify**

Run: `npm run check`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/scripts/hero-system-map.ts
git commit -m "feat: render mixed 2d microservice node primitives and status colors"
```

---

### Task 3: Implement State Machine + Mouse Interaction Modes (Left/Right Semantics)

**Files:**
- Modify: `src/scripts/hero-system-map.ts`

**Step 1: Add global simulation state machine**

Implement:
- `healthy` baseline
- `load_spike` (left-half influence)
- `degradation` (right-half influence)
- `healing` auto-transition back to healthy

Use timers/cooldowns so transitions are smooth and reversible.

**Step 2: Implement left-side behavior (load generator)**

For pointer influence in left half:
- increase nearby service load
- increment spawn intent
- create bounded replica services (spawnLevel capped)
- increase local edge flow/pulse frequency

**Step 3: Implement right-side behavior (fault injection/healing)**

For pointer influence in right half:
- degrade selected nodes (`warning` -> `critical`)
- mark failing edges and activate alternate routes (`rerouteFlag`)
- after timeout, move nodes to `recovering`, then `healthy`

**Step 4: Keep bounded complexity**

Enforce hard caps:
- max total nodes
- max spawned replicas per cluster
- max active reroute edges

**Step 5: Verify**

Run: `npm run check`
Expected: PASS.

**Step 6: Commit**

```bash
git add src/scripts/hero-system-map.ts
git commit -m "feat: add interactive load/failure/healing state machine for hero cluster"
```

---

### Task 4: Visual Polish, Readability Guardrails, and Hero Wiring

**Files:**
- Modify: `src/components/Hero.astro`
- Modify: `src/styles/global.css`
- Modify: `src/scripts/hero-system-map.ts`

**Step 1: Ensure Hero wiring remains robust**

In `Hero.astro`:
- keep dynamic import/lifecycle controls (`start`, `stop`, `resize`, `dispose`)
- ensure fallback class applies on initialization failure
- ensure intersection observer and cleanup remain leak-free

**Step 2: Strengthen readability overlays**

In `global.css`, tune:
- `.hero-overlay` gradient/vignette
- scene brightness cap
- text shadow/contrast

Goal: animation never overpowers hero text.

**Step 3: Add reduced-motion and WebGL fallback behaviors**

In module:
- reduced motion => low-frequency status updates, no aggressive replication bursts
- no WebGL => return controlled fallback (hero class applied, no runtime errors)

**Step 4: Verify**

Run: `npm run check`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/components/Hero.astro src/styles/global.css src/scripts/hero-system-map.ts
git commit -m "feat: polish hero cluster visuals with readability and fallback guardrails"
```

---

### Task 5: Regression, Performance, and Final QA

**Files:**
- Verify all modified files in Tasks 1-4

**Step 1: Run project validations**

Run: `npm run check`
Expected: PASS.

Run: `npm run test`
Expected: PASS.

Run: `npm run build`
Expected: PASS.

**Step 2: Manual behavior QA**

Run: `npm run dev` and validate:
1. Hero no longer looks like sparse particles; clear mixed node topology is visible.
2. Left-side pointer causes scale-out/load effects and denser flow.
3. Right-side pointer causes degradation, reroute visuals, and recovery.
4. Colors visibly communicate health states (green/amber/red/recovering).
5. Existing hero text remains readable at all times.
6. Mobile still performs acceptably (reduced node/edge budget).
7. Existing page interactions still work (timeline, reveals, counters).
8. Reduced-motion preference significantly calms animation.

**Step 3: Final polish commit**

```bash
git add -A
git commit -m "chore: finalize interactive microservices hero cluster and regressions"
```

