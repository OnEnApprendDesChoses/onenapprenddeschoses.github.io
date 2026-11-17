---
title: "Le député virtuel, résurrection d'une idée de 2016 grâce aux LLM"
description: "En 2016, l'idée d'un député virtuel butait sur l'accès aux données législatives. Dix ans plus tard, l'open data de l'Assemblée nationale et les LLM rendent le pipeline faisable : extraction, vérification, questions de compréhension."
pubDate: 2026-11-17
lang: fr
tags: [side-project, llm, mistral, open-data]
translationKey: depute-virtuel
---

*Partie 1 : l'histoire et l'idée. Partie 2 : la technique. Deux parties, deux publics, lisez ce qui vous intéresse.*

---

## Partie 1 : une idée de démocratie vieille de dix ans

Il y a environ dix ans, j'avais une idée que j'appelais « le député virtuel ». Le principe : permettre à n'importe qui de faire ce que fait un député, voter sur les propositions de loi, proposer des amendements, mais avec une condition que je trouvais (et trouve toujours) essentielle : **prouver qu'on a lu et compris le texte avant de débattre**. Concrètement, chaque participant devait écrire quelques questions sur la proposition de loi et répondre à celles des autres. Une validation de compréhension par les pairs.

L'idée ne visait pas la monétisation. C'était une idée de démocratie : on ne peut débattre que de ce qu'on a compris.

Nous avons abandonné, pour une raison très concrète : à l'époque, extraire automatiquement les propositions de loi et leurs amendements était un enfer. Pas d'open data utilisable, du scraping fragile, des documents introuvables. Le cœur du produit était ingérable techniquement pour une petite équipe.

L'idée a survécu à plusieurs réincarnations (formations, livres, jeux quiz), qui ont toutes échoué commercialement pour d'autres raisons. La leçon que j'en retiens : **la distribution avant le produit**.

### Pourquoi cette idée revient maintenant

Deux choses ont changé.

**Premier changement : le bloqueur technique a disparu.** L'Assemblée nationale publie aujourd'hui tout en open data, en XML et en JSON : propositions de loi, tous les amendements par texte et par lecture, dossiers législatifs, débats. Ce qui demandait des semaines de scraping fragile en 2016 se télécharge en quelques minutes.

**Second changement : les LLM.** En 2016, « comprendre un texte de loi » était réservé aux humains. Aujourd'hui, un LLM extrait, structure, résume et pose des questions de compréhension sur un texte de loi. La mécanique de validation par les pairs que j'avais imaginée peut être assistée par IA : génération de questions de compréhension sur chaque article, évaluation des réponses.

### Ce que je construis (et ce que je ne construis pas)

Précision importante : je ne reconstruis pas la plateforme de démocratie participative. Pas de comptes, pas de votes, pas de modération. **Une seule brique, démontrée de bout en bout** : un pipeline d'extraction et de vérification des documents législatifs, avec la génération de questions de compréhension comme brique finale.

C'est un projet de portfolio avant d'être un projet civique. Je suis développeuse senior en pleine spécialisation sur l'intégration de LLM, et je préfère démontrer une brique fiabilisée qu'une plateforme bâclée. Neutralité politique garantie : le pipeline extrait et structure, il ne prend jamais position.

---

## Partie 2 : la technique

### Le pipeline

1. **Ingestion** : téléchargement des jeux open data de l'Assemblée nationale (XML/JSON), avec cache local. Un document téléchargé n'est jamais re-téléchargé.
2. **Extraction** : structuration par LLM des propositions et amendements, en sortie JSON validée par schéma (articles, signataires, dispositif, exposé des motifs).
3. **Vérification** : règles de cohérence en code pur, zéro LLM. L'article visé par un amendement existe-t-il ? Le dispositif est-il vide ? Les numéros d'articles sont-ils dupliqués ?
4. **RAG** : recherche sémantique sur le corpus (« quels amendements touchent l'article 7 ? »), via PostgreSQL et pgvector.
5. **Compréhension** : génération de questions de compréhension sur chaque texte, évaluation des réponses. C'est la mécanique de 2016, assistée par IA.

### La règle d'or : le LLM extrait, le code vérifie

C'est le choix d'architecture le plus important du projet, et celui que je défendrai devant n'importe quel client : **aucune règle métier ne repose sur un LLM**. Le LLM est un extracteur brillant mais non déterministe ; la vérification est du code pur, testé unitairement, reproductible. Chaque règle (R1 : dispositif non vide, R2 : signataires présents, R3 : article visé existant, etc.) est testable sans appel réseau.

C'est aussi ma lecture du marché : les études de 2026 convergent, seuls 14 à 15 % des pilotes d'agents IA passent en production. Ce qui sépare les projets qui réussissent des autres n'est pas le modèle, c'est l'évaluation chiffrée, l'observabilité et les tests. Je construis la démo comme les 14 %.

### La stack, et pourquoi

| Brique | Choix | Pourquoi |
| --- | --- | --- |
| Langage | Python 3.12 | Le projet est un pipeline de documents, pas une app web ; écosystème data/IA inégalé |
| API | FastAPI | Standard, sortie OpenAPI gratuite, validation pydantic partout |
| LLM principal | Mistral (mistral-large) | Coût maîtrisé, hébergement UE, sortie structurée native via chat.parse |
| LLM secondaire | Anthropic Claude | Comparaison qualité/coût sur l'extraction difficile ; l'abstraction LLMProvider rend l'arbitrage possible sans réécriture |
| Base | PostgreSQL + pgvector | Une seule base pour le relationnel et les embeddings ; pas de base vectorielle dédiée à maintenir |
| Conteneurisation | Docker + docker compose | Reproductibilité, y compris pour les recruteurs qui clonent le repo |
| CI | GitHub Actions | Lint + tests à chaque push, job d'évaluation nocturne |
| Bonus | MCP server | Le pipeline exposé comme tools, branchable dans n'importe quel client MCP |

Deux détails qui comptent plus qu'ils n'en ont l'air : **temperature=0 partout** (on extrait, on ne crée pas), et **cache systématique** (un document déjà extrait ne repasse jamais par le LLM : coût et reproductibilité).

### Ce qu'il y aura à la fin

- Un repo public, documenté en FR/EN, avec un README honnête : pas de promesse, des métriques.
- Un **jeu d'évaluation** : environ 50 documents annotés à la main, et un chiffre de tête : taux d'erreur d'extraction, faux positifs de vérification. Ce chiffre est la valeur du projet. Un pipeline IA sans évaluation chiffrée n'est qu'une démo.
- Une démo filmée de 3 minutes : un texte de loi réel, ses amendements extraits et vérifiés, le quiz de compréhension.
- Deux corpus pilotes : la proposition de loi « travailler le 1er mai » (choisie pour sa neutralité et ses multiples lectures, qui alimentent la vérification de cohérence) et la proposition « médecins diplômés au Royaume-Uni avant le Brexit » (cycle complet jusqu'à la promulgation), pour montrer que le pipeline est corpus-agnostique.

### Ce que j'apprends en route

L'idée de 2016 échouait sur un problème d'accès aux données. Celle de 2026 échouera si elle néglige la fiabilité. Les LLM n'ont pas changé ce que je veux faire ; ils ont changé ce qui est faisable. La preuve, c'est ce pipeline.

*Code sur GitHub : [github.com/OnEnApprendDesChoses/depute-virtuel](https://github.com/OnEnApprendDesChoses/depute-virtuel)*
