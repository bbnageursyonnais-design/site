#!/usr/bin/env python3
"""Génère sitemap.xml pour le domaine final (à lancer le jour J, pas avant).

N'inclut que les vraies pages (pas les pages de redirection ni la 404).
Usage : python3 scripts/sitemap.py > sitemap.xml  (depuis la racine du site)
"""
import datetime
import os
import subprocess

DOMAINE = "https://bebesnageursyonnais.com"
PAGES = [
    "", "eveil-aquatique/", "notre-pedagogie/", "planning/", "conseils/", "chansons/",
    "inscription/", "questions-frequentes/", "le-club/", "le-club/documents/",
    "rejoindre-l-equipe/", "contact/", "mentions-legales/", "confidentialite/",
]


def lastmod(chemin):
    f = os.path.join(chemin, "index.html")
    try:
        d = subprocess.run(["git", "log", "-1", "--format=%cs", "--", f],
                           capture_output=True, text=True, check=True).stdout.strip()
        if d:
            return d
    except Exception:
        pass
    return datetime.date.today().isoformat()


print('<?xml version="1.0" encoding="UTF-8"?>')
print('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
for p in PAGES:
    print(f"  <url><loc>{DOMAINE}/{p}</loc><lastmod>{lastmod(p)}</lastmod></url>")
print("</urlset>")
