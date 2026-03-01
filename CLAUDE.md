# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal website for Nicholas M. Kasten — portfolio display and blogging. See `spec.md` for full design requirements.

## Tech Stack

- **Framework**: Astro v5 (static output)
- **Language**: TypeScript (strictest)
- **Styling**: Tailwind CSS v4 (via `@tailwindcss/vite` plugin, configured in `src/styles/global.css` — no `tailwind.config.js`)
- **Content**: MDX via `@astrojs/mdx` + Astro content collections
- **Fonts**: DINish (self-hosted, Regular + Bold, in `public/fonts/`)
- **Deployment**: Vercel (`@astrojs/vercel` adapter)

## Commands

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run preview` — preview production build locally

## Project Structure

```
src/
  components/   — Astro components (BaseHead, Navbar, Footer, ThemeToggle, ProjectCard, ScrollReveal)
  layouts/      — BaseLayout.astro (wraps all pages)
  pages/        — index.astro (home), about.astro, blog/index.astro, blog/[...slug].astro
  data/         — projects.ts (typed project data)
  content/      — blog/ (MDX posts with frontmatter: title, summary, pubDate, categories, draft)
  styles/       — global.css (Tailwind config, palette, fonts)
public/
  fonts/        — DINish woff2 files
  images/       — project thumbnails
  resume/       — PDF resume
```

## Design Conventions

- **Dark mode**: class-based (`dark` class on `<html>`), toggled via ThemeToggle component with localStorage persistence
- **Color palette**: earthy/terracotta — sage (green, dominant), terra (terracotta), sand (warm neutral), clay (muted rose), stone (dark neutrals). All defined as `@theme` variables in `global.css`.
- **Animations**: hover effects on cards, scroll-triggered reveals via IntersectionObserver, page transitions via Astro ViewTransitions
- **Tailwind v4 patterns**: colors via `@theme` block, dark mode via `@custom-variant dark`, plugins via `@plugin` in CSS
