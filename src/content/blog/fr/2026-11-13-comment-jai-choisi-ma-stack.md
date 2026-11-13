---
title: "Comment j'ai choisi ma stack (ou : pourquoi j'ai renoncé à Vercel en route)"
description: "Front, API, base de données, LLM : le raisonnement derrière chaque brique de Frigo → Recettes, et pourquoi « un service de plus » est rarement une bonne réponse."
pubDate: 2026-11-13
lang: fr
tags: [side-project, astro, mistral, github]
translationKey: comment-jai-choisi-ma-stack
---

Mon premier billet se terminait sur un plan bien net : Vite + Express + SQLite,
déploiement sur Vercel, brancher une clé API, et en ligne. Quelques jours plus
tard, ce plan est aux oubliettes. Pas parce qu'il était mauvais, mais parce
que réfléchir à fond à chaque brique l'a fait tomber, domino après domino.
Voici le raisonnement complet, parce que c'est lui qui a tout décidé.

## Le point de départ : mes critères, pas les meilleures technologies du monde

Un side-project solo n'a pas les mêmes besoins qu'une équipe. Mes critères,
dans l'ordre :

1. **Je dois comprendre chaque brique.** Ce que je ne comprends pas, je ne
   sais pas le déboguer à 23 heures.
2. **Le moins de services externes possible.** Chaque service de plus est une
   chose de plus qui peut planter, se facturer ou changer de prix.
3. **Le moteur LLM intégré naturellement.** Mon app a un cerveau artificiel
   au centre ; tout ce qui simplifie sa connexion vaut de l'or.

## Domino 1 : la clé API du LLM

Avec un serveur Express classique, la clé Mistral qui génère les recettes
vit dans les variables d'environnement de l'hébergeur. Ça marche. Mais ça
veut dire gérer la clé, s'assurer qu'elle ne fuit nulle part, comprendre
la configuration de sécurité de l'hébergeur. En regardant la plateforme
Mistral, j'ai découvert l'option « app managée » : le moteur LLM y est
natif, fourni par un petit toolkit (`mistral_client`) qui parle au modèle
sans que je gère d'authentification dans mon code. Domino un : l'API
Express s'efface au profit d'une API FastAPI intégrée à la plateforme.

## Domino 2 : l'éclatement de l'infrastructure

Le plan Vercel impliquait trois prestataires : front + API chez Vercel,
base de données chez Supabase, LLM chez Mistral. Trois dashboards, trois
facturations, trois documentations, trois politiques de confidentialité.
L'app managée réunit les trois : le front, l'API et la base PostgreSQL
se déploient d'un seul geste, la base est provisionnée automatiquement.
Ma future base SQLite promettait la simplicité ; une Postgres managée
que je n'ai pas à installer l'est tout autant, et elle est déjà là.

## Domino 3 : Next.js (ou le framework qu'on ne m'imposera pas)

Vercel pousse très fort vers Next.js, son framework maison, qui est devenu
la voie royale sur leur plateforme. Je ne le connais pas. Apprendre un
framework en même temps qu'un déploiement, une base de données et du LLM ?
Trop de nouveautés d'un coup, et le critère 1 tombait à l'eau. L'app
managée utilise des briques standard : FastAPI, que je connais, et
TanStack Start pour le front. Rien d'exotique, rien de propriétaire.

## Et le blog, alors ? Astro, et la même règle

Pour ce blog, j'avais le choix : Vercel y aurait été correct (site statique,
rien de sensible). Mais la règle du « un service de plus » s'applique
pareil : GitHub Pages héberge des sites statiques gratuitement, inclus
dans ce que je possède déjà. Un compte de moins, une carte bancaire de
moins. Même logique, deux contextes.

Au passage, Astro : un générateur de sites qui fabrique des pages HTML
statiques à partir de mes fichiers Markdown. Pas de serveur à faire
tourner, pas de JavaScript superflu envoyé au visiteur, juste des pages
rapides. Les sites de contenu en sont ravis.

## La règle à retenir

Vercel n'est pas « mauvais ». C'est un excellent hébergeur, et pour
beaucoup de projets je le recommanderais. Mais pour **ce** projet, à
**ce** moment, avec **mes** critères, chaque brique pointait ailleurs.
On ne choisit pas une stack en collectionnant les outils à la mode :
on la choisit en listant ses contraintes, et en écoutant celles qui
font tomber les dominos. J'en ai appris, des choses.
