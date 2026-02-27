# Context for Claude — Academic Website Session Continuation

> This file summarizes a multi-session conversation about improving jaguridi.github.io.
> It is meant to be read by Claude Code to resume work. Delete this file when done.

## What was done (3 commits on `claude/academic-website-improvements-LAcR2`)

### Commit 1: Comprehensive improvements
- **SEO**: meta descriptions, Open Graph, Twitter Cards, JSON-LD Person schema, canonical URLs, hreflang tags on all 8 HTML pages (EN + ES)
- **Accessibility**: skip-to-content links, `rel="noopener noreferrer"` on external links, `focus-visible` outlines, `aria-label` on nav, semantic `<ul>/<li>` for news, `role="list"`
- **Dark mode**: via `prefers-color-scheme` with CSS custom properties. Key gotcha: `--color-white` is remapped to `#0f1419` in dark mode
- **Mobile**: hamburger menu with max-height transition (not display toggle), two breakpoints (780px tablet, 600px mobile)
- **Publication filters**: pill buttons on publications.html with `data-category` attributes and `hidden` toggle
- **Print stylesheet**: hides nav/footer, shows URLs inline
- **New files**: sitemap.xml, robots.txt, favicon.svg (JG initials), 404.html
- **Renamed**: profile image to `jose-guridi-headshot.jpg` (was spaces in filename)
- **Updated**: generate_html.py to output new format with all improvements
- **`rel="me"`** on social links for identity verification

### Commit 2: Bug fixes
Fixed 9 bugs found during mobile/dark mode audit:
1. pub-section spacing (`:first-child` selector broke with wrappers)
2. Mobile nav lang-switch border
3. Mobile nav not closing on link click
4. Mobile nav touch targets
5. Dark mode recruitment callout border
6. Dark mode skip-to-content text
7. Missing tablet breakpoint
8. Filter buttons overflow on mobile (now horizontally scrollable)
9. Hamburger menu transition

### Commit 3: Data integrity and cleanup
1. Added missing entries to `publications.json` (SSRN working paper + UNESCO report)
2. Fixed dark mode button text colors (filter pills, recruitment buttons showed dark-on-blue)
3. Added hamburger menu, skip-to-content, aria-label to 404.html
4. Replaced hardcoded colors with CSS variables (`--color-border-subtle`, `--color-accent-bg`, `--color-recruitment-bg-start/end/border`)
5. Removed redundant dark mode overrides now handled by variables

## Pending work: Projects page reorganization

The user's projects section (both `projects.html` and the preview on `index.html`) currently has placeholder content. We discussed reorganizing projects under the three-layer research framework from the About section.

### The three-layer framework (from About section)

- **Macro**: Pragmatic and flexible technology governance — how countries design and adapt policy frameworks, how governance models travel across contexts, experimental approaches like regulatory sandboxes
- **Meso**: Participatory and sustainable digital transformation — how organizations/institutions involve citizens/stakeholders in shaping technology, how AI tools support collaborative processes
- **Micro**: Responsible and reflective human-AI interaction — how individuals use AI in professional practice, distance between promise and reality, designing interactions thoughtfully

### Proposed project structure (awaiting user input from papers/drafts)

**Macro — Technology Governance:**
1. **Paradoxical Strategies for Emerging Technology Governance** — How countries navigate contradictions of governing technologies they don't fully understand. 28 interviews, 22 countries. Outputs: SSRN preprint 2026, Atlanta Conference 2025/2023.
2. **Regulatory Sandboxes as Policy Experimentation** — Sandboxes as prototyping tools for public policy, including GenAI challenges. Outputs: Privacy Law Scholars 2026, IDB report 2025, book chapter 2025.
3. **AI Readiness and Governance in the Global South** — Merges "Global AI?" + UNESCO work. Outputs: UNESCO RAM report 2026, PAIRS 2026, Cambodia & DR assessments, trainings.

**Meso — Participatory Digital Transformation:**
4. **AI-Mediated Civic Participation** — NLP/LLM tools for public participation, respecting political nuances. Outputs: CSCW 2025, EGOV 2024, Atlanta 2025.
5. **Generative AI in Participatory Design** — Image-generative AI as boundary object in collaborative design of public spaces + landscape architecture adoption. Outputs: CSCW 2025, Digital Government 2025, BIG.AI@MIT 2026, workshops.

**Micro — Human-AI Interaction in Practice:**
6. **AI for Qualitative Research** — How qualitative researchers adopt/resist AI. Most active project. Outputs: QuIRI workshops, CCSS Fellowship, active study.

### What the user wants to do next

The user said the current 3 projects were **placeholders** and wants to reorganize. They offered to **put papers, drafts, reports, and project descriptions in a folder** so Claude can read the actual research to write accurate project descriptions. The user needs to:

1. Add research materials to a folder (e.g., `research-materials/`)
2. Resume this conversation with Claude Code on their desktop
3. Claude reads the materials and proposes/writes project descriptions
4. Update `projects.html`, `es/projects.html`, `index.html`, `es/index.html`

### Notes on the proposed structure
- The CHI 2026 paper (Responsible AI for Mental Well-Being, Ned Cooper first author) was left out as a standalone — it could be mentioned as a collaboration under project 6
- Project 5 spans meso/micro (CSCW papers are meso, "When Tools Don't Fit" is micro)
- Projects 1 & 2 could be merged if user prefers fewer items
- All descriptions need to be written in both EN and ES

## Technical notes

### Key architectural patterns
- **CSS variables**: All theming via `:root` custom properties, dark mode overrides the same variables
- **`--color-white` gotcha**: In dark mode, `--color-white` becomes `#0f1419`. Any element needing actual white text in dark mode must use hardcoded `#ffffff` (see skip-to-content, filter btn active, recruitment buttons)
- **Publication system**: `publications.json` → `generate_html.py` → generates both EN and ES publication pages. Always update JSON first, then regenerate.
- **Hamburger menu**: Uses `max-height: 0` → `max-height: 400px` transition. JS close-on-click pattern duplicated across all 8 pages + generate_html.py
- **Recruitment callout**: Managed via HTML comments with CONFIG block. localStorage-based dismissal with `DISMISS_KEY`

### File inventory
- `index.html` / `es/index.html` — Homepages (EN/ES)
- `news.html` / `es/news.html` — Full news archives
- `publications.html` / `es/publications.html` — Generated from publications.json
- `projects.html` / `es/projects.html` — **Needs reorganization**
- `style.css` — Single stylesheet (~848 lines)
- `generate_html.py` — Publication page generator
- `publications.json` — Source of truth for publications
- `404.html`, `favicon.svg`, `sitemap.xml`, `robots.txt` — Supporting files
- `CLAUDE.md` — Instructions for news updates and recruitment callout management
