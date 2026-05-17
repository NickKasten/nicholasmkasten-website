# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal website for Nicholas M. Kasten — portfolio display and blogging. See `spec.md` for full design requirements.

## Tech Stack

- **Framework**: Astro v5 (static output)
- **Language**: TypeScript (strictest)
- **Styling**: Tailwind CSS v4 (via `@tailwindcss/vite`, configured in `src/styles/global.css` — no `tailwind.config.js`). `@tailwindcss/typography` loaded via `@plugin` in CSS.
- **Content**: MDX via `@astrojs/mdx` + Astro content collections
- **Fonts**: DINish (self-hosted, Regular + Bold, in `public/fonts/`)
- **Deployment**: Vercel (`@astrojs/vercel` adapter)

## Commands

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run preview` — preview production build locally
- `npm run render-resume` — rasterize `public/resume/*.pdf` to PNG previews (also runs automatically as `predev` / `prebuild` via `scripts/render-resume.mjs`, using `@napi-rs/canvas` + `pdfjs-dist`)

## Project Structure

```
src/
  components/   — see component inventory below
  layouts/      — BaseLayout.astro (wraps all pages; props: title, description, image?)
  pages/        — index.astro, about.astro, now.astro,
                  blog/index.astro, blog/[...slug].astro,
                  projects/[...slug].astro
  content/      — blog/ and projects/ (MDX); schemas in src/content.config.ts
  styles/       — global.css (Tailwind @theme tokens, palette, fonts, motion)
scripts/
  render-resume.mjs — PDF → PNG preview generator
public/
  fonts/        — DINish woff2 files
  images/       — project thumbnails
  resume/       — PDF resume (+ generated previews in _generated/, gitignored)
```

## Components (`src/components/`)

- **BaseHead** — meta tags (canonical, OG, Twitter)
- **Navbar** — sticky nav with brand, links, ThemeToggle, EqAccent active indicator
- **Footer** — copyright + social links
- **ThemeToggle** — moon/sun button; toggles `dark` on `<html>` + localStorage
- **ProjectCard** — grid card for project listings
- **LatestPostCard** — featured card for the most recent blog post
- **GithubFeed** — fetches public GitHub events, shows recent unique repos
- **ScrollReveal** — IntersectionObserver fade-in wrapper with stagger timing
- **WaveDivider** — decorative SVG sine wave (configurable)
- **EqAccent** — animated 3-bar EQ used as active/section indicator
- **WaveformBackdrop** — fixed full-page animated waveform background

## Content Collections (`src/content.config.ts`)

**blog** — required: `title`, `summary`, `pubDate`. Optional: `updatedDate`, `categories` (default `[]`), `draft` (default `false`), `image`.

**projects** — required: `title`, `tagline`, `summary`. Optional: `role`, `startDate`, `endDate`, `tech` (default `[]`), `liveUrl`, `repoUrl`, `image`, `gallery` (`{src, alt, caption?}[]`), `outcomes` (default `[]`), `relatedPostSlug`, `featured` (default `false`), `draft` (default `false`).

Drafts are filtered out in production (`import.meta.env.PROD`).

## Design Conventions

- **Dark mode**: class-based (`dark` on `<html>`); custom variant `@custom-variant dark (&:where(.dark, .dark *))` in `global.css`.
- **Color palette**: earthy/terracotta with 50–950 scales for each family — sage (green, dominant), terra (terracotta), sand (warm neutral), clay (muted rose), stone (dark neutrals). Defined as `@theme` variables in `global.css`.
- **Motion**: scroll reveals via IntersectionObserver, page transitions via Astro ViewTransitions, and a music-themed system — EqAccent / WaveformBackdrop / WaveDivider plus stagger tokens `--reveal-16th`, `--reveal-8th`, `--reveal-quarter`. All animations sit behind a `prefers-reduced-motion` guard.
- **Tailwind v4 patterns**: colors via `@theme` block, dark mode via `@custom-variant`, plugins via `@plugin` in CSS.
