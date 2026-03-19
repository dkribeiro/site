# Experience-Embedded Featured Projects Design

## Goal

Increase first-visit impact and hiring credibility by embedding curated, high-signal projects inside existing experience cards, using progressive disclosure to keep the page scannable.

## Scope Decision

- Use **5 featured projects** (not full LinkedIn list):
  - Lending Platform (Kanastra)
  - PicPay Corporate Credit Card
  - PicPay Beneficios
  - Rateio Digital / Gringo
  - Murexchange
- Keep projects **inside experiences** (timeline cards), not a separate projects page.
- Interaction model:
  - Role opens
  - Show one **Featured Project Preview**
  - Button/toggle reveals **Show all projects** inline accordion

## Information Architecture

1. Timeline remains primary narrative.
2. Each role card adds:
   - Featured preview (always visible when role is open)
   - Expand control with project count
   - Inline project list (hidden by default)
3. Project-to-role mapping:
   - Projects appear under associated role/company.
   - Roles with multiple projects show first as preview, all in accordion.

## Component and Data Design

### Data model

Extend role frontmatter with optional `projects` array:

- `name` (string)
- `start` (string date period text)
- `end` (string date period text, optional if present/current encoded in text)
- `summary` (string, 1-3 lines)
- `impact` (string array, 1+ bullets)
- `skills` (string array, optional)
- `link` (URL string, optional)
- `associatedWith` (string, optional if already implied by role)

### Rendering behavior

`RoleCard` continues to render current body/metrics/stack, then conditionally renders projects block:

1. If no `projects`: render nothing extra.
2. If `projects.length > 0`:
   - Render preview from first project
   - Render toggle button with count
   - Render hidden accordion containing all project cards

## Interaction and Motion

- Keep interaction inline (no modal, no route change).
- Use semantic toggle button (`aria-expanded`, `aria-controls`).
- Smooth expand/collapse animation (~250-300ms), aligned with existing motion style.
- Optional stagger on project cards when expanded.
- Respect `prefers-reduced-motion`: instant state changes, no stagger.

## Visual Language

- Reuse existing tokens (`--bg-elevated`, `--accent`, `--border`, typography).
- Featured preview:
  - Accent-left border
  - Slightly elevated background
  - Short, high-signal copy
- Project cards:
  - Compact title + dates
  - 1 impact snippet above fold
  - Skills chips and optional external CTA

## Accessibility

- Keyboard-operable toggle controls.
- Proper labeling for expandable region.
- Screen-reader friendly text for project count and state.
- Links always explicit (for example: "Visit project", "Read article").

## Error Handling and Resilience

- Missing/empty projects => no projects UI.
- Missing link => card renders without CTA.
- Bad frontmatter => fail fast via Zod schema validation.
- JS unavailable => preview still visible; expanded list can remain accessible by default fallback strategy.

## Testing Strategy

### Schema tests (`src/schemas/role.test.ts`)

- Accept role with no `projects`.
- Accept role with valid `projects`.
- Reject malformed projects:
  - missing required fields
  - wrong types for arrays/strings
  - invalid URL format when link is provided

### Manual UI tests

- Role with 0 projects: no extra block.
- Role with 1 project: preview + expand behavior correct.
- Role with multiple projects: count, toggle, and rendering correct.
- Keyboard navigation works for toggles and links.
- Mobile layout wraps cleanly.
- Reduced-motion mode disables animations.

## Implementation Notes

- Prioritize content quality over quantity.
- Keep summaries concise and outcome-first.
- Avoid adding all historical projects initially; keep extension path simple.
- Preserve timeline readability as top priority.

## Success Criteria

- Visitors can quickly scan experience timeline without overload.
- Recruiters can drill down into concrete project outcomes in 1 click.
- Project evidence increases perceived technical depth and impact.
- No regressions in accessibility, performance, or content validation.

