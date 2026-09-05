#!/usr/bin/env python3
"""Assemble static St Thomas pages from shells + partials + content (no JS required for primary content)."""
from __future__ import annotations

import json
import re
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DOMAIN = "https://stthomasshoreexcursion.com"
TODAY = date.today().isoformat()

# slug -> SEO + layout metadata
PAGES = {
    "index.html": {
        "slug": "",
        "title": "St Thomas Shore Excursions | Cruise Port Beaches, Tours & Planning",
        "description": "Plan a St Thomas cruise port day around Havensight or Crown Bay — beaches, snorkelling, private tours and honest timing guidance for Magens Bay, Sapphire and Coki.",
        "page": "home",
        "hero": "partials/hero-home.html",
        "trust": "partials/trust-strip.html",
        "content": "content/home.html",
        "og_image": "images/hero-st-thomas-magens-bay.jpg",
        "schema": "home",
    },
    "best-beaches-in-st-thomas-for-cruise-passengers.html": {
        "slug": "best-beaches-in-st-thomas-for-cruise-passengers",
        "title": "Best Beaches in St Thomas for Cruise Passengers | Magens, Sapphire, Coki",
        "description": "Compare Magens Bay, Sapphire Beach, Coki Beach and Secret Harbour for a St Thomas cruise stop — swimming, snorkelling, families, facilities and shore-time planning.",
        "page": "beaches-guide",
        "hero": "partials/hero-best-beaches.html",
        "content": "content/best-beaches-in-st-thomas-for-cruise-passengers.html",
        "og_image": "images/magens-bay-beach.jpg",
        "schema": "webpage",
    },
    "one-day-in-st-thomas-from-cruise-ship.html": {
        "slug": "one-day-in-st-thomas-from-cruise-ship",
        "title": "One Day in St Thomas from a Cruise Ship | Realistic Port-Day Plans",
        "description": "Realistic one-day St Thomas plans for cruise passengers — shorter calls, beach days, sightseeing plus beach, and when a private or organised excursion makes sense.",
        "page": "one-day",
        "hero": "partials/hero-one-day.html",
        "content": "content/one-day-in-st-thomas-from-cruise-ship.html",
        "og_image": "images/cruise-port.jpg",
        "schema": "webpage",
    },
    "st-thomas-cruise-port-guide.html": {
        "slug": "st-thomas-cruise-port-guide",
        "title": "St Thomas Cruise Port Guide | Havensight, Crown Bay & Charlotte Amalie",
        "description": "Orient yourself at St Thomas cruise ports — Havensight, Crown Bay, Charlotte Amalie links, transport planning, shore time and return buffers for excursion days.",
        "page": "port",
        "hero": "partials/hero-port-guide.html",
        "content": "content/st-thomas-cruise-port-guide.html",
        "og_image": "images/cruise-port.jpg",
        "schema": "webpage",
    },
    "best-st-thomas-shore-excursions.html": {
        "slug": "best-st-thomas-shore-excursions",
        "title": "Best St Thomas Shore Excursions | Compare Cruise Port Tours",
        "description": "Editorial comparison of St Thomas shore excursions for cruise passengers — beach days, snorkelling, sightseeing and private touring options.",
        "page": "excursions",
        "hero": "partials/hero-excursions.html",
        "content": "content/best-st-thomas-shore-excursions.html",
        "og_image": "images/beach-excursion.jpg",
        "schema": "webpage",
    },
    "st-thomas-beach-excursions.html": {
        "slug": "st-thomas-beach-excursions",
        "title": "St Thomas Beach Excursions | Magens, Sapphire & Resort Beach Days",
        "description": "Compare St Thomas beach excursions for cruise guests — resort beach days, Magens and Sapphire-style escapes, and how to match a beach day to your ship schedule.",
        "page": "beaches",
        "hero": "partials/hero-beaches.html",
        "content": "content/st-thomas-beach-excursions.html",
        "og_image": "images/sapphire-beach.jpg",
        "schema": "webpage",
    },
    "st-thomas-snorkeling-tours.html": {
        "slug": "st-thomas-snorkeling-tours",
        "title": "St Thomas Snorkelling Tours | Reef, Turtle & Kayak Options",
        "description": "Compare St Thomas snorkelling tours for cruise passengers — reef trips, turtle snorkels, kayak combinations and practical shore-time considerations.",
        "page": "snorkeling",
        "hero": "partials/hero-snorkeling.html",
        "content": "content/st-thomas-snorkeling-tours.html",
        "og_image": "images/snorkeling-tour.jpg",
        "schema": "webpage",
    },
    "private-st-thomas-tours.html": {
        "slug": "private-st-thomas-tours",
        "title": "Private St Thomas Tours | Jeep, Half Day & Sapphire Beach",
        "description": "Compare private St Thomas tours for cruise passengers — Sapphire Beach days, jeep adventures and flexible half-day island touring.",
        "page": "private",
        "hero": "partials/hero-private.html",
        "content": "content/private-st-thomas-tours.html",
        "og_image": "images/private-tour.jpg",
        "schema": "webpage",
    },
    "private-sapphire-beach-tour-st-thomas.html": {
        "slug": "private-sapphire-beach-tour-st-thomas",
        "title": "Private Sapphire Beach Tour St Thomas | Cruise-Friendly Beach Day",
        "description": "Editorial guide to a private Sapphire Beach-focused St Thomas tour for cruise passengers — who it suits, timing context and planning considerations.",
        "page": "private",
        "hero": "partials/hero-private-sapphire.html",
        "content": "content/private-sapphire-beach-tour-st-thomas.html",
        "og_image": "images/sapphire-beach.jpg",
        "schema": "webpage",
    },
    "private-st-thomas-half-day-tour.html": {
        "slug": "private-st-thomas-half-day-tour",
        "title": "Private St Thomas Half Day Tour | Flexible Cruise Shore Time",
        "description": "Plan a private half-day St Thomas tour around your cruise call — viewpoints, beaches and Charlotte Amalie with return-buffer thinking.",
        "page": "private",
        "hero": "partials/hero-private-half-day.html",
        "content": "content/private-st-thomas-half-day-tour.html",
        "og_image": "images/private-vip-island-tour.jpg",
        "schema": "webpage",
    },
    "private-st-thomas-jeep-tour.html": {
        "slug": "private-st-thomas-jeep-tour",
        "title": "Private St Thomas Jeep Tour | Island Viewpoints & Beach Time",
        "description": "Editorial overview of a private St Thomas jeep-style tour for cruise guests — viewpoints, photo stops and how it fits a port day.",
        "page": "private",
        "hero": "partials/hero-private-jeep.html",
        "content": "content/private-st-thomas-jeep-tour.html",
        "og_image": "images/private-tour.jpg",
        "schema": "webpage",
    },
    "st-thomas-cruise-excursions-for-families.html": {
        "slug": "st-thomas-cruise-excursions-for-families",
        "title": "St Thomas Cruise Excursions for Families | Kid-Friendly Port Days",
        "description": "Family-friendly St Thomas shore excursion ideas for cruise passengers — calmer beaches, simpler pacing and practical return planning.",
        "page": "families",
        "hero": "partials/hero-families.html",
        "content": "content/st-thomas-cruise-excursions-for-families.html",
        "og_image": "images/beach-excursion.jpg",
        "schema": "webpage",
    },
    "st-thomas-kayak-hike-snorkel-tour.html": {
        "slug": "st-thomas-kayak-hike-snorkel-tour",
        "title": "St Thomas Kayak, Hike & Snorkel Tour | Active Cruise Excursion",
        "description": "Active St Thomas kayak, hike and snorkel style excursion overview for cruise passengers — suitability, effort level and shore-time notes.",
        "page": "snorkeling",
        "hero": "partials/hero-kayak-hike-snorkel.html",
        "content": "content/st-thomas-kayak-hike-snorkel-tour.html",
        "og_image": "images/kayak-hike-snorkel-st-thomas.jpg",
        "schema": "webpage",
    },
    "st-thomas-kayak-snorkel-adventure.html": {
        "slug": "st-thomas-kayak-snorkel-adventure",
        "title": "St Thomas Kayak & Snorkel Adventure | Cruise Passenger Guide",
        "description": "Kayak and snorkel adventure overview for St Thomas cruise days — who it suits, timing context and links to related guides.",
        "page": "snorkeling",
        "hero": "partials/hero-kayak-snorkel.html",
        "content": "content/st-thomas-kayak-snorkel-adventure.html",
        "og_image": "images/kayak-hike-snorkel-st-thomas.jpg",
        "schema": "webpage",
    },
    "st-thomas-resort-beach-day.html": {
        "slug": "st-thomas-resort-beach-day",
        "title": "St Thomas Resort Beach Day | Easy Cruise Beach Escape",
        "description": "Resort-style St Thomas beach day overview for cruise passengers who want loungers, facilities and a simpler shore plan.",
        "page": "beaches",
        "hero": "partials/hero-resort-beach.html",
        "content": "content/st-thomas-resort-beach-day.html",
        "og_image": "images/sapphire-beach.jpg",
        "schema": "webpage",
    },
    "st-thomas-shopping-sightseeing-beach-tour.html": {
        "slug": "st-thomas-shopping-sightseeing-beach-tour",
        "title": "St Thomas Shopping, Sightseeing & Beach Tour | Mixed Port Day",
        "description": "Mixed St Thomas shopping, sightseeing and beach tour overview for cruise passengers balancing Charlotte Amalie and beach time.",
        "page": "excursions",
        "hero": "partials/hero-shopping-sightseeing-beach.html",
        "content": "content/st-thomas-shopping-sightseeing-beach-tour.html",
        "og_image": "images/charlotte-amalie-harbor.jpg",
        "schema": "webpage",
    },
    "st-thomas-shore-excursions-faq.html": {
        "slug": "st-thomas-shore-excursions-faq",
        "title": "St Thomas Shore Excursions FAQ | Cruise Passenger Answers",
        "description": "FAQ for St Thomas cruise shore excursions — ports, beaches, timing, independent vs organised options and planning tips.",
        "page": "faq",
        "hero": "partials/hero-faq.html",
        "content": "content/st-thomas-shore-excursions-faq.html",
        "og_image": "images/cruise-port.jpg",
        "schema": "faq",
    },
    "st-thomas-snorkel-with-turtles.html": {
        "slug": "st-thomas-snorkel-with-turtles",
        "title": "St Thomas Snorkel with Turtles | Wildlife Cruise Excursion Guide",
        "description": "Turtle snorkelling in St Thomas for cruise passengers — realistic expectations, wildlife caveats and related tour pathways.",
        "page": "snorkeling",
        "hero": "partials/hero-turtle-snorkel.html",
        "content": "content/st-thomas-snorkel-with-turtles.html",
        "og_image": "images/turtle-snorkel-st-thomas.jpg",
        "schema": "webpage",
    },
    "st-thomas-tour-pages.html": {
        "slug": "st-thomas-tour-pages",
        "title": "St Thomas Tour Pages Hub | All Excursion Guides",
        "description": "Hub of St Thomas tour and guide pages for cruise passengers — beaches, snorkelling, private tours and port-day planning.",
        "page": "tours",
        "hero": "partials/hero-tour-hub.html",
        "content": "content/st-thomas-tour-pages.html",
        "og_image": "images/beach-excursion.jpg",
        "schema": "webpage",
    },
    "about.html": {
        "slug": "about",
        "title": "About | St Thomas Shore Excursions",
        "description": "About this independent St Thomas cruise excursion and destination planning guide.",
        "page": "about",
        "hero": "",
        "content": "content/about.html",
        "og_image": "images/hero-st-thomas-magens-bay.jpg",
        "schema": "webpage",
        "main_class": "pt-16",
    },
    "contact.html": {
        "slug": "contact",
        "title": "Contact | St Thomas Shore Excursions",
        "description": "Contact information for the St Thomas Shore Excursions planning guide.",
        "page": "contact",
        "hero": "",
        "content": "content/contact.html",
        "og_image": "images/hero-st-thomas-magens-bay.jpg",
        "schema": "webpage",
        "main_class": "pt-16",
    },
    "privacy.html": {
        "slug": "privacy",
        "title": "Privacy | St Thomas Shore Excursions",
        "description": "Privacy policy for stthomasshoreexcursion.com.",
        "page": "privacy",
        "hero": "",
        "content": "content/privacy.html",
        "og_image": "images/hero-st-thomas-magens-bay.jpg",
        "schema": "webpage",
        "main_class": "pt-16",
    },
    "terms.html": {
        "slug": "terms",
        "title": "Terms | St Thomas Shore Excursions",
        "description": "Terms of use for the St Thomas Shore Excursions planning site.",
        "page": "terms",
        "hero": "",
        "content": "content/terms.html",
        "og_image": "images/hero-st-thomas-magens-bay.jpg",
        "schema": "webpage",
        "main_class": "pt-16",
    },
    "methodology.html": {
        "slug": "methodology",
        "title": "Methodology | St Thomas Shore Excursions",
        "description": "How this St Thomas cruise planning guide is researched and kept honest.",
        "page": "methodology",
        "hero": "",
        "content": "content/methodology.html",
        "og_image": "images/hero-st-thomas-magens-bay.jpg",
        "schema": "webpage",
        "main_class": "pt-16",
    },
}


def read(rel: str) -> str:
    return (ROOT / rel).read_text(encoding="utf-8")


def canon_url(slug: str) -> str:
    return f"{DOMAIN}/" if not slug else f"{DOMAIN}/{slug}"


def extensionlessify_html(html: str) -> str:
    """Convert internal .html hrefs/src roots to extensionless paths."""

    def repl_href(m: re.Match) -> str:
        attr, quote, url = m.group(1), m.group(2), m.group(3)
        if url.startswith(("http://", "https://", "mailto:", "tel:", "#", "data:")):
            return m.group(0)
        if url.startswith("images/") or url.startswith("/images/") or url.startswith("css/") or url.startswith("js/") or url.startswith("partials/") or url.startswith("content/"):
            return m.group(0)
        # strip leading ./
        path = url
        if path.startswith("./"):
            path = path[2:]
        # keep query/hash
        path_only, sep, rest = path.partition("?")
        if not sep:
            path_only, sep, rest = path.partition("#")
            # careful: partition only once for #
        # re-parse properly
        from urllib.parse import urlsplit, urlunsplit

        parts = urlsplit(url if url.startswith("/") or "://" in url else url)
        path = parts.path
        if path.endswith(".html"):
            if path.endswith("index.html"):
                path = path[: -len("index.html")] or "/"
            else:
                path = path[: -len(".html")]
            if path == "index" or path.endswith("/index"):
                path = "/"
            if not path.startswith("/") and path != "":
                path = "/" + path
            if path == "":
                path = "/"
        elif path == "index.html" or path == "/index.html":
            path = "/"
        new = urlunsplit(("", "", path, parts.query, parts.fragment))
        # urlsplit without scheme leaves empty; rebuild relative/absolute
        if url.startswith("/"):
            rebuilt = path
            if parts.query:
                rebuilt += "?" + parts.query
            if parts.fragment:
                rebuilt += "#" + parts.fragment
            return f'{attr}={quote}{rebuilt}{quote}'
        # relative without leading slash → absolute site path for World 2.0
        rebuilt = path if path.startswith("/") else ("/" + path if path else "/")
        if parts.query:
            rebuilt += "?" + parts.query
        if parts.fragment:
            rebuilt += "#" + parts.fragment
        return f'{attr}={quote}{rebuilt}{quote}'

    html = re.sub(r'(href|action)=([\'"])([^\'"]+)\2', repl_href, html)
    return html


def json_ld(meta: dict) -> str:
    slug = meta["slug"]
    url = canon_url(slug)
    graph = [
        {
            "@type": "WebSite",
            "name": "St Thomas Shore Excursions",
            "url": f"{DOMAIN}/",
            "description": "Independent cruise passenger planning guide for St Thomas, US Virgin Islands.",
            "inLanguage": "en-GB",
        },
        {
            "@type": "WebPage",
            "name": meta["title"],
            "url": url,
            "description": meta["description"],
            "isPartOf": {"@type": "WebSite", "name": "St Thomas Shore Excursions", "url": f"{DOMAIN}/"},
            "inLanguage": "en-GB",
        },
    ]
    if slug:
        graph.append(
            {
                "@type": "BreadcrumbList",
                "itemListElement": [
                    {"@type": "ListItem", "position": 1, "name": "Home", "item": f"{DOMAIN}/"},
                    {"@type": "ListItem", "position": 2, "name": meta["title"].split("|")[0].strip(), "item": url},
                ],
            }
        )
    else:
        graph.append(
            {
                "@type": "TouristDestination",
                "name": "St Thomas",
                "description": "US Virgin Islands cruise port destination with Magens Bay, Sapphire Beach, Coki Beach and Charlotte Amalie.",
                "url": f"{DOMAIN}/",
                "touristType": "Cruise passengers",
                "address": {
                    "@type": "PostalAddress",
                    "addressLocality": "Charlotte Amalie",
                    "addressRegion": "St Thomas",
                    "addressCountry": "VI",
                },
            }
        )
    payload = {"@context": "https://schema.org", "@graph": graph}
    return json.dumps(payload, ensure_ascii=False, indent=2)


def build_head(meta: dict) -> str:
    url = canon_url(meta["slug"])
    og = f"{DOMAIN}/{meta['og_image']}"
    title = meta["title"]
    desc = meta["description"]
    preload = ""
    if meta.get("hero") == "partials/hero-home.html":
        preload = f'  <link rel="preload" as="image" href="{meta["og_image"]}" fetchpriority="high" />\n'
    return f"""<!DOCTYPE html>
<html lang="en-GB">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{title}</title>
  <meta name="description" content="{desc}" />
  <link rel="canonical" href="{url}" />
{preload}  <meta property="og:type" content="website" />
  <meta property="og:url" content="{url}" />
  <meta property="og:title" content="{title}" />
  <meta property="og:description" content="{desc}" />
  <meta property="og:image" content="{og}" />
  <meta property="og:site_name" content="St Thomas Shore Excursions" />
  <meta property="og:locale" content="en_GB" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="{title}" />
  <meta name="twitter:description" content="{desc}" />
  <meta name="twitter:image" content="{og}" />
  <script type="application/ld+json">
{json_ld(meta)}
  </script>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="/js/tailwind-config.js"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="/css/site.css" />
</head>
"""


def assemble_page(filename: str, meta: dict) -> str:
    nav = extensionlessify_html(read("partials/nav.html"))
    footer = extensionlessify_html(read("partials/footer.html"))
    hero = extensionlessify_html(read(meta["hero"])) if meta.get("hero") else ""
    trust = extensionlessify_html(read(meta["trust"])) if meta.get("trust") else ""
    content = extensionlessify_html(read(meta["content"]))
    main_class = meta.get("main_class", "")
    main_attr = f' class="{main_class}"' if main_class else ""

    body = f"""<body class="bg-white text-gray-800 antialiased" data-page="{meta["page"]}" data-static="1">
  <div id="site-nav">{nav}</div>
  <div id="page-hero">{hero}</div>
  <div id="page-trust-strip">{trust}</div>
  <main id="page-content"{main_attr}>{content}</main>
  <div id="site-footer">{footer}</div>
  <script src="/js/site.js"></script>
</body>
</html>
"""
    return build_head(meta) + body


def write_sitemap() -> None:
    urls = []
    for fn, meta in PAGES.items():
        urls.append((canon_url(meta["slug"]), 1.0 if not meta["slug"] else 0.8 if meta["slug"] in {
            "best-beaches-in-st-thomas-for-cruise-passengers",
            "one-day-in-st-thomas-from-cruise-ship",
            "st-thomas-cruise-port-guide",
            "best-st-thomas-shore-excursions",
            "st-thomas-beach-excursions",
        } else 0.7))
    lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ]
    for loc, pri in urls:
        lines += [
            "  <url>",
            f"    <loc>{loc}</loc>",
            f"    <lastmod>{TODAY}</lastmod>",
            f"    <changefreq>{'weekly' if pri >= 1 else 'monthly'}</changefreq>",
            f"    <priority>{pri:.1f}</priority>",
            "  </url>",
        ]
    lines.append("</urlset>")
    (ROOT / "sitemap.xml").write_text("\n".join(lines) + "\n", encoding="utf-8")


def write_robots() -> None:
    (ROOT / "robots.txt").write_text(
        "User-agent: *\nAllow: /\n\nSitemap: https://stthomasshoreexcursion.com/sitemap.xml\n",
        encoding="utf-8",
    )


def main() -> None:
    for filename, meta in PAGES.items():
        html = assemble_page(filename, meta)
        (ROOT / filename).write_text(html, encoding="utf-8")
        print(f"wrote {filename}")
    write_sitemap()
    write_robots()
    print(f"sitemap: {len(PAGES)} urls")


if __name__ == "__main__":
    main()
