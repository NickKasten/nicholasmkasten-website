# Site refresh plan

Living dev doc for the current round of work on `nicholasmkasten.com`. Companion to `spec.md` (which captures the original product vision). Update this as we go — check items off, add notes, capture scope changes. Source of truth for in-flight work.

## Context

The site today is a clean Astro v5 / Tailwind v4 / MDX scaffold but is content-thin: only one project listed (the site itself), no resume PDF in `public/resume/`, and minimal interactivity beyond a single `ScrollReveal` + theme toggle. This round delivers four things:

1. **Richer projects** — cards on home + dedicated per-project detail pages so each project can carry a real writeup.
2. **Updated resume** — drop in a new PDF; existing About page already auto-renders it.
3. **A distinctive motion language** — music-inspired (waveforms, EQ-bar accents, rhythmic stagger). Personal to Nick (musician), restrained enough not to distract.
4. **Living content** — latest blog post on home, GitHub recent activity feed, and a manually-edited `/now` page.

Music sales section (per `spec.md`) is **deferred** to a later round.

Browser testing during build is via the Playwright MCP server (installed by Nick locally — see "Tooling" below).

---

## 1. Music-inspired motion/visual language

A small set of shared primitives consumed by the rest of the work. Build first so projects/home/about all reach for the same vocabulary.

### New components (`src/components/`)

- **`WaveDivider.astro`** — Inline SVG sine-wave used as a section divider. Props: `color` (default `currentColor`), `amplitude`, `cycles`, `class`. Pure SVG, no JS.
- **`EqAccent.astro`** — 3 vertical bars (~3px × varying heights) animating via CSS keyframes. Used for: active nav indicator, "live" dot on living-content widgets, hover state on key links. CSS-only.
- **`ScrollReveal.astro`** *(extend, don't replace)* — Add an optional `delay` prop and a `stagger` prop on a parent wrapper. Apply musical-timing presets in `global.css`: `--reveal-16th: 80ms`, `--reveal-8th: 160ms`, `--reveal-quarter: 320ms`. The home/projects grid passes `stagger="16th"` so cards reveal in 1-e-&-a feel.

### Global motion (`src/styles/global.css`)

- `@keyframes breathe` — slow horizontal scale (4–6s loop) for a faint accent line under the hero.
- `@keyframes eq-pulse` — three different durations on three bars so they look natural, not synchronized.
- **Wrap every custom animation in `@media (prefers-reduced-motion: no-preference)`.** Reduced-motion users get static states.

### Wiring

- `src/pages/index.astro` — under the hero `<h1>`, add a `<span class="hero-baseline">` with `animation: breathe …`.
- `src/components/Navbar.astro` (line 26–38) — when `currentPath === link.href`, render `<EqAccent />` next to the label instead of just changing color. Keep the color change too.
- Section breaks on home/about/blog index → `<WaveDivider />` between sections (used sparingly, 1–2 per page max).

---

## 2. Projects: cards + per-project detail pages

Move from the static `src/data/projects.ts` array to an MDX content collection, mirroring the `blog` pattern that already works in this repo.

### Schema (`src/content.config.ts`)

Add a `projects` collection alongside the existing `blog`:

```ts
const projects = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/projects" }),
  schema: z.object({
    title: z.string(),
    tagline: z.string(),               // short, for cards
    summary: z.string(),               // longer, for detail-page hero
    role: z.string().optional(),       // "Solo build", "Lead engineer", etc.
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(), // omit = ongoing
    tech: z.array(z.string()).default([]),
    liveUrl: z.string().url().optional(),
    repoUrl: z.string().url().optional(),
    image: z.string().optional(),       // card thumbnail
    gallery: z.array(z.object({
      src: z.string(),
      alt: z.string(),
      caption: z.string().optional(),
    })).default([]),
    outcomes: z.array(z.string()).default([]),
    relatedPostSlug: z.string().optional(),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
  }),
});
export const collections = { blog, projects };
```

### Files

- **New** `src/content/projects/personal-website.mdx` — port the existing single project into the collection. MDX body holds the case-study narrative.
- **New** `src/pages/projects/[...slug].astro` — detail page template. Mirrors `src/pages/blog/[...slug].astro`. Sections: hero (title, tagline, role, dates, tech tags), summary, MDX body (`<Content />`), gallery if present, outcomes if present, links footer (live/repo/related post).
- **Update** `src/pages/index.astro` — replace `import { projects } from "../data/projects"` with `getCollection("projects")`. Filter out drafts in production. Wrap grid with new `stagger` prop on `ScrollReveal`.
- **Update** `src/components/ProjectCard.astro` — make the whole card a link to `/projects/${slug}`; add a small "Read more →" affordance.
- **Delete** `src/data/projects.ts` once the collection is wired and the home page is updated. (Don't leave it as a fallback — clean break.)

### Home grid layout

Default to showing **all non-draft projects** in the grid. If/when the count exceeds ~8, we'll split off a dedicated `/projects` index — not needed yet.

### What Nick provides at implementation time

For each project: title, tagline (≤90 chars), summary (1–3 sentences), role, dates, tech list, live + repo URLs, 1 thumbnail (`public/images/`) and 1–3 gallery images, optional outcomes (3–5 bullets), optional related-post slug.

---

## 3. Resume

No code changes required. About-page logic at `src/pages/about.astro:5-6` checks `fs.existsSync("public/resume/nicholas-kasten-resume.pdf")` and renders the iframe + download button when the file is present (`src/pages/about.astro:44-73`).

**Action**: Drop the new PDF at `public/resume/nicholas-kasten-resume.pdf`. Done.

---

## 4. Living content

### Latest blog post on home

- **New** `src/components/LatestPostCard.astro` — accepts a blog collection entry, renders a compact card (date · title · summary · "Read →"), styled to match the project-card visual weight but distinct (e.g., terra-tinted accents to differentiate from sage-coded projects).
- **Update** `src/pages/index.astro` — fetch `getCollection("blog")`, filter drafts, sort by `pubDate` desc, take the first; render between hero and projects grid with a `<WaveDivider />` separator.

### GitHub recent activity

- Build-time fetch in `src/pages/index.astro` frontmatter against `https://api.github.com/users/NickKasten/events/public`.
- Filter to `PushEvent` and `PullRequestEvent`, dedupe by repo, take 3–5 most recent.
- Wrap in `try/catch` — if the fetch fails (rate limit, offline), render nothing (no broken state in build output).
- **New** `src/components/GithubFeed.astro` — receives the parsed events as a prop, renders a small list with EQ-pulse "live" indicator.
- **Note on freshness**: static build means it updates only on redeploy. Acceptable for now. If we want true freshness later, options are (a) Vercel scheduled redeploy, (b) move this widget to a client-side fetch — trade-off can be revisited.

### `/now` page

- **New** `src/pages/now.astro` — single page, content authored directly in the file (or moved to `src/content/now.mdx` if Nick wants to edit it as MDX). Sections: "Working on", "Reading", "Listening to", "Thinking about". Last-updated stamp at top.
- **Update** `src/components/Navbar.astro` — add `{ href: "/now", label: "Now" }` to `navLinks` (line 4–8).

---

## 5. Sequencing & out-of-scope

**Build order** (each step independently shippable — check off as we go):

- [x] **0. In-repo dev doc** (this file)
- [x] **1. Motion primitives** — `WaveDivider`, `EqAccent`, extended `ScrollReveal`, keyframes, reduced-motion guard
- [x] **2. Navbar EQ accent + `/now` page + nav link**
- [x] **3. Projects collection + detail page + home migration + `ProjectCard` link + delete `src/data/projects.ts`**
- [x] **4. Living-content widgets** (latest post + GitHub feed) on home
- [ ] **5. Resume PDF drop-in** (no code) — *blocked: awaiting PDF from Nick at `public/resume/nicholas-kasten-resume.pdf`*

**Explicitly out of scope** for this round:
- Music sales section (Stripe, cart, etc. per `spec.md`)
- Recently-played music widget (rejected during interview)
- Filterable/sortable project grid (not needed at current project count)
- Touching the two untracked draft posts (`thought-1.mdx`, `thought-2.mdx`) — left alone

---

## Critical files

| File | Change |
|---|---|
| `refresh-plan.md` | **new** — this dev doc |
| `src/components/WaveDivider.astro` | **new** — SVG wave |
| `src/components/EqAccent.astro` | **new** — animated EQ bars |
| `src/components/LatestPostCard.astro` | **new** — latest-post card |
| `src/components/GithubFeed.astro` | **new** — GitHub activity list |
| `src/components/ScrollReveal.astro` | extend — `delay` / `stagger` props |
| `src/components/ProjectCard.astro` | wrap as link to detail page |
| `src/components/Navbar.astro` | EQ on active link, add `/now` |
| `src/styles/global.css` | `@keyframes breathe`, `@keyframes eq-pulse`, reduced-motion guards |
| `src/content.config.ts` | register `projects` collection |
| `src/content/projects/personal-website.mdx` | **new** — port existing project |
| `src/pages/projects/[...slug].astro` | **new** — detail page template |
| `src/pages/index.astro` | latest post + GitHub feed + use collection |
| `src/pages/now.astro` | **new** — `/now` page |
| `src/data/projects.ts` | **delete** after migration |
| `public/resume/nicholas-kasten-resume.pdf` | **new file** — provided by Nick |

---

## Verification

End-to-end checks once implemented:

- [ ] `npm run dev` — homepage loads, hero baseline breathes, projects grid staggers in on scroll, EQ accent shows on the active nav item
- [ ] Click a project card → `/projects/[slug]` renders with hero, summary, MDX body, gallery (if present), links
- [ ] `/now` route renders and is reachable from navbar
- [ ] Latest-post card pulls the most recent non-draft post; GitHub feed renders 3–5 events (or nothing if API fails — verify by toggling network in DevTools)
- [ ] Drop in resume PDF → `/about` switches from "coming soon" to iframe + download
- [ ] Toggle "Emulate reduced motion: reduce" in DevTools → all custom animations stop, layout still works
- [ ] Toggle dark mode — wave dividers and EQ bars use `currentColor` correctly in both themes
- [ ] `npm run build` succeeds with no type errors. Inspect `dist/` to confirm projects collection generated detail pages
- [ ] (With Playwright MCP installed) navigate light + dark mode, screenshot home, a project detail, `/now`, `/blog` for visual review

---

## Open items I'll need from Nick when we start implementing

1. **Project content**: for each project — title, tagline, summary, role, dates, tech, live/repo URLs, thumbnail + 1–3 gallery images, optional outcomes bullets.
2. **Resume PDF** dropped at `public/resume/nicholas-kasten-resume.pdf`.
3. **`/now` page initial copy**: what to say in each of the four sections.
4. **GitHub username confirmation**: assuming `NickKasten` per the existing About page link.

---

## Tooling

**Playwright MCP** (browser control for in-loop testing):

```sh
# project-scoped (only this repo)
claude mcp add playwright -s project -- npx -y @playwright/mcp@latest

# or user-scoped (every project)
claude mcp add playwright -s user -- npx -y @playwright/mcp@latest
```

Restart Claude Code after running. First browser launch downloads Chromium (~30s); subsequent launches are instant.

---

## Decisions log

Capture choices as we make them so we can reread the "why" later. Format: `YYYY-MM-DD — decision — rationale`.

- 2026-05-06 — Visual direction: music-inspired (waveform/EQ/rhythmic stagger) — chosen over editorial/organic/sketchy because it's personal to Nick (musician) and technically distinctive without being twee.
- 2026-05-06 — Projects move to MDX content collection (not enriched static array) — case-study writeups need MDX bodies; mirroring the proven `blog` pattern keeps the codebase consistent.
- 2026-05-06 — Music sales section deferred — Stripe + cart + webhooks is its own round; would dilute focus here.
- 2026-05-06 — GitHub feed fetched at build time, not client-side — keeps the site static and the page fast; staleness acceptable until proven otherwise.
- 2026-05-06 — Living content scope: latest post + GitHub + `/now` — Spotify/recently-played widget rejected (extra auth complexity, not worth the lift now).
- 2026-05-06 — Step 1 shipped — motion primitives built but not yet wired into pages; visual validation deferred to step 2 (navbar EQ accent) and step 3 (staggered project grid) where the primitives get real consumers. Build passes; reduced-motion guard applied to keyframes (`global.css`) and to the `ScrollReveal` transitions themselves.
- 2026-05-06 — `EqAccent` API choice — picked `size: 'sm' | 'md'` over raw px props so callers don't bikeshed dimensions; `color` defaults to `currentColor` so the accent inherits link/text color in light + dark.
- 2026-05-06 — `ScrollReveal` stagger applied via runtime JS (sets per-child `transition-delay` from `data-stagger` keyword) rather than CSS `:nth-child` selectors — works for any child count without hardcoded N.
- 2026-05-06 — `ScrollReveal` accepts a `class` prop so the wrapper itself can be the grid (`<ScrollReveal stagger="16th" class="grid …">`). Avoids a useless extra div between the reveal wrapper and the staggered children.
- 2026-05-06 — `/now` shipped with placeholder copy in three of four sections — Nick will swap in real entries; the layout/structure is the deliverable for this round.
- 2026-05-06 — `GithubFeed` does its own try/catch and renders nothing on failure or when no qualifying events exist; deduped by repo and limited to 4 by default. No client-side fetch — staleness is acceptable until proven otherwise.
- 2026-05-06 — Hero baseline `<span>` added under the home heading with `breathe` animation, max-w-xs so it reads as a subtle accent under the headline rather than a divider.
- 2026-05-06 — Wave dividers placed on home (between living-content and projects) and blog index (between filters and post list); about page intentionally left without one (single short section, divider would be noise).
- 2026-05-07 — GitHub feed stays on `/events/public` (anonymous, no token). Considered authenticated + anonymized rendering and aggregate counts to surface private-repo activity, but rejected — both add token-management infrastructure for a side-of-page widget that's working fine. The public endpoint already filters private events out, so no code change is needed; revisit only if the feed routinely renders empty during stretches of private-only work.
- 2026-05-07 — Background animation: drifting layered waveforms via new `WaveformBackdrop.astro` in `BaseLayout`. Three sage/terra/sand sine layers at 12-18% opacity, alternating drift direction (right/left/right) for parallax depth, 70-130s loops. Chosen over aurora gradients (too generic, not on-theme) and topographic contours (drifts from music vocabulary). SVGs render at 200% width and translate by -50% so the loop is seamless on whole-cycle boundaries. Reduced-motion users get frozen layers, not hidden — decorative depth still present, just static.
- 2026-05-07 — Project detail date formatter switched to `timeZone: "UTC"` because `z.coerce.date()` parses `YYYY-MM-DD` frontmatter as UTC midnight, which displays a day earlier in Pacific time (e.g., scout-mobile's `2026-04-01` rendering as "Mar 2026"). Same root cause as the earlier `/now` last-updated bug.
- 2026-05-08 — Resume preview switched from `<iframe>` PDF viewer to build-time PNG rasterization (`pdfjs-dist@3.11.174` + `@napi-rs/canvas`). Native PDF viewer in browsers defaulted to fit-page zoom with a side thumbnail pane → text was unreadable without zooming, and Safari/mobile largely ignore PDF Open Parameters that would fix it. Pre-rendering to PNG at 2.5x scale gives every browser the same crisp full-size view with zero PDF viewer chrome. Pinned `pdfjs-dist` to v3 because v5's Path2D-heavy renderer is incompatible with `@napi-rs/canvas` v1's skia backend. Rendering lives in `scripts/render-resume.mjs` and runs via `predev`/`prebuild` npm hooks so output exists before Astro's `public/` → `dist/` copy. Cached in `public/resume/_generated/` (gitignored), invalidated by source PDF mtime. Download button still serves the original PDF.
