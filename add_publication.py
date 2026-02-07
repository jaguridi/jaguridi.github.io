#!/usr/bin/env python3
"""Interactively add a new publication to publications.json and regenerate HTML."""

import json
import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
JSON_PATH = SCRIPT_DIR / "publications.json"

VALID_TYPES = {
    "1": "journal",
    "2": "archival-conference",
    "3": "workshop",
    "4": "book-chapter",
    "5": "policy-report",
}

TYPE_LABELS = {
    "1": "Peer-Reviewed Journal Article",
    "2": "Archival Conference Paper",
    "3": "Workshop Paper / Extended Abstract",
    "4": "Book Chapter",
    "5": "Policy Report",
}


def prompt(label, required=True, default=None):
    """Prompt user for input."""
    suffix = f" [{default}]" if default else ""
    suffix += ": " if required else " (optional, press Enter to skip): "
    while True:
        value = input(f"  {label}{suffix}").strip()
        if not value and default:
            return default
        if not value and not required:
            return None
        if not value and required:
            print("    This field is required.")
            continue
        return value


def main():
    print("\n=== Add New Publication ===\n")

    title = prompt("Title")

    authors_str = prompt("Authors (comma-separated)")
    authors = [a.strip() for a in authors_str.split(",")]

    venue = prompt("Venue (e.g., 'Research Policy, 49(2), 2020')")

    venue_es = prompt("Venue (Spanish override)", required=False)

    while True:
        print("\n  Publication type:")
        for k, label in TYPE_LABELS.items():
            print(f"    {k}. {label}")
        choice = input("  Enter number (1-5): ").strip()
        if choice in VALID_TYPES:
            pub_type = VALID_TYPES[choice]
            break
        print("    Invalid choice. Please enter 1-5.")

    while True:
        year_str = prompt("Year (or press Enter for forthcoming)", required=False)
        if year_str is None:
            year = None
            break
        try:
            year = int(year_str)
            break
        except ValueError:
            print("    Please enter a valid year number.")

    url = prompt("URL (DOI or link)", required=False)

    abstract_link = None
    slides_link = None
    if pub_type == "workshop":
        abstract_link = prompt("Abstract link", required=False)
        slides_link = prompt("Slides link", required=False)

    pub = {
        "title": title,
        "authors": authors,
        "venue": venue,
        "year": year,
        "publication_type": pub_type,
        "url": url,
        "abstract_link": abstract_link,
        "slides_link": slides_link,
    }
    if venue_es:
        pub["venue_es"] = venue_es

    # Load existing, add, save
    with open(JSON_PATH, "r", encoding="utf-8") as f:
        pubs = json.load(f)

    pubs.append(pub)

    with open(JSON_PATH, "w", encoding="utf-8", newline="\n") as f:
        json.dump(pubs, f, indent=2, ensure_ascii=False)
        f.write("\n")

    print(f"\nAdded to {JSON_PATH}")

    # Regenerate HTML
    print("Regenerating HTML...")
    from generate_html import main as generate
    generate()

    print("\nDone! Review the changes and commit when ready.")


if __name__ == "__main__":
    main()
