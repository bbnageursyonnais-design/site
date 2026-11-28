#!/usr/bin/env bash
# Bascule de la préprod (bbnageursyonnais-design.github.io/site/) vers bebesnageursyonnais.com.
# À LANCER LE JOUR J SEULEMENT, depuis la racine du dépôt, après accord de Frérot.
# Ne touche pas aux DNS : voir docs/bascule.md.
set -euo pipefail
cd "$(dirname "$0")/.."

# 1. Domaine personnalisé : fichier CNAME à la racine (lu par GitHub Pages).
cp docs/CNAME.a-activer CNAME

# 2. Indexation : retirer le noindex des vraies pages (les redirections et la 404 le gardent).
for p in "" eveil-aquatique/ notre-pedagogie/ planning/ conseils/ chansons/ inscription/ \
         questions-frequentes/ le-club/ le-club/documents/ rejoindre-l-equipe/ contact/ \
         mentions-legales/ confidentialite/; do
  sed -i 's|<meta name="robots" content="noindex, nofollow">||' "${p}index.html"
done

# 3. Bandeau « Version de travail » de la préprod : à retirer.
grep -rl 'Version de travail' --include=index.html . | while read -r f; do
  python3 - "$f" <<'PY'
import re, sys
f = sys.argv[1]
s = open(f, encoding="utf-8").read()
s = re.sub(r'<div class="preprod".*?</div>\s*', '', s, flags=re.S)
open(f, "w", encoding="utf-8").write(s)
PY
done

# 4. robots.txt et sitemap du domaine final.
cp docs/robots.final.txt robots.txt
python3 scripts/sitemap.py > sitemap.xml

# 5. Contrôles.
python3 scripts/verifier-liens.py .
if grep -rq 'Version de travail' --include=index.html .; then
  echo "ATTENTION : le bandeau « Version de travail » est encore présent, à retirer à la main." >&2
fi
echo "Bascule préparée. Relire 'git diff', puis commit et push sur main."
