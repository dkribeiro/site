# Experience-Embedded Featured Projects Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add curated featured projects inside existing experience cards with a preview + inline "show all projects" accordion, while preserving timeline scanability and accessibility.

**Architecture:** Extend the `roles` frontmatter schema with an optional `projects` array, update select role markdown files with 5 curated projects, and enhance `RoleCard.astro` rendering to show one featured preview plus an accessible inline accordion for all projects. Reuse existing styling tokens and animation approach in `global.css`.

**Tech Stack:** Astro 6, Astro Content Collections, Zod, Vitest, vanilla CSS/JS

---

### Task 1: Extend Role Schema for Projects

**Files:**
- Modify: `src/schemas/role.ts`
- Modify: `src/schemas/role.test.ts`
- Test: `src/schemas/role.test.ts`

**Step 1: Write failing tests for `projects` support**

Add the following test cases to `src/schemas/role.test.ts`:

```ts
it("accepts valid projects array", () => {
  expect(
    roleSchema.safeParse({
      ...validBase,
      projects: [
        {
          name: "Lending Platform",
          dates: "2025-04 to Present",
          summary: "Built a modular lending platform for multiple credit products.",
          impact: ["Improved extensibility for new instruments"],
          skills: ["Node.js", "PostgreSQL"],
          link: "https://www.kanastra.com.br/en/banking",
        },
      ],
    }).success,
  ).toBe(true);
});

it("rejects project with invalid link", () => {
  expect(
    roleSchema.safeParse({
      ...validBase,
      projects: [
        {
          name: "Broken",
          dates: "2024-01 to 2024-02",
          summary: "x",
          impact: ["y"],
          link: "not-a-url",
        },
      ],
    }).success,
  ).toBe(false);
});
```

**Step 2: Run targeted tests and verify failure**

Run: `npm run test -- src/schemas/role.test.ts`
Expected: FAIL because `projects` is not in the schema yet.

**Step 3: Implement minimal schema changes**

In `src/schemas/role.ts`, add:

```ts
const projectSchema = z.object({
  name: z.string().min(1),
  dates: z.string().min(1),
  summary: z.string().min(1),
  impact: z.array(z.string().min(1)).min(1),
  skills: z.array(z.string().min(1)).optional(),
  link: z.string().url().optional(),
});
```

Then include in `roleSchema` object:

```ts
projects: z.array(projectSchema).optional(),
```

**Step 4: Re-run tests and verify pass**

Run: `npm run test -- src/schemas/role.test.ts`
Expected: PASS for all existing + new tests.

**Step 5: Commit**

```bash
git add src/schemas/role.ts src/schemas/role.test.ts
git commit -m "feat: add projects schema support for role content"
```

---

### Task 2: Add Curated Project Data to Role Content

**Files:**
- Modify: `src/content/roles/kanastra.md`
- Modify: `src/content/roles/picpay.md`
- Modify: `src/content/roles/dreamlabs.md`
- Test: `src/content/roles/*.md` via content check

**Step 1: Add Kanastra featured project**

In `src/content/roles/kanastra.md` frontmatter, add:

```yaml
projects:
  - name: Lending Platform
    dates: "Apr 2025 – Present"
    summary: "Designed a modular lending platform to support multiple credit instruments with long-term extensibility."
    impact:
      - "Created architecture that enables new instrument onboarding without core refactors"
      - "Established auditable long-running workflows for financial operations"
    skills:
      - Node.js
      - PostgreSQL
      - Temporal.io
      - Kubernetes
    link: "https://www.kanastra.com.br/en/banking"
```

**Step 2: Add two PicPay featured projects**

In `src/content/roles/picpay.md` frontmatter, add:

```yaml
projects:
  - name: PicPay Corporate Credit Card
    dates: "Apr 2024 – Present"
    summary: "Led delivery of a corporate credit card product integrating legacy flows with modern cloud services."
    impact:
      - "Delivered on tight timeline with cross-functional and third-party coordination"
      - "Improved scalability via PostgreSQL, Redis, Kafka, and Kubernetes integration"
    skills:
      - PostgreSQL
      - Redis
      - Kafka
      - Kubernetes
    link: "https://picpay.com/pt-br/pj/credito"
  - name: PicPay Beneficios
    dates: "May 2022 – Present"
    summary: "Took Benefits product from zero to initial launch in three months and scaled backend team substantially."
    impact:
      - "Launched initial version used by JBS group employees"
      - "Scaled backend team from 1 engineer to 40+"
    skills:
      - Node.js
      - PostgreSQL
      - SDLC
      - Technical Leadership
    link: "https://picpay.com/pt-br/pj/beneficios"
```

**Step 3: Add two DreamLabs featured projects**

In `src/content/roles/dreamlabs.md` frontmatter, add:

```yaml
projects:
  - name: Rateio Digital / Gringo
    dates: "Jul 2021 – May 2022"
    summary: "Led backend modernization from monolith to specialized microservices for vehicle debt consultation/payments."
    impact:
      - "Grew GMV from $500K to $18M annually"
      - "Core architecture later became engine post-acquisition by Gringo"
    skills:
      - Node.js
      - NestJS
      - PostgreSQL
      - Kafka
    link: "https://gringo.com.vc/"
  - name: Murexchange
    dates: "Jun 2019 – Apr 2020"
    summary: "Led concept-to-production architecture and development for a cryptocurrency exchange platform."
    impact:
      - "Translated founder requirements into production software"
      - "Supported successful market launch and subsequent acquisition"
    skills:
      - Node.js
      - MongoDB
      - PostgreSQL
      - gRPC
```

**Step 4: Validate content schema**

Run: `npm run check`
Expected: PASS with no content schema errors.

**Step 5: Commit**

```bash
git add src/content/roles/kanastra.md src/content/roles/picpay.md src/content/roles/dreamlabs.md
git commit -m "feat: add curated featured projects to role content"
```

---

### Task 3: Render Featured Preview + Inline Projects Accordion

**Files:**
- Modify: `src/components/RoleCard.astro`
- Test: manual render behavior in `/` page

**Step 1: Write failing behavior check (manual)**

Run: `npm run dev`
Expected (before implementation): no projects preview/toggle appears in role cards.

**Step 2: Extend RoleCard data extraction**

In `src/components/RoleCard.astro`, include `projects` in destructuring:

```ts
const { company, title, start, end, present, location, summary, stack, metrics, projects } =
  entry.data;
```

Add computed helpers:

```ts
const featuredProject = projects?.[0];
const allProjects = projects ?? [];
const projectsRegionId = `projects-${entry.id}`;
```

**Step 3: Render featured preview and toggle**

After existing metrics/stack output in `.role-body`, add:

```astro
{
  featuredProject && (
    <section class="role-projects" aria-label="Featured projects">
      <div class="project-preview">
        <p class="project-kicker">Featured project</p>
        <h3>{featuredProject.name}</h3>
        <p class="project-dates">{featuredProject.dates}</p>
        <p>{featuredProject.summary}</p>
        <p class="project-impact">{featuredProject.impact[0]}</p>
        {featuredProject.link && (
          <a href={featuredProject.link} target="_blank" rel="noopener noreferrer">
            Visit project
          </a>
        )}
      </div>

      {allProjects.length > 1 && (
        <>
          <button
            class="projects-toggle"
            type="button"
            aria-expanded="false"
            aria-controls={projectsRegionId}
          >
            Show all projects ({allProjects.length})
          </button>
          <div id={projectsRegionId} class="projects-region" hidden>
            <ul class="projects-list">
              {allProjects.map((project) => (
                <li class="project-card">
                  <h4>{project.name}</h4>
                  <p class="project-dates">{project.dates}</p>
                  <p>{project.summary}</p>
                  <ul>
                    {project.impact.map((item) => (
                      <li>{item}</li>
                    ))}
                  </ul>
                  {project.skills && (
                    <ul class="project-skills">
                      {project.skills.map((skill) => (
                        <li>{skill}</li>
                      ))}
                    </ul>
                  )}
                  {project.link && (
                    <a href={project.link} target="_blank" rel="noopener noreferrer">
                      Open link
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </section>
  )
}
```

**Step 4: Add minimal inline toggle script**

In same component, add script:

```html
<script>
  (() => {
    const toggles = document.querySelectorAll<HTMLButtonElement>(".projects-toggle");
    toggles.forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("aria-controls");
        if (!id) return;
        const region = document.getElementById(id);
        if (!region) return;
        const expanded = btn.getAttribute("aria-expanded") === "true";
        btn.setAttribute("aria-expanded", expanded ? "false" : "true");
        btn.textContent = expanded
          ? btn.textContent?.replace("Hide", "Show") ?? "Show all projects"
          : btn.textContent?.replace("Show", "Hide") ?? "Hide all projects";
        region.hidden = expanded;
      });
    });
  })();
</script>
```

**Step 5: Verify behavior**

Run: `npm run dev`
Expected:
- Roles with projects show "Featured project".
- PicPay and DreamLabs show "Show all projects (2)" button.
- Clicking toggle reveals/hides project cards inline.

**Step 6: Commit**

```bash
git add src/components/RoleCard.astro
git commit -m "feat: render featured projects with inline accordion in role cards"
```

---

### Task 4: Style Projects Block and Accordion States

**Files:**
- Modify: `src/styles/global.css`
- Test: visual and responsive behavior on `/`

**Step 1: Add styles for new project elements**

In `src/styles/global.css` near role/timeline section, add styles for:

- `.role-projects`
- `.project-preview`
- `.project-kicker`
- `.project-impact`
- `.projects-toggle`
- `.projects-region`
- `.projects-list`
- `.project-card`
- `.project-dates`
- `.project-skills`

Use existing tokens (`--bg-elevated`, `--accent`, `--border`, `--muted`) and keep cards compact.

Example starter:

```css
.role-projects { margin-top: 1rem; }
.project-preview {
  border: 1px solid var(--border);
  border-left: 3px solid var(--accent);
  background: color-mix(in srgb, var(--accent) 8%, var(--bg-elevated));
  padding: 0.85rem 1rem;
}
.projects-toggle {
  margin-top: 0.75rem;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--fg);
  padding: 0.45rem 0.7rem;
  cursor: pointer;
}
```

**Step 2: Add smooth reveal for projects region**

Use transition-friendly class strategy:

```css
.projects-region[hidden] { display: none; }
.projects-list { margin-top: 0.8rem; display: grid; gap: 0.65rem; }
```

Keep motion subtle and respect existing global reduced-motion behavior.

**Step 3: Verify visual quality**

Run: `npm run dev`
Expected:
- Featured preview visually distinct but on-brand.
- Expanded project cards are readable and not overcrowded.
- Mobile widths do not overflow.
- Toggle has visible focus style.

**Step 4: Commit**

```bash
git add src/styles/global.css
git commit -m "feat: style experience project previews and inline project cards"
```

---

### Task 5: End-to-End Verification and Cleanup

**Files:**
- Verify all files changed in Tasks 1-4

**Step 1: Run schema/type/content validation**

Run: `npm run check`
Expected: PASS, no diagnostics.

**Step 2: Run tests**

Run: `npm run test`
Expected: PASS, including updated schema tests.

**Step 3: Run production build**

Run: `npm run build`
Expected: PASS with generated static pages.

**Step 4: Manual QA checklist**

Run: `npm run dev`
Verify:
- Kanastra shows featured Lending Platform.
- PicPay shows featured project + toggle reveals both projects.
- DreamLabs shows featured project + toggle reveals both projects.
- Keyboard toggle works (`Tab`, `Enter`, `Space`).
- External links open in new tab safely (`rel="noopener noreferrer"`).
- Reduced-motion mode still usable.

**Step 5: Final commit (if any fixes)**

```bash
git add -A
git commit -m "chore: polish experience-embedded projects interaction and content"
```

