# Redirections des anciennes URL (site WordPress.com → site statique)

Généré par `scripts/redirections.py` (source de vérité : la table `REDIRECTIONS` du script).
GitHub Pages ne sait pas rediriger côté serveur : chaque ancienne URL reçoit une page `index.html`
avec `meta refresh` immédiat, `canonical` vers la nouvelle page, `noindex` et un lien visible.

Sources de l'inventaire (28/11/2026) : 13 pages et 14 articles publiés (API WordPress.com),
plus les URL vues dans la Search Console d'août 2025 à novembre 2026 (pièces jointes, étiquettes).
Les URL déjà identiques dans le nouveau site n'ont pas de redirection : `/` et `/le-club/`.

| Ancienne URL | Nouvelle page | Search Console (08/2025-11/2026) |
|---|---|---|
| /nous-contacter/ | /contact/ | 15 impr. |
| /inscriptions-essai/ | /inscription/ | 7 impr. |
| /inscriptions-essai/tarifs/ | /inscription/ | 14 impr. |
| /les-seances-2/ | /eveil-aquatique/ | 1 clic, 27 impr. |
| /les-seances-2/conseils-pratiques/ | /conseils/ | 2 impr. |
| /les-seances-2/les-chansons/ | /chansons/ | 1 clic, 15 impr. |
| /les-seances-2/planning-des-permanences/ | /planning/ | 1 clic, 6 impr. |
| /le-club/albums-photos/ | /le-club/ | 4 impr. |
| /le-club/donner-un-coup-de-main/ | /rejoindre-l-equipe/ | 1 impr. |
| /le-club/le-bureau/ | /le-club/ | 2 impr. |
| /le-club/les-animateurs/ | /le-club/ | 1 clic, 12 impr. |
| /a-propos/ | / |  |
| /a-propos/affiche-bebes-nageurs/ | / | 1 clic, 3 impr. |
| /a-propos/logo-bbny/ | / | 1 impr. |
| /2014/12/18/photos-des-bebes-nageurs/ | /le-club/ |  |
| /2014/10/17/video-des-bebes-nageurs/ | /eveil-aquatique/ |  |
| /2014/09/24/reglement-interieur/ | /le-club/documents/ | 1 clic, 4 impr. |
| /2014/09/22/les-statuts/ | /le-club/documents/ | 1 impr. |
| /2014/09/22/pirouette-galipette/ | /chansons/ |  |
| /2014/09/23/a-la-ronde/ | /chansons/ |  |
| /2014/09/23/les-petits-poissons/ | /chansons/ |  |
| /2014/09/23/la-baleine/ | /chansons/ |  |
| /2014/09/23/les-petites-mains/ | /chansons/ |  |
| /2014/09/23/le-beau-bateau/ | /chansons/ |  |
| /2014/09/23/larche-de-noe/ | /chansons/ |  |
| /2014/09/23/les-poissons/ | /chansons/ |  |
| /2014/09/23/la-danse-dhelene/ | /chansons/ |  |
| /2014/09/23/le-petit-crabe/ | /chansons/ |  |
| /2014/ | / |  |
| /2014/09/ | / |  |
| /2014/10/ | / |  |
| /2014/12/ | / |  |
| /2014/09/22/ | / |  |
| /2014/09/23/ | / |  |
| /2014/09/24/ | / |  |
| /tag/comptines/ | /chansons/ | 1 impr. |
| /tag/natation-la-roche-sur-yon/ | / | 1 impr. |

Non redirigés (sans objet sur un site statique) : `/feed/`, `/comments/feed/`, `/?p=…`, `/author/…`.
Ils tomberont sur la page 404 du site, qui renvoie vers l'accueil.
