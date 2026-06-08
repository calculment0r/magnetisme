# Magnétisme pour l'image — site de révision

Site statique (HTML/CSS/JS), sans build ni dépendance. Thème ShowRunner.
Mobile d'abord (iPhone), soigné aussi sur ordinateur. Aucun emoji.

## Ouvrir en local
Double-cliquer sur `index.html` (tout fonctionne en `file://`).
Ou, pour un aperçu serveur : `node server.js` à la racine du projet, puis http://localhost:8099

## Structure
- `index.html` — accueil (hub) : la « colonne vertébrale » (2 phrases) + les 7 cours + le menu.
- `cours-1.html` … `cours-7.html` — une page par cours (1 et 2 faits ; 3 à 7 à venir).
- `css/style.css` — thème, mise en page, menu, hub.
- `js/engine.js` — moteur partagé des schémas (canvas, animation à la demande). Exposé via `window.MAG`.
- `js/course-1.js`, `js/course-2.js` — les schémas propres à chaque cours.
- `js/ui.js` — anneaux du hero, progression, quiz, glossaire (partagé).
- `js/site.js` — menu + registre des cours (partagé sur toutes les pages).

## Ajouter un cours (gabarit)
1. Copier `cours-2.html` vers `cours-N.html`, adapter le contenu, le `data-page`, le badge de niveau.
2. Créer `js/course-N.js` avec ses schémas (réutilise `window.MAG`).
3. Dans `js/site.js`, passer l'entrée du cours à `ready:true`.
4. Dans `index.html`, transformer la carte `is-soon` en lien.

## Niveaux (code couleur, d'après le dossier pédagogique)
- VERT = socle lycée (cours 1 à 3) — priorité.
- ORANGE = post-bac BTS/STI2D (cours 4 à 6, et le 7 en qualitatif).
- ROUGE = plafond (rester intuitif).

## Mettre en ligne (GitHub Pages, comme ShowRunner)
Déposer le contenu de `site/` dans un dépôt, activer Pages sur la branche `main` (racine `/`).
