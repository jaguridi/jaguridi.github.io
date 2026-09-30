#!/usr/bin/env python3
"""Refresh scholar_stats.json from the public Google Scholar profile.

Fetches the profile page, parses the citation totals and the per-year
histogram, and — only if something changed — rewrites scholar_stats.json
and regenerates the publications pages.

Exit codes: 0 = updated, 1 = fetch/parse failed (nothing written), 3 = no change.
"""

import datetime
import json
import re
import subprocess
import sys
import urllib.request
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
STATS_PATH = SCRIPT_DIR / "scholar_stats.json"
USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/128.0 Safari/537.36"
)


def fetch(url):
    req = urllib.request.Request(url + "&hl=en", headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=30) as resp:
        return resp.read().decode("utf-8", errors="replace")


def parse(page):
    """Return (citations, h_index, i10_index, {year: count}) from a profile page."""
    # Summary table: All / Since-YYYY pairs for citations, h-index, i10-index
    cells = [int(n) for n in re.findall(r'class="gsc_rsb_std">(\d+)<', page)]
    if len(cells) != 6:
        raise ValueError(f"expected 6 summary cells, found {len(cells)} (blocked or layout changed?)")
    citations, h_index, i10_index = cells[0], cells[2], cells[4]

    # Histogram: year labels in order; bars carry z-index 1 for the latest year,
    # 2 for the one before, etc. Years with zero citations have no bar.
    years = re.findall(r'class="gsc_g_t"[^>]*>(\d{4})<', page)
    bars = re.findall(r'class="gsc_g_a"[^>]*z-index:(\d+)[^>]*><span class="gsc_g_al">(\d+)<', page)
    if not years or not bars:
        raise ValueError("citation histogram not found")
    per_year = {y: 0 for y in years}
    for z, count in bars:
        per_year[years[-int(z)]] = int(count)
    return citations, h_index, i10_index, per_year


def main():
    stats = json.loads(STATS_PATH.read_text(encoding="utf-8"))
    try:
        citations, h_index, i10_index, per_year = parse(fetch(stats["profile_url"]))
    except Exception as exc:  # network error, captcha, or markup change
        print(f"FAILED: {exc}")
        return 1

    new = {
        "citations": citations,
        "h_index": h_index,
        "i10_index": i10_index,
        "citations_per_year": per_year,
    }
    old = {k: stats[k] for k in new}
    if new == old:
        print(f"No change: {citations} citations, h {h_index}, i10 {i10_index}")
        return 3

    if citations < stats["citations"]:
        # Scholar totals occasionally dip after deduplication; still accept, but say so.
        print(f"Note: citations went down ({stats['citations']} -> {citations})")

    stats.update(new)
    stats["updated"] = datetime.date.today().isoformat()
    STATS_PATH.write_text(json.dumps(stats, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    subprocess.run([sys.executable, str(SCRIPT_DIR / "generate_html.py")], check=True)
    print(
        f"Updated: {old['citations']} -> {citations} citations, "
        f"h {old['h_index']} -> {h_index}, i10 {old['i10_index']} -> {i10_index}"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
