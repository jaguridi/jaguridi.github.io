# Academic Website - Publication Management

## Quick Start

### Add a publication interactively

```bash
python add_publication.py
```

The script will prompt you for title, authors, venue, type, year, and links, then automatically regenerate the HTML pages.

### Manually edit and regenerate

1. Edit `publications.json` directly
2. Run:

```bash
python generate_html.py
```

This regenerates both `publications.html` and `es/publications.html`.

## File Overview

| File | Purpose |
|---|---|
| `publications.json` | Source of truth for all publications |
| `generate_html.py` | Regenerates EN and ES HTML from JSON |
| `add_publication.py` | Interactive script to add a new entry |

## Publication Types

| Type key | Section heading |
|---|---|
| `journal` | Peer-Reviewed Journal Articles |
| `archival-conference` | Archival Conference Papers |
| `workshop` | Workshop Papers and Extended Abstracts |
| `book-chapter` | Book Chapters |
| `policy-report` | Policy Reports |

## JSON Schema

```json
{
  "title": "Paper Title",
  "authors": ["First Author", "Second Author"],
  "venue": "Journal Name, Volume(Issue), Year",
  "venue_es": "Optional Spanish venue override",
  "year": 2025,
  "publication_type": "journal",
  "url": "https://doi.org/...",
  "abstract_link": null,
  "slides_link": null
}
```

**Notes:**
- `year`: Use `null` for forthcoming publications (they sort to the top)
- `venue_es`: Only needed when the Spanish venue differs (e.g., book chapters with "In:" vs "En:", or translated publisher names)
- `abstract_link` / `slides_link`: Only rendered for `workshop` type entries. Use `null` for placeholder `#` links.
- `url`: The main DOI or paper link. Use `null` if no link available.
- Publications are sorted by year descending within each section.

## Example: Adding a JSON Entry Manually

```json
{
  "title": "My New Paper on AI Governance",
  "authors": ["Jose A. Guridi", "Co-Author Name"],
  "venue": "[DIS'26] ACM Designing Interactive Systems, 2026",
  "year": 2026,
  "publication_type": "archival-conference",
  "url": "https://doi.org/10.1145/example",
  "abstract_link": null,
  "slides_link": null
}
```

Then run `python generate_html.py` to update the website.
