#!/usr/bin/env python3
"""Génère les pages de redirection des anciennes URL du site WordPress.com.

GitHub Pages ne fait pas de redirection côté serveur : chaque ancienne URL reçoit
un petit index.html avec meta refresh, canonical vers la nouvelle page, noindex
et un lien visible. Relancer après toute modification de la table REDIRECTIONS.
Usage : python3 scripts/redirections.py  (depuis la racine du site)
"""
import html
import os
import sys

DOMAINE = "https://bebesnageursyonnais.com"

# ancienne URL (chemin) -> nouvelle page (chemin, "" = accueil)
REDIRECTIONS = {
    # Pages
    "nous-contacter/": "contact/",
    "inscriptions-essai/": "inscription/",
    "inscriptions-essai/tarifs/": "inscription/",
    "les-seances-2/": "eveil-aquatique/",
    "les-seances-2/conseils-pratiques/": "conseils/",
    "les-seances-2/les-chansons/": "chansons/",
    "les-seances-2/planning-des-permanences/": "planning/",
    "le-club/albums-photos/": "le-club/",
    "le-club/donner-un-coup-de-main/": "rejoindre-l-equipe/",
    "le-club/le-bureau/": "le-club/",
    "le-club/les-animateurs/": "le-club/",
    "a-propos/": "",
    # Pièces jointes vues dans la Search Console
    "a-propos/affiche-bebes-nageurs/": "",
    "a-propos/logo-bbny/": "",
    # Articles 2014
    "2014/12/18/photos-des-bebes-nageurs/": "le-club/",
    "2014/10/17/video-des-bebes-nageurs/": "eveil-aquatique/",
    "2014/09/24/reglement-interieur/": "le-club/documents/",
    "2014/09/22/les-statuts/": "le-club/documents/",
    "2014/09/22/pirouette-galipette/": "chansons/",
    "2014/09/23/a-la-ronde/": "chansons/",
    "2014/09/23/les-petits-poissons/": "chansons/",
    "2014/09/23/la-baleine/": "chansons/",
    "2014/09/23/les-petites-mains/": "chansons/",
    "2014/09/23/le-beau-bateau/": "chansons/",
    "2014/09/23/larche-de-noe/": "chansons/",
    "2014/09/23/les-poissons/": "chansons/",
    "2014/09/23/la-danse-dhelene/": "chansons/",
    "2014/09/23/le-petit-crabe/": "chansons/",
    # Archives et étiquettes WordPress
    "2014/": "",
    "2014/09/": "",
    "2014/10/": "",
    "2014/12/": "",
    "2014/09/22/": "",
    "2014/09/23/": "",
    "2014/09/24/": "",
    "tag/comptines/": "chansons/",
    "tag/natation-la-roche-sur-yon/": "",
}

GABARIT = """<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="robots" content="noindex">
<title>Page déplacée | Les Bébés Nageurs Yonnais</title>
<link rel="canonical" href="{canon}">
<meta http-equiv="refresh" content="0; url={rel}">
</head>
<body>
<p>Cette page a déménagé : <a href="{rel}">{libelle}</a>.</p>
</body>
</html>
"""


def main(racine="."):
    for ancien, nouveau in REDIRECTIONS.items():
        if os.path.exists(os.path.join(racine, ancien, "index.html")) and ancien.rstrip("/") + "/" in {
            "le-club/"}:
            continue  # page qui existe déjà dans le nouveau site
        profondeur = ancien.strip("/").count("/") + 1
        rel = "../" * profondeur + nouveau
        dossier = os.path.join(racine, ancien)
        os.makedirs(dossier, exist_ok=True)
        with open(os.path.join(dossier, "index.html"), "w", encoding="utf-8") as f:
            f.write(GABARIT.format(canon=html.escape(f"{DOMAINE}/{nouveau}"),
                                   rel=html.escape(rel),
                                   libelle=html.escape(f"{DOMAINE}/{nouveau}")))
    print(f"{len(REDIRECTIONS)} redirections générées")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else ".")
