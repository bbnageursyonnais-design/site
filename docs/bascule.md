# Bascule du site vers bebesnageursyonnais.com (jour J, mi-janvier 2027)

Le site définitif est la préprod statique hébergée sur GitHub Pages
(dépôt `bbnageursyonnais-design/site`, aujourd'hui sur `https://bbnageursyonnais-design.github.io/site/`).
Ce document décrit la bascule pas à pas. **C** = Claude, **F** = Frérot.

## État relevé le 28/11/2026 (lecture seule)

- **Domaine** `bebesnageursyonnais.com` : enregistré chez WordPress.com (Automattic) depuis le 08/10/2014,
  payé jusqu'au **07/10/2027**, renouvellement automatique actif, statut actif.
  ⚠️ Le domaine appartient à **un autre compte WordPress.com** que celui connecté à Claude
  (`current_user_is_owner: false`) : le renouvellement et la facturation dépendent de ce compte.
- **Serveurs de noms** : `ns1.wordpress.com`, `ns2.wordpress.com` → les DNS se gèrent dans WordPress.com
  (Claude peut les modifier via le connecteur).
- **Enregistrements DNS actuels** :
  - A et NS gérés par WordPress.com (protégés) ;
  - `*` CNAME → `bebesnageursyonnais.com` (joker) ;
  - TXT `google-site-verification=…` (Search Console) ;
  - TXT `brevo-code:…`, CNAME `brevo1._domainkey` et `brevo2._domainkey`, TXT `_dmarc` (Brevo, déjà posés) ;
  - **aucun MX** : pas d'adresse email sur le domaine (le club utilise bbnageursyonnais@gmail.com).
- **Transferts d'email** : non lisibles avec le compte connecté (droits du propriétaire du domaine).
- **Préprod** : toutes les pages sont en `noindex, nofollow` et `robots.txt` est en `Disallow: /`.

## Ce qui est déjà prêt dans le dépôt

| Élément | Fichier | État |
|---|---|---|
| Redirections des 37 anciennes URL | `scripts/redirections.py`, `docs/redirections.md` | générées |
| Canonical, Open Graph, image de partage, JSON-LD `SportsClub` | `scripts/balises_partage.py`, `assets/img/partage-bny.png` | en place (sans effet tant que noindex) |
| Fichier CNAME | `docs/CNAME.a-activer` | **inactif** (le copier à la racine casserait l'adresse github.io) |
| robots.txt final | `docs/robots.final.txt` | prêt |
| sitemap.xml | `scripts/sitemap.py` | à générer le jour J |
| Script de bascule | `scripts/bascule-domaine.sh` | prêt, **à ne lancer que le jour J** |
| Contrôle des liens | `scripts/verifier-liens.py` | 0 lien cassé au 28/11 |

Les liens internes sont tous **relatifs** et il n'y a pas de balise `<base>` (sauf la 404, qui la calcule
selon l'hôte). Le passage de `/site/` à la racine du domaine ne demande donc **aucune réécriture de chemins**.

## Avant le jour J (dès maintenant, sans risque)

1. **F** — Vérifier le domaine dans GitHub (recommandé contre le détournement) :
   GitHub › organisation `bbnageursyonnais-design` › Settings › Pages › *Add a domain* › `bebesnageursyonnais.com`.
   GitHub donne un enregistrement TXT `_github-pages-challenge-…` : **C** l'ajoute dans les DNS WordPress.com,
   **F** clique sur *Verify*. Sans effet sur le site actuel.
2. **F** — Identifier le compte WordPress.com propriétaire du domaine et vérifier son moyen de paiement
   (échéance 07/10/2027). Décider si le domaine reste chez WordPress.com (le plus simple) ou est transféré.
3. **C** — Relire `docs/redirections.md` avec Frérot si des pages ont changé d'ici là, relancer
   `python3 scripts/redirections.py`.

## Jour J

| # | Qui | Action |
|---|---|---|
| 1 | C | `bash scripts/bascule-domaine.sh` : copie `CNAME`, retire le noindex des 14 vraies pages, retire le bandeau « Version de travail », installe `robots.txt` final, génère `sitemap.xml`, contrôle les liens. Relecture du diff, commit, push sur `main`. |
| 2 | C | DNS WordPress.com : **supprimer** le CNAME joker `*` (GitHub déconseille les jokers : risque de détournement). |
| 3 | C | DNS : ajouter 4 enregistrements **A** sur le domaine nu : `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`. |
| 4 | C | DNS : ajouter 4 enregistrements **AAAA** : `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`. |
| 5 | C | DNS : `www` CNAME → `bbnageursyonnais-design.github.io` (sans le nom du dépôt). |
| 6 | F/C | Le A géré par WordPress.com (protégé) doit disparaître : passer par *Domaines › bebesnageursyonnais.com › DNS* et/ou retirer le domaine comme adresse principale du site WordPress.com (remettre `bebesnageursyonnais.wordpress.com` en principal). À faire par le compte propriétaire si le connecteur refuse. |
| 7 | — | **Conserver** : TXT `google-site-verification`, TXT `brevo-code`, CNAME `brevo1/2._domainkey`, TXT `_dmarc` (et le TXT `_github-pages-challenge` s'il existe). |
| 8 | F | GitHub › dépôt `site` › Settings › Pages : *Custom domain* = `bebesnageursyonnais.com` (déjà rempli par le fichier CNAME), attendre la vérification DNS, puis cocher **Enforce HTTPS** (le certificat peut prendre jusqu'à 24 h). |
| 9 | C | Vérifier : `https://bebesnageursyonnais.com/`, `https://www.bebesnageursyonnais.com/` (redirige vers le domaine nu), 5 anciennes URL de `docs/redirections.md`, le bandeau relié à l'app (`/api/phase` autorise déjà ce domaine). |
| 10 | F | Search Console (propriété `bebesnageursyonnais.com`, déjà vérifiée par TXT) : envoyer `https://bebesnageursyonnais.com/sitemap.xml`, inspecter l'accueil et demander l'indexation. Pas de « changement d'adresse » : le domaine ne change pas. |
| 11 | F | Fiche Google (Business Profile) : site web = `https://bebesnageursyonnais.com/`. |
| 12 | C | Prévenir l'app : rien à changer (CORS déjà ouvert à `bebesnageursyonnais.com` et `www`). |

## Après le jour J : surveillance (2 semaines)

- **C**, deux fois par semaine : Search Console › Pages (erreurs 404, « page avec redirection »), et
  `scripts/verifier-liens.py`. Toute ancienne URL en 404 → ajout dans `scripts/redirections.py`.
- **C** : vérifier que le site WordPress.com reste accessible sur `bebesnageursyonnais.wordpress.com`
  (archive), en mode privé si Frérot le souhaite.

## Retour arrière (si le site ne s'affiche pas après 24 h)

1. **C** : supprimer les A, AAAA et le CNAME `www` ajoutés ; remettre le domaine en adresse principale du site
   WordPress.com (le A protégé revient tout seul).
2. **C** : supprimer `CNAME` à la racine du dépôt (le site redevient `…github.io/site/`), remettre le noindex
   (`git revert` du commit de bascule).
3. Les TXT et enregistrements Brevo n'ont pas bougé : rien à refaire côté email.

## Points d'attention

- **Propriétaire du domaine** : compte WordPress.com différent de celui connecté ; l'étape 6 peut demander
  ce compte. À identifier avant mi-janvier.
- **Forfait WordPress.com** : une fois le site déplacé, le forfait du site (s'il est payant) n'est plus utile,
  mais **ne pas résilier l'enregistrement du domaine**. Vérifier dans *Achats* que le domaine est un abonnement
  séparé avant toute résiliation.
- **Email** : aucune adresse sur le domaine (pas de MX). Les enregistrements Brevo (DKIM, DMARC, brevo-code)
  sont déjà posés et ne dépendent pas de l'hébergement du site.
- **Formulaire de contact** : le site statique n'a pas de formulaire serveur (lien `mailto:` aujourd'hui) ;
  un service externe gratuit reste à choisir si on veut un formulaire.
