#!/usr/bin/env python3
"""Regenerate publications.html and es/publications.html from publications.json."""

import json
import html
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
JSON_PATH = SCRIPT_DIR / "publications.json"
EN_OUTPUT = SCRIPT_DIR / "publications.html"
ES_OUTPUT = SCRIPT_DIR / "es" / "publications.html"

# Section order and display names
SECTIONS = [
    ("journal", "Peer-Reviewed Journal Articles", "Articulos en Revistas con Revision de Pares"),
    ("archival-conference", "Archival Conference Papers", "Articulos de Conferencia Archivados"),
    ("workshop", "Workshop Papers and Extended Abstracts", "Articulos de Taller y Resumenes Extendidos"),
    ("book-chapter", "Book Chapters", "Capitulos de Libro"),
    ("policy-report", "Policy Reports", "Informes de Politica Publica"),
]

EN_HEADER = """\
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Publications | Jose A. Guridi</title>
    <link rel="stylesheet" href="style.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Source+Sans+3:ital,wght@0,300;0,400;0,600;0,700;1,400&family=Source+Serif+4:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet">
</head>
<body>
    <header>
        <nav>
            <a href="index.html" class="nav-name">Jose A. Guridi</a>
            <div class="nav-links">
                <a href="index.html#about">About</a>
                <a href="news.html">News</a>
                <a href="publications.html">Publications</a>
                <a href="projects.html">Projects</a>
                <a href="CV/Jose_Guridi_CV.pdf" target="_blank">CV</a>
                <a href="index.html#contact">Contact</a>
                <span class="lang-switch"><span class="active-lang">EN</span> / <a href="es/publications.html">ES</a></span>
            </div>
        </nav>
    </header>

    <main>
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
    <link rel="stylesheet" href="../style.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Source+Sans+3:ital,wght@0,300;0,400;0,600;0,700;1,400&family=Source+Serif+4:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet">
</head>
<body>
    <header>
        <nav>
            <a href="index.html" class="nav-name">Jose A. Guridi</a>
            <div class="nav-links">
                <a href="index.html#sobre">Sobre mi</a>
                <a href="news.html">Novedades</a>
                <a href="publications.html">Publicaciones</a>
                <a href="projects.html">Proyectos</a>
                <a href="../CV/Jose_Guridi_CV.pdf" target="_blank">CV</a>
                <a href="index.html#contacto">Contacto</a>
                <span class="lang-switch"><a href="../publications.html">EN</a> / <span class="active-lang">ES</span></span>
            </div>
        </nav>
    </header>

    <main>
        <section class="section" style="border-bottom: none;">
            <h2>Publicaciones</h2>
"""

FOOTER = """\
        </section>
    </main>

    <footer>
        <p>&copy; 2026 Jose A. Guridi</p>
    </footer>
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
            f'<a href="{html.escape(pub["url"])}" target="_blank">'
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


def generate_page(pubs, lang="en"):
    """Generate a full publications HTML page."""
    header = EN_HEADER if lang == "en" else ES_HEADER
    parts = [header]

    for pub_type, en_label, es_label in SECTIONS:
        section_pubs = [p for p in pubs if p["publication_type"] == pub_type]
        section_pubs.sort(key=sort_key)

        if not section_pubs:
            continue

        label = en_label if lang == "en" else es_label
        parts.append(f'            <h3 class="pub-category">{html.escape(label)}</h3>')
        parts.append('            <div class="pub-list">')

        for i, pub in enumerate(section_pubs):
            if i > 0:
                parts.append("")
            parts.append(render_pub_item(pub, lang))

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
