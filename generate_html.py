#!/usr/bin/env python3
"""Regenerate publications.html and es/publications.html from publications.json."""

import json
import html
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
JSON_PATH = SCRIPT_DIR / "publications.json"
STATS_PATH = SCRIPT_DIR / "scholar_stats.json"
EN_OUTPUT = SCRIPT_DIR / "publications.html"
ES_OUTPUT = SCRIPT_DIR / "es" / "publications.html"

# Section order, display names, and filter data-category slugs
SECTIONS = [
    ("journal", "Peer-Reviewed Journal Articles", "Artículos en Revistas con Revisión de Pares", "journals"),
    ("archival-conference", "Archival Conference Papers", "Artículos de Conferencia Archivados", "conferences"),
    ("workshop", "Workshop Papers and Extended Abstracts", "Artículos de Taller y Resúmenes Extendidos", "workshops"),
    ("book-chapter", "Book Chapters", "Capítulos de Libro", "books"),
    ("policy-report", "Policy Reports", "Informes de Política Pública", "reports"),
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
    <link rel="canonical" href="https://www.jaguridi.cl/publications.html">
    <link rel="alternate" hreflang="en" href="https://www.jaguridi.cl/publications.html">
    <link rel="alternate" hreflang="es" href="https://www.jaguridi.cl/es/publications.html">
    <link rel="alternate" hreflang="x-default" href="https://www.jaguridi.cl/publications.html">
    <link rel="icon" type="image/svg+xml" href="favicon.svg">
    <link rel="icon" type="image/png" sizes="32x32" href="favicon-32.png">
    <link rel="apple-touch-icon" href="favicon.png">

    <!-- Open Graph -->
    <meta property="og:title" content="Publications | Jose A. Guridi">
    <meta property="og:description" content="Academic publications by Jose A. Guridi: journal articles, conference papers, book chapters, and policy reports on AI governance, HCI, and CSCW.">
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://www.jaguridi.cl/publications.html">
    <meta property="og:image" content="https://www.jaguridi.cl/images/og-image.png">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:site" content="@JguridiB">
    <meta name="twitter:title" content="Publications | Jose A. Guridi">
    <meta name="twitter:description" content="Academic publications by Jose A. Guridi: journal articles, conference papers, book chapters, and policy reports on AI governance, HCI, and CSCW.">
    <meta name="twitter:image" content="https://www.jaguridi.cl/images/og-image.png">

    <script>
    (function() {
        var theme = localStorage.getItem('theme');
        if (theme) {
            document.documentElement.setAttribute('data-theme', theme);
        }
    })();
    </script>

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
            <div class="nav-links">
                <a href="index.html#about">About</a>
                <a href="news.html">News</a>
                <a href="publications.html">Publications</a>
                <a href="projects.html">Projects</a>
                <a href="talks.html">Talks</a>
                <a href="index.html#contact">Contact</a>
                <span class="lang-switch"><span class="active-lang">EN</span> / <a href="es/publications.html">ES</a></span>
            </div>
            <div class="nav-actions">
                <button class="theme-toggle" id="theme-toggle" aria-label="Toggle theme" title="Toggle theme">
                    <svg class="theme-icon-moon" viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-5.4-5.4c0-1.81.89-3.4 2.26-4.4C12.92 3.04 12.46 3 12 3z"/></svg>
                    <svg class="theme-icon-sun" viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58a.996.996 0 0 0-1.41 0 .996.996 0 0 0 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37a.996.996 0 0 0-1.41 0 .996.996 0 0 0 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96a.996.996 0 0 0 0-1.41.996.996 0 0 0-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36a.996.996 0 0 0 0-1.41.996.996 0 0 0 0 1.41l1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/></svg>
                </button>
                <button class="nav-toggle" aria-label="Toggle navigation" aria-expanded="false">
                    <span></span><span></span><span></span>
                </button>
            </div>
        </nav>
    </header>

    <main id="main-content">
        <section class="section pub-page" style="border-bottom: none;">
            <h2>Publications</h2>
"""

ES_HEADER = """\
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Publicaciones | Jose A. Guridi</title>
    <meta name="description" content="Publicaciones académicas de Jose A. Guridi: artículos de revista, conferencias, capítulos de libro e informes de política sobre gobernanza de IA, HCI y CSCW.">
    <link rel="canonical" href="https://www.jaguridi.cl/es/publications.html">
    <link rel="alternate" hreflang="en" href="https://www.jaguridi.cl/publications.html">
    <link rel="alternate" hreflang="es" href="https://www.jaguridi.cl/es/publications.html">
    <link rel="alternate" hreflang="x-default" href="https://www.jaguridi.cl/publications.html">
    <link rel="icon" type="image/svg+xml" href="../favicon.svg">
    <link rel="icon" type="image/png" sizes="32x32" href="../favicon-32.png">
    <link rel="apple-touch-icon" href="../favicon.png">

    <!-- Open Graph -->
    <meta property="og:title" content="Publicaciones | Jose A. Guridi">
    <meta property="og:description" content="Publicaciones académicas de Jose A. Guridi: artículos de revista, conferencias, capítulos de libro e informes de política sobre gobernanza de IA, HCI y CSCW.">
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://www.jaguridi.cl/es/publications.html">
    <meta property="og:image" content="https://www.jaguridi.cl/images/og-image.png">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:locale" content="es_ES">

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:site" content="@JguridiB">
    <meta name="twitter:title" content="Publicaciones | Jose A. Guridi">
    <meta name="twitter:description" content="Publicaciones académicas de Jose A. Guridi: artículos de revista, conferencias, capítulos de libro e informes de política sobre gobernanza de IA, HCI y CSCW.">
    <meta name="twitter:image" content="https://www.jaguridi.cl/images/og-image.png">

    <script>
    (function() {
        var theme = localStorage.getItem('theme');
        if (theme) {
            document.documentElement.setAttribute('data-theme', theme);
        }
    })();
    </script>

    <link rel="stylesheet" href="../style.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Source+Sans+3:ital,wght@0,400;0,600;0,700;1,400&family=Source+Serif+4:wght@400;600;700&display=swap" rel="stylesheet">
</head>
<body>
    <a href="#main-content" class="skip-to-content">Ir al contenido</a>
    <header>
        <nav aria-label="Navegación principal">
            <a href="index.html" class="nav-name">Jose A. Guridi</a>
            <div class="nav-links">
                <a href="index.html#sobre">Sobre mí</a>
                <a href="news.html">Novedades</a>
                <a href="publications.html">Publicaciones</a>
                <a href="projects.html">Proyectos</a>
                <a href="talks.html">Charlas</a>
                <a href="index.html#contacto">Contacto</a>
                <span class="lang-switch"><a href="../publications.html">EN</a> / <span class="active-lang">ES</span></span>
            </div>
            <div class="nav-actions">
                <button class="theme-toggle" id="theme-toggle" aria-label="Cambiar tema" title="Cambiar tema">
                    <svg class="theme-icon-moon" viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-5.4-5.4c0-1.81.89-3.4 2.26-4.4C12.92 3.04 12.46 3 12 3z"/></svg>
                    <svg class="theme-icon-sun" viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58a.996.996 0 0 0-1.41 0 .996.996 0 0 0 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37a.996.996 0 0 0-1.41 0 .996.996 0 0 0 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96a.996.996 0 0 0 0-1.41.996.996 0 0 0-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36a.996.996 0 0 0 0-1.41.996.996 0 0 0 0 1.41l1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/></svg>
                </button>
                <button class="nav-toggle" aria-label="Abrir menú" aria-expanded="false">
                    <span></span><span></span><span></span>
                </button>
            </div>
        </nav>
    </header>

    <main id="main-content">
        <section class="section pub-page" style="border-bottom: none;">
            <h2>Publicaciones</h2>
"""

FOOTER_EN = """\
        </section>
    </main>

    <footer>
        <p>&copy; 2026 Jose A. Guridi</p>
    </footer>

    <script src="main.js"></script>
</body>
</html>
"""

FOOTER_ES = """\
        </section>
    </main>

    <footer>
        <p>&copy; 2026 Jose A. Guridi</p>
    </footer>

    <script src="../main.js"></script>
</body>
</html>
"""


MONTHS_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
MONTHS_ES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]


def render_scholar_stats(stats, lang="en"):
    """Render the Google Scholar citation card (inline on narrow screens, right margin on wide ones)."""
    es = lang == "es"
    per_year = sorted((int(y), c) for y, c in stats["citations_per_year"].items())
    peak = max(c for _, c in per_year) or 1
    peak_year = max(per_year, key=lambda yc: (yc[1], yc[0]))[0]
    year, month, _ = stats["updated"].split("-")
    updated = f"{(MONTHS_ES if es else MONTHS_EN)[int(month) - 1]} {year}"

    t = {
        "aside": "Métricas de citas en Google Scholar" if es else "Google Scholar citation metrics",
        "citations": "Citas" if es else "Citations",
        "per_year": "Citas por año" if es else "Citations per year",
        "updated": f"Actualizado {updated}" if es else f"Updated {updated}",
    }
    fmt = lambda n: f"{n:,}".replace(",", ".") if es else f"{n:,}"
    summary = ", ".join(f"{y}: {c}" for y, c in per_year)

    lines = [
        f'            <aside class="scholar-stats" aria-label="{t["aside"]}">',
        '                <div class="scholar-card">',
        f'                    <p class="scholar-title"><a href="{html.escape(stats["profile_url"])}" target="_blank" rel="noopener noreferrer">Google Scholar</a></p>',
        '                    <dl class="scholar-figures">',
        f'                        <div><dt>{t["citations"]}</dt><dd>{fmt(stats["citations"])}</dd></div>',
        f'                        <div><dt>h-index</dt><dd>{stats["h_index"]}</dd></div>',
        f'                        <div><dt>i10-index</dt><dd>{stats["i10_index"]}</dd></div>',
        '                    </dl>',
        '                    <div class="scholar-chart">',
        f'                        <p class="scholar-chart-label">{t["per_year"]}</p>',
        f'                        <div class="scholar-bars" role="img" aria-label="{t["per_year"]}: {summary}">',
    ]
    for y, c in per_year:
        height = "0" if c == 0 else f"max(2px, {c / peak * 100:.1f}%)"
        value = f'<span class="scholar-bar-value">{fmt(c)}</span>' if y == peak_year else ""
        lines.append(
            f'                            <span class="scholar-col" data-tip="{y}: {fmt(c)}">'
            f'<span class="scholar-bar" style="height: {height}">{value}</span></span>'
        )
    lines += [
        '                        </div>',
        f'                        <div class="scholar-axis" aria-hidden="true"><span>{per_year[0][0]}</span><span>{per_year[-1][0]}</span></div>',
        '                    </div>',
        f'                    <p class="scholar-updated">{t["updated"]}</p>',
        '                </div>',
        '            </aside>\n',
    ]
    return "\n".join(lines)


def sort_key(pub):
    """Sort publications by year descending. Null years (forthcoming) go first."""
    y = pub.get("year")
    return (0, 0) if y is None else (1, -y)


def render_pub_item(pub, lang="en"):
    """Render a single publication as an HTML div."""
    lines = []
    lines.append('                <div class="pub-item">')

    esc = lambda s: html.escape(s, quote=False)

    # Title
    if pub.get("title_html"):
        title_content = pub["title_html"]
    else:
        title_content = esc(pub["title"])

    if pub.get("url"):
        lines.append(
            f'                    <p class="pub-title">'
            f'<a href="{html.escape(pub["url"])}" target="_blank" rel="noopener noreferrer">'
            f'{title_content}</a></p>'
        )
    else:
        lines.append(f'                    <p class="pub-title">{title_content}</p>')

    # Authors
    raw_authors = pub.get("authors_es", pub["authors"]) if lang == "es" else pub["authors"]
    formatted_authors = []
    for a in raw_authors:
        if a in ["Jose A. Guridi", "Jose Antonio Guridi", "Jose Antonio Guridi Bustos"]:
            formatted_authors.append(f'<strong>{esc(a)}</strong>')
        else:
            formatted_authors.append(esc(a))
    authors_str = ", ".join(formatted_authors)
    lines.append(f'                    <p class="pub-authors">{authors_str}</p>')

    # Venue
    raw_venue = pub.get("venue_es", pub["venue"]) if lang == "es" else pub["venue"]
    venue_str = raw_venue if pub.get("is_html_venue") else esc(raw_venue)
    lines.append(f'                    <p class="pub-venue">{venue_str}</p>')

    # Badges / Links
    link_items = []
    if pub.get("open_access_url") or pub.get("pdf_url"):
        oa_href = html.escape(pub.get("open_access_url") or pub["pdf_url"])
        oa_label = "PDF / Open Access" if lang == "en" else "PDF / Acceso Abierto"
        link_items.append(f'<a href="{oa_href}" class="pub-link-badge" target="_blank" rel="noopener noreferrer">{oa_label}</a>')
    if pub.get("slides_link"):
        slides_href = html.escape(pub["slides_link"])
        slides_label = "Slides" if lang == "en" else "Presentación"
        link_items.append(f'<a href="{slides_href}" class="pub-link-badge" target="_blank" rel="noopener noreferrer">{slides_label}</a>')

    if link_items:
        lines.append(f'                    <div class="pub-links">{" ".join(link_items)}</div>')

    # BibTeX
    if pub.get("bibtex"):
        copy_label = "Copy" if lang == "en" else "Copiar"
        bib_code = html.escape(pub["bibtex"].strip())
        lines.append('                    <details class="pub-bibtex">')
        lines.append('                        <summary>BibTeX</summary>')
        lines.append('                        <div class="pub-bibtex-box">')
        lines.append(f'                            <button class="pub-copy-bibtex" type="button" aria-label="Copy BibTeX">{copy_label}</button>')
        lines.append(f'                            <pre><code>{bib_code}</code></pre>')
        lines.append('                        </div>')
        lines.append('                    </details>')

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


def generate_page(pubs, lang="en", stats=None):
    """Generate a full publications HTML page."""
    header = EN_HEADER if lang == "en" else ES_HEADER
    footer = FOOTER_EN if lang == "en" else FOOTER_ES
    parts = [header]

    # Google Scholar citation card
    if stats:
        parts.append(render_scholar_stats(stats, lang))

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
        id_attr = ' id="reports"' if filter_slug == "reports" else ""
        parts.append(f'            <div class="pub-section" data-category="{filter_slug}"{id_attr}>')
        parts.append(f'            <h3 class="pub-category">{html.escape(label)}</h3>')
        parts.append('            <div class="pub-list">')

        for i, pub in enumerate(section_pubs):
            if i > 0:
                parts.append("")
            parts.append(render_pub_item(pub, lang))

        parts.append("            </div>")
        parts.append("            </div>\n")

    parts.append(footer)
    return "\n".join(parts)


def main():
    with open(JSON_PATH, "r", encoding="utf-8") as f:
        pubs = json.load(f)
    stats = None
    if STATS_PATH.exists():
        with open(STATS_PATH, "r", encoding="utf-8") as f:
            stats = json.load(f)

    en_html = generate_page(pubs, "en", stats)
    with open(EN_OUTPUT, "w", encoding="utf-8", newline="\n") as f:
        f.write(en_html)
    print(f"Generated {EN_OUTPUT}")

    es_html = generate_page(pubs, "es", stats)
    with open(ES_OUTPUT, "w", encoding="utf-8", newline="\n") as f:
        f.write(es_html)
    print(f"Generated {ES_OUTPUT}")


if __name__ == "__main__":
    main()
