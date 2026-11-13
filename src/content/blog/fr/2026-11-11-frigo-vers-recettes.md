---
title: "De « qu'est-ce que je mange ? » à une app : Frigo → Recettes"
description: "Genèse de mon app de suggestions de recettes à partir du contenu du frigo : l'idée, le prototype, la stack choisie."
pubDate: 2026-11-11
lang: fr
tags: [side-project, react, ia]
translationKey: frigo-vers-recettes
---

L'idée traînait depuis longtemps : j'aime cuisiner, mais je manque souvent d'inspiration,
et les apps de recettes classiques partent d'une recherche, pas de mon frigo.

## Le vrai problème

« Qu'est-ce que je mange ce soir avec ce que j'ai ? » est une question quotidienne.
Y répondre demande de croiser trois choses : le contenu du frigo, le temps disponible,
et mes goûts. Aucune app grand public ne fait ce croisement proprement.

## Ce que je veux

1. **Je saisis ce que j'ai dans mon frigo** (et l'app le retient d'une fois sur l'autre)
2. **Je fixe mes contraintes** : temps dispo, régime (végé, sans gluten...), nombre de jours à couvrir
3. **Je fournis mes inspirations** : des sites, des chefs, des recettes que j'aime
4. **L'app me propose** des recettes qui utilisent mes ingrédients, dans un style qui me ressemble
5. **Je note ce que je cuisine**, et l'app s'en souvient

## Le prototype

Première étape : une maquette interactive pour valider le parcours, avant tout code sérieux.
Résultat en quelques heures, avec parcours complet : frigo → contraintes → suggestions → notation.

Le déclic : la page de suggestions doit se mériter. On remplit son frigo, on tape
« Trouver mes recettes », et les suggestions arrivent classées selon les ingrédients qu'on possède.

## La stack

- **Front** : Vite + React + TypeScript
- **API** : Express + TypeScript + SQLite
- **Moteur** : un LLM (API Mistral) qui reçoit frigo + contraintes + extraits de mes recettes
  importées, et improvise dans le style que j'aime — un petit RAG maison

L'import des recettes depuis les sites (Marmiton & co.) passe par le balisage schema.org que ces
sites publient déjà : pas besoin de scraper au cordeau pour la majorité des recettes.

## La suite

Le starter tourne. Prochaine étape : brancher une vraie clé API, déployer sur Vercel,
et importer mes premiers répertoires de recettes. On en apprend des choses, et je vous raconte ça ici.

> **Mise à jour (13 novembre)** : le plan Vercel a sauté ! Dans [comment j'ai choisi ma stack](/blog/2026-11-13-comment-jai-choisi-ma-stack),
> je raconte le raisonnement qui a tout fait basculer vers une app managée chez Mistral.
> Et l'app est [en ligne](/blog/2026-11-13-deployer-sans-quitter-windows) depuis.
