# Claude Code Instructions for Academic Website

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


## CV Sync

The CV has two synchronized representations:
- `CV/Jose_Guridi_CV.pdf` — the canonical, hand-designed PDF (source of truth). The user maintains this externally.
- `cv.html` and `es/cv.html` — web mirrors of the PDF, styled to match the rest of the site. Both link to the PDF via a "Download PDF" button.

### "Sync CV" (or "update CV from PDF")

When the user provides an updated CV PDF (or asks to sync), do the following:

1. If a new PDF path is given, copy it to `CV/Jose_Guridi_CV.pdf` (keep the filename stable so all links keep working).
2. Read the PDF with the Read tool.
3. Diff against the current `cv.html`. Update only the sections/entries that changed (new publications, talks, positions, awards, etc.). Preserve the existing structure (`cv-section`, `cv-entry`, `cv-date`, `cv-body`, `cv-title`, `cv-sub`, `cv-venue`, `<em class="me">` for Guridi's name).
4. Apply the same changes to `es/cv.html`, translating only the section headers and labels (publication titles and author lists stay in their original language).
5. Update the "Updated [month year]" line in both files to match the date on the PDF.
6. Do not modify any other page.
7. Commit with message: "Sync CV from PDF".

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
