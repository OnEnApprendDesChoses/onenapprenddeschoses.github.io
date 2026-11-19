---
title: "Automatiser son pipeline de code : review senior IA de bout en bout"
description: "Écrire, reviewer comme un senior, tester, pousser : comment j'ai automatisé tout le cycle de contribution sur un projet Python moderne, avec AGENTS.md, pre-commit, GitHub Actions, CodeRabbit et un agent qui corrige les reviews pendant la nuit."
pubDate: 2026-11-19
lang: fr
tags: [ia, devops, github, review, agents]
translationKey: pipeline-code-automatise
---

*Cet article raconte comment j'ai mis en place, sur mon projet « Député virtuel », un cycle écrire → reviewer → tester → pusher entièrement automatisé, où la review de code est faite par une IA qui fonctionne comme un vrai senior : elle ne commente pas le style, elle attrape les vrais problèmes. Et où un second agent corrige les remarques pendant que je dors.*

## La genèse, ou la leçon du commit fantôme

Tout est parti d'un incident. J'avais demandé à un agent de code (Mistral Code) de préparer mon projet sur GitHub. Résultat : il a poussé, en toute confiance, une « app de vote en Node.js avec IA simulée » qui n'avait rien à voir avec mon projet réel — un pipeline d'extraction de données législatives en Python. Mon projet existait dans ma tête et dans mes notes, pas dans les siennes.

La leçon : **un agent de code sans contexte n'est pas un développeur junior à former, c'est un senior très rapide avec une amnésie totale.** Il ne faut pas lui donner des instructions, il faut lui donner un cadre.

C'est de là qu'est né tout ce qui suit : le fichier de contexte d'abord, puis la review automatique, puis l'agent qui traite les reviews, chaque brique bâtissant sur la précédente.

## En langage naturel : comment le code s'écrit tout seul (et bien)

Ce qu'on a construit ressemble à une petite chaîne de montage où je n'ai plus que deux postes : au début (les choix) et à la fin (le contrôle final).

### Étape 1 — Écrire : le fichier « contexte » qui change tout

Avant toute automatisation, j'ai déposé à la racine du repo un fichier AGENTS.md. Son rôle est simple : n'importe quel agent de code qui arrive sur le projet doit le lire avant de toucher au code. Ce fichier décrit ce qu'est le projet (une démo portfolio d'extraction de documents législatifs, pas une plateforme de vote), la pile technique obligatoire, la structure du code, les conventions de test, et surtout une liste de choses interdites — pas de scraping HTML, pas de comptes utilisateurs, pas de réinvention du projet.

Concrètement, ce fichier est le seul vrai travail humain non automatisable du pipeline. J'y décris mon intention, et tout le reste s'aligne dessus. Depuis qu'il existe, plus aucune « app fantôme » n'atterrit sur la branche principale.

### Étape 2 — Contrôler en local : les vérifications avant chaque commit

Deuxième brique : un petit outil appelé pre-commit qui bloque un commit si le code ne respecte pas les règles de qualité et de sécurité. C'est local, sur ma machine, et ça prend deux secondes. Il vérifie la mise en forme, quelques règles de propreté, et surtout que je n'ai pas laissé une clé API oubliée dans un fichier.

L'intérêt : ce genre d'erreur partait avant en review — que ce soit une review humaine (le temps de quelqu'un) ou une review IA (du budget d'erreurs). Maintenant, ça n'atteint même plus le repo.

### Étape 3 — Tester et construire : les vérifications sur GitHub

À chaque fois qu'une proposition de modification (une PR) est ouverte, GitHub lance automatiquement une batterie de vérifications dans un environnement propre, indépendant de ma machine. Ce qui passe chez moi doit passer n'importe où. Ces vérifications contrôlent la qualité du style, exécutent tous les tests, construisent l'image Docker (pour prouver que le projet peut partir en prod) et scannent tout l'historique des commits de la PR pour vérifier qu'aucun secret ne s'est glissé quelque part.

### Étape 4 — Reviewer : le senior IA qui commente chaque PR

C'est le cœur de l'article. J'ai installé CodeRabbit, un reviewer IA qui se branche sur GitHub et relit chaque PR comme le ferait un bon senior. Un bon senior, ça ne veut pas dire quelqu'un qui râle sur les espaces : c'est quelqu'un qui regarde l'intention, détecte les vrais problèmes de logique et de sécurité, et signale précisément là où c'est cassé.

La découverte la plus intéressante : un reviewer IA sans règles devient vite générique et pénible (beaucoup de bruit, de la fatigue d'alerte). J'ai donc écrit mes standards de review en français — bloquant vs acceptable — et je les ai câblés dans sa configuration. Résultat : il suit mes règles, et comme tout vit dans le repo, la qualité fait partie du projet au même titre que le code. Mon premier essai a été convaincant : la review a relevé trois problèmes réels (un câblage de configuration manqué, une faille dans un scan de sécurité, une divergence de versions entre deux outils). Deux ont été corrigés par l'agent de l'étape suivante.

### Étape 5 — Corriger : l'agent qui traite les reviews pendant la nuit

Dernière brique, la plus satisfaisante. Une tâche planifiée tourne chaque matin : elle lit les commentaires du reviewer IA sur les PR ouvertes, vérifie chacun contre mes standards (une review IA a aussi des faux positifs), prépare les correctifs, les pousse sur la branche concernée, et répond dans les fils de discussion pour expliquer ce qui a été corrigé ou refusé.

Avec des garde-fous stricts : jamais de merge, jamais de push sur la branche principale, jamais d'accès aux secrets. Le matin, je n'ai plus qu'un résumé : corrigé, rejeté, à relire.

### Ce qu'il me reste (et c'est voulu)

Mon poste à moi : ouvrir les PR (décisions de conception), relire les correctifs de l'agent du matin, fusionner, et maintenir le fichier de contexte à jour. Tout ce qui est mécanique (vérifier, corriger le style, documenter les correctifs) part à la machine. Ce qui reste humain, c'est l'intention et le jugement final. Ce n'est pas moins de qualité : c'est la même qualité, concentrée sur les moments où mon cerveau sert vraiment à quelque chose.

## La version technique : la stack, brique par brique

Pour celles et ceux qui veulent reproduire ça. Mon projet : un pipeline Python/FastAPI (extraction de documents législatifs open data par LLM), repo public sur GitHub.

### Le socle du projet

- **Python 3.12 + uv** : gestion de dépendances rapide et reproductible (fichier `uv.lock` committé, tout le monde a exactement les mêmes versions).
- **FastAPI + pydantic v2** : l'API et la validation stricte des sorties de modèles. Chez moi, une sortie LLM qui ne passe pas la validation pydantic n'existe pas : elle est refusée à la frontière, jamais laissée circuler en dict approximatif.
- **Docker** : le projet tourne en conteneur, y compris en CI.

### Les briques du pipeline d'automatisation

**1. AGENTS.md, le contrat de contexte.** Un fichier Markdown à la racine du repo, format devenu une convention comprise par les agents de code (Mistral Code, Copilot, Claude Code le lisent). Contenu : périmètre du projet, stack obligatoire, arborescence, commandes exactes pour builder, linter et tester, règles de contribution (branche + PR obligatoire, test de non-régression sur fixtures réelles pour tout changement de prompt LLM). Comptez une demi-journée pour bien le rédiger, puis dix minutes de maintenance quand les conventions évoluent.

**2. pre-commit, l'hygiène locale.** Un gestionnaire de hooks Git qui exécute des vérifications à chaque `git commit` et refuse le commit si quelque chose cloche :

- **ruff** (lint + format) : le standard Python moderne, quasi instantané, réglable dans `pyproject.toml`. Détail qui compte : la version du hook local doit être épinglée à la même version que celle de la CI — c'est exactement ce que ma review IA a signalé (deux versions de ruff pouvaient diverger sur certaines règles). Corrigé en alignant les versions.
- **gitleaks** : scanner de secrets (clés API, tokens) sur ce qui est commité. Tolérance zéro : un secret poussé sur un repo public est une fuite définitive, l'historique Git s'en souvient pour toujours.
- Des hooks d'hygiène : espaces de fin de ligne, YAML valides, conflits de merge oubliés, fichiers trop volumineux.

**3. GitHub Actions, la CI.** Deux workflows versionnés dans `.github/workflows/` :

- `ci.yml` (chaque PR et chaque push sur main) : installation des dépendances via uv, lint ruff sur `src`/`tests`/`eval`, tests pytest, et **mypy** en vérification de typage. Détail honnête : mypy n'est pas encore une dev-dependency du projet, donc le job tourne en « advisory » (`continue-on-error: true`) — il rapporte les problèmes sans bloquer la fusion. Quand mypy sera intégré proprement, retirer cette seule ligne le rend bloquant. C'est exactement le genre de transition progressive qu'une CI bien conçue permet.
- `quality.yml` (complémentaire) : **build de l'image Docker** (si le Dockerfile casse, la PR ne passe pas) et **scan de secrets Gitleaks sur toute la plage de commits** de la PR. J'avais d'abord utilisé l'action GitHub officielle, mais la review IA a signalé qu'elle ne scannait que les 30 premiers commits d'une PR par défaut. Corrigé : j'exécute maintenant l'image Docker officielle épinglée (`v8.24.3`) sur la plage `base.sha..head.sha`, plus un scan de snapshot sur les push main. Une vraie faille attrapée par une review, ça valait le détour.

**4. CodeRabbit, la review IA senior.** Une application GitHub, qui s'installe depuis leur site en deux minutes. **Gratuit pour les repos publics** (les plans payants ne concernent que les repos privés). Ce qui fait la différence entre « gadget bruyant » et « review utile », c'est la personnalisation :

- `.coderabbit.yaml` : profil « assertif », langue française, chemins exclus (`uv.lock`, rapports d'éval), et surtout des **instructions par dossier** — par exemple : « si une PR introduit un appel LLM dans le module de vérification déterministe, refuse-la » ou « un prompt modifié sans test golden est bloquant ».
- `.github/review/code-review.md` : mes standards de review (bloquant vs à signaler), câblés via `knowledge_base.code_guidelines` avec `applyTo: "**/*"` pour s'appliquer à tout le dépôt. C'est ce qui transforme une review générique en review qui comprend *ce* projet.

Conseil de terrain : lancez la review IA en mode « advisory » d'abord (elle commente, elle ne bloque pas), le temps de filtrer les faux positifs, et seulement ensuite rendez-la requise via la protection de branche.

**5. L'agent du matin, la réponse automatique aux reviews.** Chaque matin, une tâche planifiée (dans mon cas, Vibe en tâche scheduled, avec accès à l'API GitHub) :

1. Liste les PR ouvertes via l'API GitHub.
2. Récupère les commentaires non résolus du bot CodeRabbit.
3. Lit AGENTS.md et le fichier de standards pour arbitrer : problème réel ou faux positif ?
4. Pousse les correctifs sur la branche de la PR (un seul commit `fix(review): …`), répond dans chaque thread pour expliquer la correction ou le refus.
5. Rédige un résumé : corrigé, rejeté, à relire.

Garde-fous codés dans le prompt de l'agent : interdiction de merger, interdiction de pousser sur main, interdiction de toucher aux secrets, arbitration des faux positifs par les fichiers du repo — l'agent a un juge de paix, pas juste son intuition.

**6. Branch protection, la serrure finale.** Sur GitHub en manuel : la branche main refuse tout push direct, exige une PR et que tous les checks CI passent. Même un humain pressé ne peut plus court-circuiter le pipeline.

## Le résultat

Le cycle complet, de bout en bout :

```text
Agent de code (lit AGENTS.md)
  → branche + PR
  → pre-commit local (ruff, gitleaks)
  → GitHub Actions (ruff, pytest, mypy, docker build, scan secrets)
  → review senior CodeRabbit
  → agent du matin : corrige ou rejette chaque remarque
  → je relis, je merge
  (et si un check échoue : retour à l'agent de code)
```

Trois apprentissages à retenir :

1. **Le contexte avant l'outillage.** AGENTS.md, écrit en premier, a plus d'impact sur la qualité du code généré que n'importe quel outil de review. Un agent qui sait ce qu'il doit construire produit moins de bugs qu'un reviewer qui doit les attraper.
2. **La qualité doit vivre dans le repo.** Standards de review, configuration du reviewer, workflows CI : tout est versionné avec le code. Quiconque clone le repo reçoit la qualité avec.
3. **La review IA est excellente à condition de l'encadrer.** Sur mes deux premières PR, elle a trouvé quatre vrais problèmes et zéro remarque stylistique. Mais uniquement parce que ses règles sont les miennes, écrites noir sur blanc.

Prochaine étape : terminer le jeu d'évaluation annoté (~50 documents) pour mesurer le taux d'erreur du pipeline LLM, et activer la protection de branche. Et après ? Un article sur comment faire écrire des tests unitaires par l'agent sans que ce soit du théâtre.

*Ce setup est en place sur le repo de mon projet « Député virtuel » (extraction et vérification des propositions de loi françaises via l'open data de l'Assemblée nationale). Toute la configuration est visible dans le repo, n'hésitez pas à piquer les fichiers. Si vous testez ce genre de pipeline chez vous, je suis curieuse de savoir ce que votre reviewer IA attrape — et ce qu'il rate.*
