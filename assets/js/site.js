/* Bébés Nageurs Yonnais — préprod statique. Rien n'est enregistré. Appels extérieurs : la phase des
   inscriptions lue sur l'Espace BNY (aucune donnée personnelle, voir PHASE_URL) et l'envoi du formulaire de
   contact (CONTACT_URL), transmis au club par email, sans stockage. */
(function () {
  "use strict";

  /* ---------- Réglages de saison (à mettre à jour chaque année) ---------- */
  var CONFIG = {
    saisonEnCours: { debut: 2026, complet: true },
    saisonSuivante: { debut: 2027, ouverte: false }, // passer à true quand HelloAsso est ouvert
    email: "bbnageursyonnais@gmail.com",
    helloasso: "https://www.helloasso.com/associations/club-des-bebes-nageurs-yonnais/adhesions/adhesion-{s}-creneau-{c}"
  };
  var PHASE_URL = "https://espace-bny.netlify.app/api/phase";
  var SLUGS = { A: "a-4-mois-18-mois", B: "b-18-mois-3ans", C: "c-3-ans-6ans" };
  var CRENEAUX = {
    A: { ages: "4 à 18 mois", heure: "8h00 – 8h30", acces: "7h45" },
    B: { ages: "18 mois à 3 ans", heure: "8h30 – 9h15", acces: "8h15" },
    C: { ages: "3 à 6 ans", heure: "9h15 – 10h00", acces: "9h00" }
  };

  /* Planning 2026-2027 : séances (s), parcours (p), photo et goûter (g), AG (ag), rattrapage (r) */
  var PLANNING = [
    ["2026-09-12", "ag", "Réunion de rentrée et assemblée générale"],
    ["2026-09-19", "s"], ["2026-09-26", "s"], ["2026-10-03", "s"],
    ["2026-10-10", "p", "Séance parcours"], ["2026-10-17", "g", "Séance photo et goûter"],
    ["2026-11-07", "s"], ["2026-11-14", "s"], ["2026-11-21", "s"], ["2026-11-28", "s"],
    ["2026-12-05", "p", "Séance parcours"], ["2026-12-12", "g", "Séance photo et goûter de Noël"],
    ["2027-01-09", "s"], ["2027-01-16", "s"], ["2027-01-23", "s"], ["2027-01-30", "s"],
    ["2027-02-06", "p", "Séance parcours"], ["2027-02-13", "g", "Séance photo et goûter"],
    ["2027-03-06", "s"], ["2027-03-13", "s"], ["2027-03-20", "s"], ["2027-03-27", "s"],
    ["2027-04-03", "p", "Séance parcours"], ["2027-04-10", "g", "Séance photo et goûter"],
    ["2027-05-01", "s"], ["2027-05-08", "s"], ["2027-05-22", "s"], ["2027-05-29", "s"],
    ["2027-06-05", "p", "Séance parcours"], ["2027-06-12", "g", "Séance photo et goûter"],
    ["2027-06-19", "s"], ["2027-06-26", "r", "Séance de rattrapage"], ["2027-07-03", "r", "Rattrapage éventuel"]
  ];

  var MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
  function parseISO(s) { var p = s.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function jour(d) { return d.getDate() === 1 ? "1er" : String(d.getDate()); }
  function dateLongue(d) { return "samedi " + jour(d) + " " + MOIS[d.getMonth()]; }
  function dateCourte(d) { return jour(d) + " " + MOIS[d.getMonth()]; }
  function saisonTxt(y) { return y + "-" + (y + 1); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function mailto(sujet, corps) {
    return "mailto:" + CONFIG.email + "?subject=" + encodeURIComponent(sujet) + (corps ? "&body=" + encodeURIComponent(corps) : "");
  }
  function aujourdhui() {
    var q = new URLSearchParams(location.search).get("date"); // ?date=2027-04-15 pour tester
    if (q && /^\d{4}-\d{2}-\d{2}$/.test(q)) return parseISO(q);
    var n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate());
  }

  /* ---------- Menu hamburger ---------- */
  var burger = document.querySelector(".burger");
  var nav = document.getElementById("menu");
  if (burger && nav) {
    var fermer = function (focus) {
      burger.setAttribute("aria-expanded", "false"); nav.classList.remove("ouvert");
      burger.querySelector(".libelle").textContent = "Menu";
      if (focus) burger.focus();
    };
    burger.addEventListener("click", function () {
      var ouvert = burger.getAttribute("aria-expanded") === "true";
      if (ouvert) { fermer(false); return; }
      burger.setAttribute("aria-expanded", "true"); nav.classList.add("ouvert");
      burger.querySelector(".libelle").textContent = "Fermer";
      var premier = nav.querySelector("a"); if (premier) premier.focus();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && burger.getAttribute("aria-expanded") === "true") fermer(true);
    });
    window.matchMedia("(min-width: 761px)").addEventListener("change", function (m) { if (m.matches) fermer(false); });
  }

  /* ---------- Calculateur de créneau ---------- */
  function mois(naissance, ref) {
    var m = (ref.getFullYear() - naissance.getFullYear()) * 12 + (ref.getMonth() - naissance.getMonth());
    if (ref.getDate() < naissance.getDate()) m -= 1;
    return m;
  }
  function creneauPour(m) {
    if (m < 4) return { code: null, motif: "trop jeune" };
    if (m < 18) return { code: "A" };
    if (m < 36) return { code: "B" };
    if (m < 84) return { code: "C" };
    return { code: null, motif: "plus de 6 ans" };
  }
  function prix(n) { return n <= 0 ? 0 : (n === 1 ? 130 : 130 + 90 + 60 * (n - 2)); }

  function initCalc(box) {
    var select = box.querySelector("select");
    var liste = box.querySelector(".enfants");
    var ajout = box.querySelector(".ajout");
    var sortie = box.querySelector(".resultat");
    var idx = 0;

    var cur = CONFIG.saisonEnCours.debut, next = CONFIG.saisonSuivante.debut;
    select.innerHTML =
      '<option value="' + next + '">' + saisonTxt(next) + " · âge au 1er sept. " + next + "</option>" +
      '<option value="' + cur + '">' + saisonTxt(cur) + " · âge au 1er sept. " + cur + "</option>";
    var mode = document.documentElement.getAttribute("data-mode");
    select.value = String(box.getAttribute("data-saison") === "courante" && mode !== "inscriptions" ? cur : next);

    function ligne() {
      idx += 1;
      var id = box.id + "-n" + idx;
      var div = document.createElement("div");
      div.className = "ligne";
      div.innerHTML = '<label class="sr-only" for="' + id + '">Date de naissance de l\'enfant ' + idx + "</label>" +
        '<input type="date" id="' + id + '" min="2018-01-01" max="2030-12-31">' +
        '<button type="button" class="suppr" aria-label="Retirer cet enfant">×</button>';
      div.querySelector("input").addEventListener("input", calcul);
      div.querySelector(".suppr").addEventListener("click", function () {
        if (liste.children.length > 1) { div.remove(); calcul(); liste.querySelector("input").focus(); }
        else { div.querySelector("input").value = ""; calcul(); }
      });
      liste.appendChild(div);
      return div;
    }

    function calcul() {
      var saison = +select.value;
      var ref = new Date(saison, 8, 1);
      var enfants = [];
      liste.querySelectorAll("input").forEach(function (i) { if (i.value) enfants.push(parseISO(i.value)); });
      if (!enfants.length) { sortie.innerHTML = '<p class="vide">Le résultat s\'affiche ici.</p>'; return; }

      var res = enfants.map(function (d) { var m = mois(d, ref); return { m: m, c: creneauPour(m) }; });
      var valides = res.filter(function (r) { return r.c.code; });
      var ordre = { A: 1, B: 2, C: 3 };
      var famille = valides.reduce(function (acc, r) { return !acc || ordre[r.c.code] > ordre[acc] ? r.c.code : acc; }, null);

      var html = "";
      res.forEach(function (r, i) {
        var age = r.m < 0 ? "pas encore né" : (r.m < 24 ? r.m + " mois" : Math.floor(r.m / 12) + " ans et " + (r.m % 12) + " mois");
        html += '<div class="enfant"><strong>Enfant ' + (i + 1) + "</strong> : " + esc(age) + " au 1er septembre " + saison + " → ";
        if (r.c.code) html += "créneau " + r.c.code + " (" + CRENEAUX[r.c.code].ages + ")";
        else html += '<span class="badge hors">' + (r.c.motif === "trop jeune" ? "trop jeune pour cette saison (4 mois minimum)" : "au-delà de 6 ans : dérogation possible, écrivez-nous") + "</span>";
        html += "</div>";
      });

      if (famille) {
        var c = CRENEAUX[famille];
        html += '<h3 style="margin:14px 0 4px">Créneau ' + famille + " : samedi " + c.heure + "</h3>";
        if (valides.length > 1) html += '<p class="aide" style="margin-top:0">Fratrie : toute la famille va dans le créneau du plus âgé.</p>';
        html += "<p style=\"margin:0\">Accès au bassin à partir de " + c.acces + ", piscine CAP.</p>";
        html += '<p class="total">Cotisation : ' + prix(valides.length) + " € pour " + valides.length + " enfant" + (valides.length > 1 ? "s" : "") + " (30 séances)</p>";

        var corps = "Bonjour,\n\nJe souhaite m'inscrire sur la liste d'attente pour la saison " + saisonTxt(saison) + ".\nCréneau : " + famille +
          "\nPrénom du parent : \nDate(s) de naissance : " + enfants.map(function (d) { return d.toLocaleDateString("fr-FR"); }).join(", ") + "\n\nMerci !";
        if (saison === cur && CONFIG.saisonEnCours.complet) {
          html += '<p><span class="badge complet">Complet pour ' + saisonTxt(cur) + "</span></p>" +
            '<div class="actions"><a class="btn" href="' + mailto("Liste d'attente " + saisonTxt(saison) + " — créneau " + famille, corps) + '">M\'inscrire sur la liste d\'attente</a></div>';
        } else if (saison === next && !CONFIG.saisonSuivante.ouverte) {
          html += '<p><span class="badge bientot">Inscriptions ' + saisonTxt(next) + " en avril</span> Les familles déjà adhérentes sont prioritaires.</p>" +
            '<div class="actions"><a class="btn" href="' + mailto("Prévenez-moi : inscriptions " + saisonTxt(saison) + " — créneau " + famille, corps.replace("m'inscrire sur la liste d'attente", "être prévenu(e) de l'ouverture des inscriptions")) + '">Être prévenu de l\'ouverture</a></div>';
        } else {
          var url = CONFIG.helloasso.replace("{s}", saisonTxt(saison)).replace("{c}", SLUGS[famille]);
          html += '<p><span class="badge ok">Inscriptions ouvertes</span></p><div class="actions"><a class="btn" href="' + url + '" rel="noopener">M\'inscrire sur HelloAsso</a></div>';
        }
      }
      sortie.innerHTML = html;
    }

    ligne();
    ajout.addEventListener("click", function () { ligne().querySelector("input").focus(); calcul(); });
    select.addEventListener("change", calcul);
    calcul();
  }
  document.querySelectorAll(".calc").forEach(initCalc);

  /* ---------- Bandeau saisonnier de l'accueil ---------- */
  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var today = aujourdhui();
    var q = new URLSearchParams(location.search).get("apercu");
    var m = today.getMonth() + 1;
    var auto = (m >= 4 && m <= 9) ? "inscriptions" : "saison";
    var mode = (q === "inscriptions" || q === "saison") ? q : auto;

    // Prochaine séance et événements à venir
    var prochaine = null, aVenir = [];
    PLANNING.forEach(function (p) {
      var d = parseISO(p[0]);
      if (d < today) return;
      if (!prochaine && p[1] !== "ag" && p[1] !== "r") prochaine = { d: d, t: p[1], l: p[2] };
      if (p[1] === "p" || p[1] === "g" || p[1] === "r") aVenir.push({ d: d, l: p[2] });
    });
    var elDate = document.getElementById("prochaine-date");
    var elInfo = document.getElementById("prochaine-info");
    var elEvt = document.getElementById("a-venir");
    if (prochaine) {
      elDate.textContent = "Prochaine séance : " + dateLongue(prochaine.d);
      elInfo.textContent = prochaine.l ? prochaine.l + ". " : "";
      var evts = aVenir.filter(function (e) { return e.d > prochaine.d; }).slice(0, 2);
      if (evts.length) {
        elEvt.innerHTML = "À venir : " + evts.map(function (e) { return "<strong>" + dateCourte(e.d) + "</strong> : " + esc(e.l.replace(/^Séance /, "").replace(/^./, function (c) { return c.toLowerCase(); })); }).join(" · ") + ".";
      }
    } else {
      elDate.textContent = "La saison " + saisonTxt(CONFIG.saisonEnCours.debut) + " est terminée";
      elInfo.textContent = "Merci à toutes les familles ! ";
    }
    document.querySelectorAll("[data-saison-suivante]").forEach(function (e) { e.textContent = saisonTxt(CONFIG.saisonSuivante.debut); });

    function appliquer(md) {
      document.documentElement.setAttribute("data-mode", md);
      document.querySelectorAll("[data-si]").forEach(function (e) { e.hidden = e.getAttribute("data-si") !== md; });
      document.querySelectorAll(".apercu button").forEach(function (b) { b.setAttribute("aria-pressed", String(b.value === md)); });
      var c = document.querySelector("[data-hero] .calc select");
      if (c) { c.value = String(md === "inscriptions" ? CONFIG.saisonSuivante.debut : CONFIG.saisonEnCours.debut); c.dispatchEvent(new Event("change")); }
    }
    document.querySelectorAll(".apercu button").forEach(function (b) {
      b.addEventListener("click", function () {
        appliquer(b.value);
        var u = new URL(location.href); u.searchParams.set("apercu", b.value); history.replaceState(null, "", u);
      });
    });
    appliquer(mode);

    /* Phase des inscriptions réglée par le bureau dans l'Espace BNY.
       Si l'app ne répond pas (ou en aperçu ?apercu=…), le bandeau garde son comportement par dates. */
    function appliquerPhase(etat) {
      // « Prioritaires » est respecté tel quel ; sinon, créneaux tous pleins = saison complète.
      var phase = etat.phase === "prioritaires" ? "prioritaires" : (etat.complet ? "complet" : etat.phase);
      var note = document.getElementById("bandeau-phase");
      if (!note) {
        note = document.createElement("p");
        note.id = "bandeau-phase";
        note.className = "bandeau-phase";
        note.setAttribute("role", "status");
        hero.querySelector(".wrap > div").insertBefore(note, hero.querySelector(".apercu").nextSibling);
      }
      note.hidden = false;
      if (phase === "prioritaires") {
        CONFIG.saisonSuivante.ouverte = true;
        appliquer("inscriptions");
        note.textContent = "Inscriptions ouvertes aux familles déjà adhérentes.";
      } else if (phase === "ouvertes") {
        CONFIG.saisonSuivante.ouverte = true;
        appliquer("inscriptions");
        note.innerHTML = 'Inscriptions ouvertes. <a href="inscription/index.html">Voir mon créneau et m\u2019inscrire</a>';
      } else if (phase === "complet") {
        CONFIG.saisonSuivante.ouverte = false;
        appliquer("saison");
        note.innerHTML = 'Saison complète : liste d\u2019attente par email. <a href="' + mailto("Liste d'attente", "Bonjour,\n\nJe souhaite m'inscrire sur la liste d'attente.\nDate de naissance de mon enfant : \n") + '">Écrire au club</a>';
      } else {
        CONFIG.saisonSuivante.ouverte = false;
        appliquer("saison");
        note.hidden = true;
      }
    }
    if (!q && window.fetch) {
      var ctrl = window.AbortController ? new AbortController() : null;
      var minuteur = setTimeout(function () { if (ctrl) ctrl.abort(); }, 4000);
      fetch(PHASE_URL, { credentials: "omit", signal: ctrl ? ctrl.signal : undefined })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (etat) {
          clearTimeout(minuteur);
          if (etat && typeof etat.phase === "string") appliquerPhase(etat);
        })
        .catch(function () { /* app indisponible : comportement par dates */ });
    }
  }

  /* ---------- Planning : marquer les dates passées ---------- */
  var t = aujourdhui();
  document.querySelectorAll("tr[data-date]").forEach(function (tr) {
    if (parseISO(tr.getAttribute("data-date")) < t) tr.classList.add("passe");
  });
  /* ---------- Décor sous-marin : poissons en parallaxe et hameçon ---------- */
  (function () {
    var root = document.documentElement;
    var reduit = window.matchMedia("(prefers-reduced-motion: reduce)");
    var h = document.createElement("div");
    h.className = "hamecon";
    h.setAttribute("aria-hidden", "true");
    h.innerHTML = '<span class="fil"></span><svg viewBox="0 0 44 90" focusable="false">' +
      '<circle cx="22" cy="5" r="3.2" fill="none" stroke="#5d777c" stroke-width="2"/>' +
      '<path d="M22 8V60C22 78 5 78 5 62L10 66" fill="none" stroke="#6b8489" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<g class="ver"><path d="M22 16C35 19 35 29 22 31S9 42 22 46S36 55 29 66" fill="none" stroke="#e48a78" stroke-width="7" stroke-linecap="round"/>' +
      '<path d="M25 18.5l-1.5 4M30 25l-3 1.5M20 35l3 2M17 42l4-.5M27 52l-3 2M30 59l-3.5-.5" stroke="#c96a5a" stroke-width="1.4" stroke-linecap="round"/></g></svg>';
    document.body.appendChild(h);

    var prevu = false;
    function maj() {
      prevu = false;
      var y = window.pageYOffset || 0;
      var max = Math.max(1, root.scrollHeight - window.innerHeight);
      var p = Math.min(1, Math.max(0, y / max));
      root.style.setProperty("--o1", (-(y * 0.12) % 480).toFixed(1) + "px");
      root.style.setProperty("--o2", (-(y * 0.3) % 640).toFixed(1) + "px");
      root.style.setProperty("--fil", Math.round(150 + p * window.innerHeight * 0.42) + "px");
    }
    function demande() { if (!prevu) { prevu = true; window.requestAnimationFrame(maj); } }
    function brancher() {
      window.removeEventListener("scroll", demande);
      window.removeEventListener("resize", demande);
      if (reduit.matches) {
        root.style.setProperty("--o1", "0px"); root.style.setProperty("--o2", "0px"); root.style.setProperty("--fil", "35vh");
      } else {
        window.addEventListener("scroll", demande, { passive: true });
        window.addEventListener("resize", demande, { passive: true });
        maj();
      }
    }
    if (reduit.addEventListener) reduit.addEventListener("change", brancher);
    brancher();
  })();

  /* ---------- Formulaire de contact (envoi par l'Espace BNY, sans stockage) ---------- */
  (function () {
    var CONTACT_URL = "https://espace-bny.netlify.app/api/contact";
    var form = document.getElementById("contact-form");
    if (!form || !window.fetch) return;
    var secours = document.getElementById("contact-secours");
    var statut = document.getElementById("contact-statut");
    var bouton = form.querySelector("button[type=submit]");
    var jeton = null;
    var SECOURS = "Écrivez-nous à " + CONFIG.email + ".";

    function montrerSecours() { form.hidden = true; if (secours) secours.hidden = false; }
    function dire(texte, ok) { statut.textContent = texte; statut.className = "contact-statut " + (ok ? "ok" : "ko"); }

    fetch(CONTACT_URL, { method: "GET", mode: "cors" })
      .then(function (r) { if (!r.ok) throw new Error("indisponible"); return r.json(); })
      .then(function (d) { if (!d || !d.jeton) throw new Error("indisponible"); jeton = d.jeton; form.hidden = false; if (secours) secours.hidden = true; })
      .catch(montrerSecours);

    var regles = {
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); },
      sujet: function (v) { return v !== ""; },
      message: function (v) { return v.trim().length >= 10 && v.length <= 3000; }
    };
    function verifier(nom) {
      var champ = form.elements[nom];
      var ok = regles[nom](champ.value);
      champ.setAttribute("aria-invalid", ok ? "false" : "true");
      document.getElementById("cf-" + nom + "-err").hidden = ok;
      return ok;
    }
    // Revalidation pendant la saisie (et non à la sortie du champ) : un message d'erreur qui disparaît au moment
    // du clic décalerait le bouton « Envoyer » sous le doigt.
    ["email", "sujet", "message"].forEach(function (nom) {
      var champ = form.elements[nom];
      function revoir() { if (champ.getAttribute("aria-invalid") === "true") verifier(nom); }
      champ.addEventListener("input", revoir);
      champ.addEventListener("change", revoir);
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var erreurs = ["email", "sujet", "message"].filter(function (n) { return !verifier(n); });
      if (erreurs.length) { form.elements[erreurs[0]].focus(); dire("Merci de corriger les champs signalés.", false); return; }
      bouton.disabled = true;
      dire("Envoi en cours…", true);
      fetch(CONTACT_URL, {
        method: "POST", mode: "cors", headers: { "content-type": "application/json" },
        body: JSON.stringify({
          nom: form.elements.nom.value, email: form.elements.email.value, sujet: form.elements.sujet.value,
          message: form.elements.message.value, site_web: form.elements.site_web.value, jeton: jeton
        })
      })
        .then(function (r) { if (!r.ok) throw new Error("envoi"); return r.json(); })
        .then(function () {
          form.reset();
          dire("Merci, votre message est bien parti. Vous allez recevoir un accusé de réception par email.", true);
        })
        .catch(function () { dire("Le message n'a pas pu partir. " + SECOURS, false); })
        .then(function () { bouton.disabled = false; });
    });
  })();
})();
