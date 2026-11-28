#!/usr/bin/env python3
"""Ajoute (ou met à jour) canonical, Open Graph et JSON-LD dans les pages du site.

Idempotent : le bloc est délimité par <!-- seo:debut --> / <!-- seo:fin -->.
Les canonical pointent vers le domaine final ; sans effet tant que les pages sont en noindex.
Usage : python3 scripts/balises_partage.py  (depuis la racine du site)
"""
import html
import json
import os
import re
import sys

DOMAINE = "https://bebesnageursyonnais.com"
IMAGE = f"{DOMAINE}/assets/img/partage-bny.png"
PAGES = [
    "", "eveil-aquatique/", "notre-pedagogie/", "planning/", "conseils/", "chansons/",
    "inscription/", "questions-frequentes/", "le-club/", "le-club/documents/",
    "rejoindre-l-equipe/", "contact/", "mentions-legales/", "confidentialite/",
]
CLUB = {
    "@context": "https://schema.org",
    "@type": "SportsClub",
    "name": "Les Bébés Nageurs Yonnais",
    "alternateName": "Club des Bébés Nageurs Yonnais",
    "description": "Association de parents bénévoles : éveil aquatique en famille pour les enfants de 4 mois à 6 ans, le samedi matin à la piscine CAP de La Roche-sur-Yon.",
    "url": DOMAINE + "/",
    "logo": f"{DOMAINE}/assets/img/logo-bbny.svg",
    "image": IMAGE,
    "email": "bbnageursyonnais@gmail.com",
    "foundingDate": "1976",
    "address": {
        "@type": "PostalAddress",
        "streetAddress": "Maison de quartier Jean Yole, 16 impasse Jean Bart",
        "postalCode": "85000",
        "addressLocality": "La Roche-sur-Yon",
        "addressCountry": "FR",
    },
    "areaServed": "La Roche-sur-Yon",
    "sport": "Éveil aquatique",
}
DEBUT, FIN = "<!-- seo:debut -->", "<!-- seo:fin -->"


def bloc(chemin, titre, description):
    url = f"{DOMAINE}/{chemin}"
    lignes = [
        DEBUT,
        f'<link rel="canonical" href="{url}">',
        '<meta property="og:type" content="website">',
        '<meta property="og:locale" content="fr_FR">',
        '<meta property="og:site_name" content="Les Bébés Nageurs Yonnais">',
        f'<meta property="og:title" content="{html.escape(titre, quote=True)}">',
        f'<meta property="og:description" content="{html.escape(description, quote=True)}">',
        f'<meta property="og:url" content="{url}">',
        f'<meta property="og:image" content="{IMAGE}">',
        '<meta property="og:image:width" content="1200">',
        '<meta property="og:image:height" content="630">',
        '<meta name="twitter:card" content="summary_large_image">',
    ]
    if chemin == "":
        lignes.append('<script type="application/ld+json">'
                      + json.dumps(CLUB, ensure_ascii=False) + "</script>")
    lignes.append(FIN)
    return "\n".join(lignes)


def main(racine="."):
    for chemin in PAGES:
        f = os.path.join(racine, chemin, "index.html")
        src = open(f, encoding="utf-8").read()
        titre = html.unescape(re.search(r"<title>(.*?)</title>", src, re.S).group(1).strip())
        m = re.search(r'<meta name="description" content="([^"]*)"', src)
        description = html.unescape(m.group(1)) if m else titre
        src = re.sub(re.escape(DEBUT) + r".*?" + re.escape(FIN) + r"\n?", "", src, flags=re.S)
        src = src.replace("</head>", bloc(chemin, titre, description) + "\n</head>", 1)
        open(f, "w", encoding="utf-8").write(src)
    print(f"{len(PAGES)} pages mises à jour")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else ".")
