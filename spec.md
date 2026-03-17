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

4. "Music" page for my pieces I compose
    1. Each sheet music card will have:
        1. A watermarked preview of the first page of the sheet music
        2. Title of the piece
        3. Price of sheet music
        4. add-to-cart button
        5. Optional button to play/pause a recording of the piece (if it exists)
        6. When clicked, pop up with a description of the piece
            1. Description/inspiration/playing notes
            2. Optional description of recording environment
            3. Licensing terms
        7. Difficulty level
        8. Piece intended duration
        9. Instrumentation
    2. Use Stripe to handle transactions
        1. These are one-time purchases relying on the honor of the buyer
        2. Cart state managed client-side via localStorage (Astro island component)
        3. Purchase flow:
            1. Click on add-to-cart on pieces they want
            2. Click on cart icon in the upper right-hand corner
            3. Cart passes all line items to a Vercel serverless function (`/api/checkout`)
            4. Serverless function creates a Stripe Checkout session (keeps secret key server-side)
            5. User redirected to Stripe Checkout
            6. Stripe webhook → Vercel serverless function → sends email with PDF download links (via Resend or SendGrid)
            7. Success page with download links + note to please not share
    3. An "About the Composer" area explaining my musical background and instrumental experience
    4. Top search bar searchable by
        1. tags (difficulty, instrumentation, etc.)
        2. titles
        3. has recording/doesn't have recording
    5. Music data lives in a typed `src/data/music.ts` file
    6. Audio recordings self-hosted as mp3s in `public/audio/`


## Site Structure

- **Navigation**: sticky top navbar across all pages
- **Purchasing Cart**: inline with top navbar in upper right corner with all potential purchases the user would like
- **Footer**: social links (GitHub, LinkedIn), copyright
- **Pages**: Home (projects), Blog, About, Music

## Tech Stack

TypeScript + Astro + Tailwind CSS
Hosted on Vercel w/ Cloudflare DNS

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