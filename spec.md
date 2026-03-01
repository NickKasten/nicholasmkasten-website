# nicholasmkasten.com Personal Website

### Goal:
1. Provide a landing page for people to see my projects
    1. Serves as a de facto resume
    2. Each quick-look card for each a project can lead to a bigger description/link to the repo/website
    3. Focus on really nice, clean user-experience with personality
    4. Hero section / intro blurb above the project cards
    5. Project data lives in a typed `src/data/projects.ts` file

2. Have a personal blog/thoughts area for thoughts I have about career, the comp sci/tech scene, etc.
    1. Each post is (mdx to allow for interaction when decided)
        1. Time-stamped
        2. Has a title
        3. Has a body allowing:
            1. text
            2. images
        4. category tagging (for filtering)
        5. short preview summary
        6. drafting status for myself to work on multiple at a time before publishing them

3. "About" page for me with links to GitHub, LinkedIn, resume (previewable and downloadable pdf), etc.

## Site Structure

- **Navigation**: sticky top navbar across all pages
- **Footer**: social links (GitHub, LinkedIn), copyright
- **Pages**: Home (projects), Blog, About

## Tech Stack

TypeScript + Astro + Tailwind CSS
Hosted on Vercel

## Design Specs:

- definitely have a dark mode
- inspiration from https://www.awwwards.com/ without being too distracting/complicated
- muted color pallette, akin to Claude's aesthetique
- terracotta, earthy variants of colors
- definitely requires a dominant color (perhaps a green?) but employs a wide range of colors in their earthy terracotta pallette variant
- we'll use the font https://usemodify.com/fonts/dinish/ DINish https://github.com/playbeing/dinish
- DINish weights: Regular + Bold (keep it lean for performance)
- Subtle animations: hover effects on cards, smooth page transitions, scroll-triggered reveals

## SEO & Meta

- Open Graph tags for link previews (title, description, image)
- Site-wide meta description
- Favicon