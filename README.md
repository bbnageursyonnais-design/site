# Bébés Nageurs Yonnais — préprod statique

Version de travail du nouveau site, à relire par le CA. Non indexée (`noindex` + `robots.txt`).

## Publier sur GitHub Pages
1. Créer un dépôt dans le compte GitHub du club (par exemple `site-preprod`).
2. Déposer le contenu de ce dossier à la racine du dépôt (avec `.nojekyll`).
3. Settings › Pages › Source : « Deploy from a branch », branche `main`, dossier `/ (root)`.
4. Le site est alors visible à `https://<compte>.github.io/site-preprod/`.

Aucun fichier CNAME : le domaine bebesnageursyonnais.com reste sur le site actuel.

## Mettre à jour
- Réglages de saison et planning : en haut de `assets/js/site.js` (`CONFIG`, `PLANNING`).
- Tester le bandeau : `?apercu=inscriptions` ou `?apercu=saison`, et `?date=2027-04-15` pour simuler une date.

## Reste à faire
- Formulaires en ligne (contact, liste d'attente, coup de main, animateur) : aujourd'hui des liens email.
- Images : les cadres en pointillés indiquent le contenu attendu (aucune photo d'enfant).
- Statuts, règlement et feuille de séance d'essai en PDF.
