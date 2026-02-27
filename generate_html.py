#!/usr/bin/env python3
"""Regenerate publications.html and es/publications.html from publications.json."""

import json
import html
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
JSON_PATH = SCRIPT_DIR / "publications.json"
EN_OUTPUT = SCRIPT_DIR / "publications.html"
ES_OUTPUT = SCRIPT_DIR / "es" / "publications.html"

# Section order, display names, and filter data-category slugs
SECTIONS = [
    ("journal", "Peer-Reviewed Journal Articles", "Articulos en Revistas con Revision de Pares", "journals"),
    ("archival-conference", "Archival Conference Papers", "Articulos de Conferencia Archivados", "conferences"),
    ("workshop", "Workshop Papers and Extended Abstracts", "Articulos de Taller y Resumenes Extendidos", "workshops"),
    ("book-chapter", "Book Chapters", "Capitulos de Libro", "books"),
    ("policy-report", "Policy Reports", "Informes de Politica Publica", "reports"),
]

# Filter button labels (EN and ES)
FILTER_BUTTONS_EN = [
    ("all", "All"),
    ("working-papers", "Working Papers"),
    ("journals", "Journals"),
    ("conferences", "Conferences"),
    ("workshops", "Workshops"),
    ("books", "Books"),
    ("reports", "Reports"),
]

FILTER_BUTTONS_ES = [
    ("all", "Todas"),
    ("working-papers", "En progreso"),
    ("journals", "Revistas"),
    ("conferences", "Conferencias"),
    ("workshops", "Talleres"),
    ("books", "Libros"),
    ("reports", "Informes"),
]

EN_HEADER = """\
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Publications | Jose A. Guridi</title>
    <meta name="description" content="Academic publications by Jose A. Guridi: journal articles, conference papers, book chapters, and policy reports on AI governance, HCI, and CSCW.">
    <link rel="canonical" href="https://jaguridi.github.io/publications.html">
    <link rel="alternate" hreflang="en" href="https://jaguridi.github.io/publications.html">
    <link rel="alternate" hreflang="es" href="https://jaguridi.github.io/es/publications.html">
    <link rel="icon" type="image/svg+xml" href="favicon.svg">
    <link rel="stylesheet" href="style.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Source+Sans+3:ital,wght@0,400;0,600;0,700;1,400&family=Source+Serif+4:wght@400;600;700&display=swap" rel="stylesheet">
</head>
<body>
    <a href="#main-content" class="skip-to-content">Skip to content</a>
    <header>
        <nav aria-label="Main navigation">
            <a href="index.html" class="nav-name">Jose A. Guridi</a>
            <button class="nav-toggle" aria-label="Toggle navigation" aria-expanded="false">
                <span></span><span></span><span></span>
            </button>
            <div class="nav-links">
                <a href="index.html#about">About</a>
                <a href="news.html">News</a>
                <a href="publications.html">Publications</a>
                <a href="projects.html">Projects</a>
                <a href="CV/Jose_Guridi_CV.pdf" target="_blank" rel="noopener noreferrer">CV</a>
                <a href="index.html#contact">Contact</a>
                <span class="lang-switch"><span class="active-lang">EN</span> / <a href="es/publications.html">ES</a></span>
            </div>
        </nav>
    </header>

    <main id="main-content">
        <section class="section" style="border-bottom: none;">
            <h2>Publications</h2>
"""

ES_HEADER = """\
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Publicaciones | Jose A. Guridi</title>
    <meta name="description" content="Publicaciones acad&eacute;micas de Jose A. Guridi: art&iacute;culos de revista, conferencias, cap&iacute;tulos de libro e informes de pol&iacute;tica sobre gobernanza de IA, HCI y CSCW.">
    <link rel="canonical" href="https://jaguridi.github.io/es/publications.html">
    <link rel="alternate" hreflang="en" href="https://jaguridi.github.io/publications.html">
    <link rel="alternate" hreflang="es" href="https://jaguridi.github.io/es/publications.html">
    <link rel="icon" type="image/svg+xml" href="../favicon.svg">
    <link rel="stylesheet" href="../style.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Source+Sans+3:ital,wght@0,400;0,600;0,700;1,400&family=Source+Serif+4:wght@400;600;700&display=swap" rel="stylesheet">
</head>
<body>
    <a href="#main-content" class="skip-to-content">Ir al contenido</a>
    <header>
        <nav aria-label="Navegaci&oacute;n principal">
            <a href="index.html" class="nav-name">Jose A. Guridi</a>
            <button class="nav-toggle" aria-label="Abrir men&uacute;" aria-expanded="false">
                <span></span><span></span><span></span>
            </button>
            <div class="nav-links">
                <a href="index.html#sobre">Sobre mi</a>
                <a href="news.html">Novedades</a>
                <a href="publications.html">Publicaciones</a>
                <a href="projects.html">Proyectos</a>
                <a href="../CV/Jose_Guridi_CV.pdf" target="_blank" rel="noopener noreferrer">CV</a>
                <a href="index.html#contacto">Contacto</a>
                <span class="lang-switch"><a href="../publications.html">EN</a> / <span class="active-lang">ES</span></span>
            </div>
        </nav>
    </header>

    <main id="main-content">
        <section class="section" style="border-bottom: none;">
            <h2>Publicaciones</h2>
"""

FOOTER = """\
        </section>
    </main>

    <footer>
        <p>&copy; 2026 Jose A. Guridi</p>
    </footer>

    <script>
    (function() {
        // Hamburger menu
        var toggle = document.querySelector('.nav-toggle');
        var navLinks = document.querySelector('.nav-links');
        if (toggle && navLinks) {
            toggle.addEventListener('click', function() {
                var expanded = toggle.getAttribute('aria-expanded') === 'true';
                toggle.setAttribute('aria-expanded', !expanded);
                toggle.classList.toggle('active');
                navLinks.classList.toggle('open');
            });
        }

        // Publication filters
        var filterBtns = document.querySelectorAll('.pub-filter-btn');
        var sections = document.querySelectorAll('.pub-section');
        filterBtns.forEach(function(btn) {
            btn.addEventListener('click', function() {
                var filter = btn.getAttribute('data-filter');
                filterBtns.forEach(function(b) { b.classList.remove('active'); });
                btn.classList.add('active');
                sections.forEach(function(s) {
                    if (filter === 'all' || s.getAttribute('data-category') === filter) {
                        s.removeAttribute('hidden');
                    } else {
                        s.setAttribute('hidden', '');
                    }
                });
            });
        });
    })();
    </script>
</body>
</html>
"""


def sort_key(pub):
    """Sort publications by year descending. Null years (forthcoming) go first."""
    y = pub.get("year")
    return (0, 0) if y is None else (1, -y)


def render_pub_item(pub, lang="en"):
    """Render a single publication as an HTML div."""
    lines = []
    lines.append('                <div class="pub-item">')

    esc = lambda s: html.escape(s, quote=False)  # don't escape apostrophes in text
    title_escaped = esc(pub["title"])
    if pub.get("url"):
        lines.append(
            f'                    <p class="pub-title">'
            f'<a href="{html.escape(pub["url"])}" target="_blank" rel="noopener noreferrer">'
            f'{title_escaped}</a></p>'
        )
    else:
        lines.append(f'                    <p class="pub-title">{title_escaped}</p>')

    authors = esc(", ".join(pub["authors"]))
    lines.append(f'                    <p class="pub-authors">{authors}</p>')

    venue = pub.get("venue_es", pub["venue"]) if lang == "es" else pub["venue"]
    lines.append(f'                    <p class="pub-venue">{esc(venue)}</p>')

    if pub["publication_type"] == "workshop" and pub.get("slides_link"):
        slides_href = html.escape(pub["slides_link"])
        lines.append(
            f'                    <p class="pub-links">'
            f'<a href="{slides_href}">Slides</a></p>'
        )

    lines.append("                </div>")
    return "\n".join(lines)


def render_filter_buttons(lang="en"):
    """Render the publication filter buttons toolbar."""
    buttons = FILTER_BUTTONS_EN if lang == "en" else FILTER_BUTTONS_ES
    aria_label = "Filter publications" if lang == "en" else "Filtrar publicaciones"
    lines = [f'            <div class="pub-filters" role="toolbar" aria-label="{aria_label}">']
    for i, (slug, label) in enumerate(buttons):
        active = ' active' if slug == 'all' else ''
        lines.append(
            f'                <button class="pub-filter-btn{active}" '
            f'data-filter="{slug}">{html.escape(label)}</button>'
        )
    lines.append('            </div>\n')
    return "\n".join(lines)


def generate_page(pubs, lang="en"):
    """Generate a full publications HTML page."""
    header = EN_HEADER if lang == "en" else ES_HEADER
    parts = [header]

    # Filter buttons
    parts.append(render_filter_buttons(lang))

    # Working papers (special: not in SECTIONS, uses "working-paper" type)
    wp_pubs = [p for p in pubs if p["publication_type"] == "working-paper"]
    wp_pubs.sort(key=sort_key)
    if wp_pubs:
        wp_label = "Working Papers" if lang == "en" else "Documentos de Trabajo"
        parts.append(f'            <div class="pub-section" data-category="working-papers">')
        parts.append(f'            <h3 class="pub-category">{html.escape(wp_label)}</h3>')
        parts.append('            <div class="pub-list">')
        for i, pub in enumerate(wp_pubs):
            if i > 0:
                parts.append("")
            parts.append(render_pub_item(pub, lang))
        parts.append("            </div>")
        parts.append("            </div>\n")

    for pub_type, en_label, es_label, filter_slug in SECTIONS:
        section_pubs = [p for p in pubs if p["publication_type"] == pub_type]
        section_pubs.sort(key=sort_key)

        if not section_pubs:
            continue

        label = en_label if lang == "en" else es_label
        parts.append(f'            <div class="pub-section" data-category="{filter_slug}">')
        parts.append(f'            <h3 class="pub-category">{html.escape(label)}</h3>')
        parts.append('            <div class="pub-list">')

        for i, pub in enumerate(section_pubs):
            if i > 0:
                parts.append("")
            parts.append(render_pub_item(pub, lang))

        parts.append("            </div>")
        parts.append("            </div>\n")

    parts.append(FOOTER)
    return "\n".join(parts)


def main():
    with open(JSON_PATH, "r", encoding="utf-8") as f:
        pubs = json.load(f)

    en_html = generate_page(pubs, "en")
    with open(EN_OUTPUT, "w", encoding="utf-8", newline="\n") as f:
        f.write(en_html)
    print(f"Generated {EN_OUTPUT}")

    es_html = generate_page(pubs, "es")
    with open(ES_OUTPUT, "w", encoding="utf-8", newline="\n") as f:
        f.write(es_html)
    print(f"Generated {ES_OUTPUT}")


if __name__ == "__main__":
    main()
