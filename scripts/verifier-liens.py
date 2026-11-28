#!/usr/bin/env python3
"""Contrôle des liens internes du site statique (href, src, meta refresh).

Signale tout lien relatif dont la cible n'existe pas. Code de sortie 1 si erreur.
Usage : python3 scripts/verifier-liens.py [racine]
"""
import os
import re
import sys
from urllib.parse import urldefrag, unquote

racine = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else ".")
motif = re.compile(r'(?:href|src)="([^"]+)"|content="0; url=([^"]+)"')
erreurs, total = [], 0
for dossier, _, fichiers in os.walk(racine):
    if "/.git" in dossier or "/node_modules" in dossier:
        continue
    for nom in fichiers:
        if not nom.endswith(".html"):
            continue
        chemin = os.path.join(dossier, nom)
        src = open(chemin, encoding="utf-8").read()
        if nom == "404.html":
            continue  # la 404 utilise une balise base calculée en JS
        for m in motif.finditer(src):
            lien = urldefrag(m.group(1) or m.group(2))[0]
            if not lien or re.match(r"^(https?:|mailto:|tel:|data:|#|javascript:)", lien):
                continue
            total += 1
            cible = os.path.normpath(os.path.join(dossier, unquote(lien)))
            if lien.endswith("/") or os.path.isdir(cible):
                cible = os.path.join(cible, "index.html")
            if not cible.startswith(racine) or not os.path.exists(cible):
                erreurs.append(f"{os.path.relpath(chemin, racine)} -> {lien}")
print(f"{total} liens internes contrôlés, {len(erreurs)} cassé(s)")
for e in erreurs:
    print("  " + e)
sys.exit(1 if erreurs else 0)
