# Hero System Map Redesign

## Goal

Upgrade the hero from a plain particle graph to a high-energy, evolving, mouse-reactive system map while broadening positioning copy beyond fintech.

## Copy Direction

- Update hero tagline to:
  - `18+ years · Scalable systems · Technical leadership`
- Remove fintech-specific framing from first-impression copy so positioning stays industry-agnostic.

## Experience Direction

- Replace current static-feeling particle background with a dynamic topology visualization.
- Keep content readability protected with visual guardrails.
- Maintain existing CTA hierarchy and hero semantics.

## Architecture

### Rendering stack

- Use WebGL with Three.js for richer visual ceiling.
- Keep Astro structure as-is; mount scene in hero container.
- Isolate visualization in a dedicated client module (for example `src/scripts/hero-system-map.ts`).

### Scene layers

1. **Nodes layer**
   - Point sprites with per-node state (energy, cluster id, drift).
2. **Edges layer**
   - Dynamic line graph based on topology rules / nearest connections.
3. **Flow pulses**
   - Traveling highlights across active edges to simulate throughput.
4. **Camera/parallax**
   - Subtle reactive depth based on mouse position.

### Evolution behavior

- Cluster centers continuously shift over time.
- Topology rebalances smoothly (no hard jumps).
- Mouse interaction perturbs local regions and temporarily increases energy.

## Readability and Accessibility Guardrails

- Add gradient/vignette overlay behind text block to guarantee contrast.
- Clamp maximum glow and line alpha to avoid visual noise.
- Respect `prefers-reduced-motion` with static/low-motion variant.
- Preserve keyboard behavior and semantics for all existing interactive elements.

## Performance Strategy

- Use adaptive quality tiers by viewport/device:
  - Desktop: high node/edge budget
  - Mobile: reduced budget
- Pause animation when hero is not visible or tab is hidden.
- Lazy-load Three.js only where needed.
- Fallback to existing Canvas2D background when WebGL is unavailable.

## Integration Touchpoints

- `src/site.config.ts`
  - Update tagline string.
- `src/components/Hero.astro`
  - Provide hero mount node for WebGL scene.
  - Initialize/dispose system map module safely.
- `src/styles/global.css`
  - Add overlay/readability styles and any necessary stacking adjustments.
- New script module (planned):
  - `src/scripts/hero-system-map.ts`

## Verification Plan

1. Functional:
   - Scene mounts once, evolves continuously, and reacts to mouse.
2. Accessibility:
   - Text remains readable; reduced-motion mode works.
3. Performance:
   - Stable frame pacing on desktop; acceptable mobile behavior.
4. Resilience:
   - Resize/tab visibility transitions do not break or leak resources.
5. Regression:
   - Existing scroll reveals, metrics counters, and timeline animations still work.

## Success Criteria

- First impression feels significantly more distinctive and technically impressive.
- Motion feels intentional and high-energy, not random noise.
- Core hero content remains instantly readable.
- Positioning is clearly broad and cross-industry.

