# Codex Instructions for Academic Website

## News Updates

When I say "add news:" followed by a short description, do the following:

1. Parse my input to extract the date, type (paper/talk/grant/position/other), venue, co-authors, and description.
2. Write the news entry matching the existing HTML format in news.html:
   - Bold venue/conference names
   - Concise: one sentence, two at most
   - Include co-authors for paper acceptances
   - Date format: "Mon YYYY"
3. Add the new entry to the TOP of the correct year section in news.html. If the year doesn't exist yet, create a new year header.
4. If the new entry is among the 5 most recent, update index.html too: add it to the top of the news section and remove the oldest entry to keep exactly 5.
5. If es/index.html and es/news.html exist, add the translated Spanish version there too.
6. Do not modify anything else on any page.
7. Commit with message: "Add news: [short description]"


## CV

The CV is a downloadable PDF at `CV/Jose_Guridi_CV.pdf`, linked from the homepage hero (the `social-links` row in `index.html` and `es/index.html`). There is no web-page version — the dedicated `cv.html` / `es/cv.html` pages and the "CV" nav link were removed 2026-07-13.

### "Update the CV" (or "sync CV")

1. Replace `CV/Jose_Guridi_CV.pdf` with the new file, keeping the filename stable so the hero links keep working.
2. Do not modify anything else.
3. Commit with message: "Update CV PDF".

## Recruitment Callout Box

A recruitment callout box exists in `index.html` and `es/index.html`, between the hero section and the About section. It is wrapped in `<!-- RECRUITMENT CALLOUT START -->` and `<!-- RECRUITMENT CALLOUT END -->` comments.

### "Add a recruitment box for [project name]"

1. Ask the user for: study name, short description, and button links (survey URL, contact email, etc.)
2. In both `index.html` and `es/index.html`, find the `<!-- RECRUITMENT CALLOUT START -->` block
3. Update the CONFIG comment: set ENABLED to true, update STUDY, TITLE, DESCRIPTION, BUTTON fields
4. Update the visible HTML: title, description text, button labels, and hrefs
5. Change the DISMISS_KEY to a new slug based on the study name (e.g., `recruit-[study-slug]`) so returning visitors see the new callout. Update the `key` variable in the `<script>` block to match.
6. Translate all visible text for `es/index.html`
7. Commit with message: "Add recruitment box: [study name]"

### "Turn off the recruitment box"

1. In both `index.html` and `es/index.html`, find the `<!-- RECRUITMENT CALLOUT START -->` block
2. Set CONFIG ENABLED to false
3. Add `style="display:none"` to the `<div class="recruitment-callout">` element
4. Commit with message: "Disable recruitment callout"

### "Turn on the recruitment box"

1. In both `index.html` and `es/index.html`, find the `<!-- RECRUITMENT CALLOUT START -->` block
2. Set CONFIG ENABLED to true
3. Remove `style="display:none"` from the `<div class="recruitment-callout">` element
4. Commit with message: "Enable recruitment callout"

### "Update the recruitment box"

1. Ask what to update (title, description, buttons, etc.)
2. Update the CONFIG comment and the visible HTML in both `index.html` and `es/index.html`
3. If changing to a different study, also update DISMISS_KEY and the script `key` variable
4. Commit with message: "Update recruitment box: [what changed]"

## Talks & Media

The `talks.html` and `es/talks.html` pages hold recorded talks (YouTube videos) and press mentions. Videos use a privacy-friendly "click-to-load" facade: only a thumbnail loads until the visitor clicks play, then `main.js` swaps in a `youtube-nocookie.com` iframe. Recorded talks live in a `talk-list`, followed by two `press-list` sections that are now live: `Writing` (ES: `Divulgación`) for pieces José authored for broad audiences, and `In the Press` (ES: `En la Prensa`) for media coverage. Both pages carry `HOW TO ADD` templates in comments. The homepage (`index.html`, `es/index.html`) shows one featured talk in a `#talks-preview` / `#charlas` section that links to the full page.

### "Add talk: [YouTube URL] — [venue, date, one-line description]"

1. Extract the 11-character YouTube video ID from the URL (the `v=` value, e.g. `nphKs8Id19U`). If the venue/date/description aren't given, fetch the video title from `https://www.youtube.com/oembed?url=<watch-url>&format=json` and ask the user to confirm venue, date, and a one-line summary.
2. In BOTH `talks.html` and `es/talks.html`, copy the `talk-item` block from the `HOW TO ADD A RECORDED TALK` comment and paste it at the TOP of the `talk-list` (most recent first).
3. Fill in: `data-video-id` (twice — the div attribute and the thumbnail URL `https://i.ytimg.com/vi/<ID>/hqdefault.jpg`), the `aria-label`, `talk-title`, `talk-venue` (venue in `<strong>`, then `&middot; TYPE &middot; Mon YYYY`), and `talk-desc`.
4. Keep the talk title in its original language on both pages; translate only the `talk-venue` type label and `talk-desc` for the Spanish page. Spanish month abbreviations use the same short forms as the news list (Ene, Feb, Mar, Abr, May…).
5. If this is the newest talk, also update the featured video in the homepage preview (`#talks-preview` in `index.html` and `#charlas` in `es/index.html`) to match.
6. Do not modify anything else on any page.
7. Commit with message: "Add talk: [short description]"

### "Add writing: [URL] — [outlet, date, one-line description]"

For pieces José authored for broad audiences (blog posts, op-eds, essays).

1. In BOTH `talks.html` and `es/talks.html`, find the `Writing` / `Divulgación` section (a `press-list`).
2. Copy a `press-item` and paste it at the TOP (most recent first). Fill in: `press-date` ("Mon YYYY"), the outlet/venue in `<strong>`, the headline as a link (`target="_blank" rel="noopener noreferrer"`), and one line of context.
3. Keep the headline in its original language; translate only the context line for the Spanish page.
4. Do not modify anything else on any page.
5. Commit with message: "Add writing: [short description]"

### "Add press: [outlet], [URL] — [date, context]"

1. In BOTH `talks.html` and `es/talks.html`, the `In the Press` / `En la Prensa` section is live (a `press-list`).
2. Copy the `press-item` block and paste it at the TOP of the `press-list` (most recent first). Fill in: `press-date` ("Mon YYYY" or just the year), outlet name in `<strong>`, the headline as a link (`target="_blank" rel="noopener noreferrer"`), and one line of context.
3. Keep the headline in its original language; translate only the context line for the Spanish page.
5. Do not modify anything else on any page.
6. Commit with message: "Add press: [outlet]"

## Work Corpus (my_work/)

`my_work/` holds José's private corpus of papers, reports, drafts, and application materials, cataloged file-by-file in `my_work/INDEX.md`.

- **NEVER commit or publish `my_work/`** — this repo is public (GitHub Pages). The folder is excluded via `.gitignore`; keep it that way.
- Publisher proofs and under-review drafts must not be posted to the site without checking the author agreement first.
- When files are added, removed, or renamed there, update `my_work/INDEX.md`.
- `CLAUDE.md` is the primary copy of these instructions. When updating CLAUDE.md, apply the same change to this file.
